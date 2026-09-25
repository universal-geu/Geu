import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SiteImages } from "@/lib/image-slots";

export type { ImageSlot, SiteImages } from "@/lib/image-slots";
export { IMAGE_SLOTS, resolveImage } from "@/lib/image-slots";

// getSiteImages() and getSiteImageLinks() both read every row of the same
// table and just shape it differently — every brand page called both,
// doubling an identical query. Sharing one cache()'d row fetch collapses
// that back into a single DB round trip per request.
const getSiteImageRows = cache(async function getSiteImageRows() {
  if (!prisma) return [];
  try {
    return await prisma.siteImage.findMany();
  } catch {
    return [];
  }
});

export async function getSiteImages(): Promise<SiteImages> {
  const rows = await getSiteImageRows();
  return Object.fromEntries(rows.map((r) => [r.key, r.url]));
}

export async function getSiteImageLinks(): Promise<SiteImages> {
  const rows = await getSiteImageRows();
  return Object.fromEntries(
    rows.filter((r) => r.link?.trim()).map((r) => [r.key, r.link as string]),
  );
}

export function resolveLink(
  key: string,
  siteImageLinks: SiteImages,
  fallbackHref: string,
): string {
  return siteImageLinks[key]?.trim() || fallbackHref;
}
