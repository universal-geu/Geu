import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import { LIVE_TEXT_EDIT_COOKIE, LIVE_TEXT_EDIT_FLAG } from "@/lib/live-text-markers";
import type { SiteTexts } from "@/lib/text-slots";

export type { SiteTexts } from "@/lib/text-slots";
export { resolveText } from "@/lib/text-slots";

// Division of the admin currently using "Editar textos en tiempo real", or
// null for everyone else (the mode cookie alone isn't trusted).
export const getLiveTextEditDivision = cache(async function getLiveTextEditDivision() {
  const cookieStore = await cookies();
  if (!cookieStore.get(LIVE_TEXT_EDIT_COOKIE)?.value) return null;
  const session = await getSessionFromCookies();
  return session?.role === "ADMIN" && session.division ? session.division : null;
});

export const getSiteTexts = cache(async function getSiteTexts(): Promise<SiteTexts> {
  if (!prisma) return {};
  try {
    const rows = await prisma.siteSetting.findMany();
    const texts: SiteTexts = Object.fromEntries(rows.map((r) => [r.key, r.value]));

    // In live edit mode the admin sees their unpublished text drafts too, and
    // resolveText tags every editable text with an invisible marker.
    const liveEditDivision = await getLiveTextEditDivision();
    if (liveEditDivision) {
      const drafts = await prisma.siteContentDraft.findMany({
        where: { kind: "text", division: { in: [liveEditDivision, "Global"] } },
      });
      for (const draft of drafts) texts[draft.key] = draft.value;
      texts[LIVE_TEXT_EDIT_FLAG] = liveEditDivision;
    }

    return texts;
  } catch {
    return {};
  }
});
