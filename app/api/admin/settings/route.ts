import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { WHATSAPP_NUMBER_KEY } from "@/lib/site-settings";

export async function GET() {
  try {
    await requireAdminUser("settings");
    if (!prisma) return Response.json({ whatsappNumber: "" });
    const row = await prisma.siteSetting.findUnique({ where: { key: WHATSAPP_NUMBER_KEY } });
    return Response.json({ whatsappNumber: row?.value ?? "" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminUser("settings");
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

    const body = (await request.json()) as { whatsappNumber?: string };
    const digitsOnly = (body.whatsappNumber ?? "").replace(/\D/g, "");

    if (body.whatsappNumber && !digitsOnly) {
      return Response.json({ error: "Número inválido." }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key: WHATSAPP_NUMBER_KEY },
      update: { value: digitsOnly },
      create: { key: WHATSAPP_NUMBER_KEY, value: digitsOnly },
    });
    return Response.json({ whatsappNumber: setting.value });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
