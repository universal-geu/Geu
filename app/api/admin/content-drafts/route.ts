import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { IMAGE_SLOTS } from "@/lib/image-slots";
import { TEXT_SLOTS } from "@/lib/text-slots";
import { COLOR_SLOTS } from "@/lib/color-slots";

export async function GET() {
  try {
    await requireAdminUser();
    if (!prisma) return Response.json({ drafts: [] });
    const drafts = await prisma.siteContentDraft.findMany();
    return Response.json({ drafts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

    const body = (await request.json()) as {
      key?: string;
      kind?: "image" | "text" | "color";
      value?: string;
      link?: string;
    };
    if (!body.key || !body.kind) {
      return Response.json({ error: "key y kind son requeridos." }, { status: 400 });
    }

    if (body.kind === "image") {
      const slot = IMAGE_SLOTS.find((s) => s.key === body.key);
      if (!slot) return Response.json({ error: "key no válida." }, { status: 400 });
      if (slot.division !== admin.division) {
        return Response.json({ error: "No autorizado para esta división." }, { status: 403 });
      }

      const existing = await prisma.siteContentDraft.findUnique({ where: { key: body.key } });
      const value = body.value ?? existing?.value ?? slot.defaultSrc;
      const link = body.link !== undefined ? body.link.trim() || null : (existing?.link ?? null);

      // A new file was uploaded (not just the link field being edited): archive
      // whatever image/video it's replacing so the admin can look back and
      // reuse a recent version instead of only being able to undo once.
      if (body.value !== undefined && body.value !== existing?.value) {
        const previousUrl = existing?.value ?? (await prisma.siteImage.findUnique({ where: { key: body.key } }))?.url;
        if (previousUrl && previousUrl !== value) {
          await prisma.siteImageHistory.create({ data: { key: body.key, url: previousUrl } });
          const excess = await prisma.siteImageHistory.findMany({
            where: { key: body.key },
            orderBy: { createdAt: "desc" },
            skip: 3,
            select: { id: true },
          });
          if (excess.length) {
            await prisma.siteImageHistory.deleteMany({ where: { id: { in: excess.map((e) => e.id) } } });
          }
        }
      }

      const draft = await prisma.siteContentDraft.upsert({
        where: { key: body.key },
        update: { value, link, updatedBy: admin.fullName },
        create: {
          key: body.key,
          kind: "image",
          division: slot.division,
          value,
          link,
          updatedBy: admin.fullName,
        },
      });
      return Response.json({ draft });
    }

    if (body.kind === "text") {
      const slot = TEXT_SLOTS.find((s) => s.key === body.key);
      if (!slot) return Response.json({ error: "key no válida." }, { status: 400 });
      if (slot.division !== admin.division && slot.division !== "Global") {
        return Response.json({ error: "No autorizado para esta división." }, { status: 403 });
      }

      const value = (body.value ?? "").trim();
      const draft = await prisma.siteContentDraft.upsert({
        where: { key: body.key },
        update: { value, updatedBy: admin.fullName },
        create: {
          key: body.key,
          kind: "text",
          division: slot.division,
          value,
          updatedBy: admin.fullName,
        },
      });
      return Response.json({ draft });
    }

    if (body.kind === "color") {
      const slot = COLOR_SLOTS.find((s) => s.key === body.key);
      if (!slot) return Response.json({ error: "key no válida." }, { status: 400 });
      if (slot.division !== admin.division) {
        return Response.json({ error: "No autorizado para esta división." }, { status: 403 });
      }

      const value = (body.value ?? "").trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(value)) {
        return Response.json({ error: "Color no válido. Usa formato #RRGGBB." }, { status: 400 });
      }
      const draft = await prisma.siteContentDraft.upsert({
        where: { key: body.key },
        update: { value, updatedBy: admin.fullName },
        create: {
          key: body.key,
          kind: "color",
          division: slot.division,
          value,
          updatedBy: admin.fullName,
        },
      });
      return Response.json({ draft });
    }

    return Response.json({ error: "kind no válido." }, { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
