import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { COLOR_SLOTS } from "@/lib/color-slots";

export async function GET() {
  try {
    await requireAdminUser("settings");
    if (!prisma) return Response.json({ colors: {} });
    const rows = await prisma.siteSetting.findMany();
    const slotKeys = new Set(COLOR_SLOTS.map((slot) => slot.key));
    const colors = Object.fromEntries(rows.filter((r) => slotKeys.has(r.key)).map((r) => [r.key, r.value]));
    return Response.json({ colors });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
