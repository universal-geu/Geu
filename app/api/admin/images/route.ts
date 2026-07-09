import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { IMAGE_SLOTS } from "@/lib/site-images";

export async function GET() {
  try {
    await requireAdminUser();
    if (!prisma) return Response.json({ images: {} });
    const rows = await prisma.siteImage.findMany();
    const images = Object.fromEntries(rows.map((r) => [r.key, r.url]));
    return Response.json({ images });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

    const body = (await request.json()) as { key?: string; url?: string };
    if (!body.key || !body.url) return Response.json({ error: "key y url son requeridos." }, { status: 400 });
    const slot = IMAGE_SLOTS.find((s) => s.key === body.key);
    if (!slot) return Response.json({ error: "key no válida." }, { status: 400 });
    if (slot.division !== admin.division) {
      return Response.json({ error: "No autorizado para esta división." }, { status: 403 });
    }

    const image = await prisma.siteImage.upsert({
      where: { key: body.key },
      update: { url: body.url },
      create: { key: body.key, url: body.url },
    });
    return Response.json({ image });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
