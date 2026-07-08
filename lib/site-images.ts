import { prisma } from "@/lib/prisma";
import type { SiteImages } from "@/lib/image-slots";

export type { ImageSlot, SiteImages } from "@/lib/image-slots";
export { IMAGE_SLOTS, resolveImage } from "@/lib/image-slots";

export async function getSiteImages(): Promise<SiteImages> {
  if (!prisma) return {};
  try {
    const rows = await prisma.siteImage.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.url]));
  } catch {
    return {};
  }
}
