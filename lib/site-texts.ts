import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { SiteTexts } from "@/lib/text-slots";

export type { SiteTexts } from "@/lib/text-slots";
export { resolveText } from "@/lib/text-slots";

export const getSiteTexts = cache(async function getSiteTexts(): Promise<SiteTexts> {
  if (!prisma) return {};
  try {
    const rows = await prisma.siteSetting.findMany();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
});
