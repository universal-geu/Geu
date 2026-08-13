import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdminUser();
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });
    const db = prisma;

    const { id } = await params;
    const version = await db.siteContentVersion.findUnique({ where: { id } });
    if (!version || version.division !== admin.division) {
      return Response.json({ error: "Versión no encontrada." }, { status: 404 });
    }

    const snapshot = version.snapshot as {
      images?: Record<string, { url: string; link: string | null }>;
      texts?: Record<string, string>;
    };
    const imageEntries = Object.entries(snapshot.images ?? {});
    const textEntries = Object.entries(snapshot.texts ?? {});
    const restoredKeys = [...imageEntries.map(([k]) => k), ...textEntries.map(([k]) => k)];

    const [currentImages, currentTexts] = await Promise.all([
      imageEntries.length
        ? db.siteImage.findMany({ where: { key: { in: imageEntries.map(([k]) => k) } } })
        : [],
      textEntries.length
        ? db.siteSetting.findMany({ where: { key: { in: textEntries.map(([k]) => k) } } })
        : [],
    ]);

    const safetySnapshot = {
      images: Object.fromEntries(currentImages.map((r) => [r.key, { url: r.url, link: r.link }])),
      texts: Object.fromEntries(currentTexts.map((r) => [r.key, r.value])),
    };

    await db.$transaction([
      db.siteContentVersion.create({
        data: {
          createdBy: admin.fullName,
          division: admin.division,
          label: "Antes de restaurar",
          snapshot: safetySnapshot,
        },
      }),
      ...imageEntries.map(([key, value]) =>
        db.siteImage.upsert({
          where: { key },
          update: { url: value.url, link: value.link },
          create: { key, url: value.url, link: value.link },
        }),
      ),
      ...textEntries.map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
      db.siteContentDraft.deleteMany({ where: { key: { in: restoredKeys } } }),
    ]);

    return Response.json({ ok: true, restoredCount: restoredKeys.length });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
