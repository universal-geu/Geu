import { prisma } from "@/lib/prisma";
import { COLOR_SLOTS } from "@/lib/color-slots";

export type { SiteColors } from "@/lib/color-slots";
export { COLOR_SLOTS, resolveColor } from "@/lib/color-slots";

export async function getSiteColors() {
  if (!prisma) return {};
  try {
    const rows = await prisma.siteSetting.findMany();
    const slotKeys = new Set(COLOR_SLOTS.map((s) => s.key));
    return Object.fromEntries(rows.filter((r) => slotKeys.has(r.key)).map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}
