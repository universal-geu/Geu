import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { TEXT_SLOTS } from "@/lib/text-slots";

export async function GET() {
  try {
    await requireAdminUser("settings");
    if (!prisma) return Response.json({ texts: {} });
    const rows = await prisma.siteSetting.findMany();
    const slotKeys = new Set(TEXT_SLOTS.map((slot) => slot.key));
    const texts = Object.fromEntries(rows.filter((r) => slotKeys.has(r.key)).map((r) => [r.key, r.value]));
    return Response.json({ texts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser("settings");
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

    const body = (await request.json()) as { key?: string; value?: string };
    if (!body.key) return Response.json({ error: "key es requerido." }, { status: 400 });
    if (!TEXT_SLOTS.some((slot) => slot.key === body.key)) {
      return Response.json({ error: "key no válida." }, { status: 400 });
    }

    const value = (body.value ?? "").trim();
    const setting = await prisma.siteSetting.upsert({
      where: { key: body.key },
      update: { value },
      create: { key: body.key, value },
    });
    return Response.json({ key: setting.key, value: setting.value });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
