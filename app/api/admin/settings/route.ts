import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { MASCOT_DIVISIONS, MASCOT_SCALE_DEFAULT, clampMascotScale } from "@/lib/divisions";
import {
  mascotEnabledKey,
  mascotScaleKey,
  salesModeKey,
  whatsappNumberKey,
  type CauchosSalesMode,
} from "@/lib/site-settings";

export async function GET() {
  try {
    const admin = await requireAdminUser("settings");
    if (!prisma) return Response.json({ whatsappNumber: "", cauchosSalesMode: "precios", mascotEnabled: true, mascotScale: MASCOT_SCALE_DEFAULT });
    const [whatsappRow, salesModeRow, mascotRow, mascotScaleRow] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: whatsappNumberKey(admin.division) } }),
      prisma.siteSetting.findUnique({ where: { key: salesModeKey(admin.division) } }),
      prisma.siteSetting.findUnique({ where: { key: mascotEnabledKey(admin.division) } }),
      prisma.siteSetting.findUnique({ where: { key: mascotScaleKey(admin.division) } }),
    ]);
    return Response.json({
      whatsappNumber: whatsappRow?.value ?? "",
      cauchosSalesMode: salesModeRow?.value === "whatsapp" ? "whatsapp" : "precios",
      mascotEnabled: mascotRow?.value !== "false",
      mascotScale: mascotScaleRow ? clampMascotScale(Number(mascotScaleRow.value)) : MASCOT_SCALE_DEFAULT,
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
      mascotEnabled?: boolean;
      mascotScale?: number;
    };

    if (body.mascotScale !== undefined) {
      if (typeof body.mascotScale !== "number" || !Number.isFinite(body.mascotScale)) {
        return Response.json({ error: "Tamaño inválido." }, { status: 400 });
      }
      if (!MASCOT_DIVISIONS.includes(admin.division)) {
        return Response.json({ error: "Esta unidad no tiene mascota." }, { status: 400 });
      }

      const key = mascotScaleKey(admin.division);
      const value = String(clampMascotScale(body.mascotScale));
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      return Response.json({ mascotScale: Number(setting.value) });
    }

    if (body.mascotEnabled !== undefined) {
      if (typeof body.mascotEnabled !== "boolean") {
        return Response.json({ error: "Valor inválido." }, { status: 400 });
      }
      if (!MASCOT_DIVISIONS.includes(admin.division)) {
        return Response.json({ error: "Esta unidad no tiene mascota." }, { status: 400 });
      }

      const key = mascotEnabledKey(admin.division);
      const value = body.mascotEnabled ? "true" : "false";
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      return Response.json({ mascotEnabled: setting.value !== "false" });
    }

    if (body.cauchosSalesMode !== undefined) {
      if (body.cauchosSalesMode !== "precios" && body.cauchosSalesMode !== "whatsapp") {
        return Response.json({ error: "Modo de venta inválido." }, { status: 400 });
      }

      const key = salesModeKey(admin.division);
      const setting = await prisma.siteSetting.upsert({
        where: { key },
        update: { value: body.cauchosSalesMode },
        create: { key, value: body.cauchosSalesMode },
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
