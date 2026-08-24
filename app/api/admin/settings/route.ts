import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  CAUCHOS_SALES_MODE_KEY,
  whatsappNumberKey,
  type CauchosSalesMode,
} from "@/lib/site-settings";

export async function GET() {
  try {
    const admin = await requireAdminUser("settings");
    if (!prisma) return Response.json({ whatsappNumber: "", cauchosSalesMode: "precios" });
    const [whatsappRow, salesModeRow] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: whatsappNumberKey(admin.division) } }),
      prisma.siteSetting.findUnique({ where: { key: CAUCHOS_SALES_MODE_KEY } }),
    ]);
    return Response.json({
      whatsappNumber: whatsappRow?.value ?? "",
      cauchosSalesMode: salesModeRow?.value === "whatsapp" ? "whatsapp" : "precios",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser("settings");
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

    const body = (await request.json()) as {
      whatsappNumber?: string;
      cauchosSalesMode?: CauchosSalesMode;
    };

    if (body.cauchosSalesMode !== undefined) {
      if (body.cauchosSalesMode !== "precios" && body.cauchosSalesMode !== "whatsapp") {
        return Response.json({ error: "Modo de venta inválido." }, { status: 400 });
      }

      const setting = await prisma.siteSetting.upsert({
        where: { key: CAUCHOS_SALES_MODE_KEY },
        update: { value: body.cauchosSalesMode },
        create: { key: CAUCHOS_SALES_MODE_KEY, value: body.cauchosSalesMode },
      });
      return Response.json({ cauchosSalesMode: setting.value });
    }

    const digitsOnly = (body.whatsappNumber ?? "").replace(/\D/g, "");

    if (body.whatsappNumber && !digitsOnly) {
      return Response.json({ error: "Número inválido." }, { status: 400 });
    }

    const key = whatsappNumberKey(admin.division);
    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: { value: digitsOnly },
      create: { key, value: digitsOnly },
    });
    return Response.json({ whatsappNumber: setting.value });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
