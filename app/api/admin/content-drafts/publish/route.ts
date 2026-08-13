import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { IMAGE_SLOTS } from "@/lib/image-slots";
import { TEXT_SLOTS } from "@/lib/text-slots";
import { COLOR_SLOTS } from "@/lib/color-slots";

function labelFor(key: string, kind: string) {
  if (kind === "image") return IMAGE_SLOTS.find((s) => s.key === key)?.label ?? key;
  if (kind === "color") return COLOR_SLOTS.find((s) => s.key === key)?.label ?? key;
  return TEXT_SLOTS.find((s) => s.key === key)?.label ?? key;
}

function defaultSettingValue(key: string) {
  return (
    TEXT_SLOTS.find((s) => s.key === key)?.defaultValue ??
    COLOR_SLOTS.find((s) => s.key === key)?.defaultValue ??
    ""
  );
}

export async function POST() {
  try {
    const admin = await requireAdminUser();
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });
    const db = prisma;

    const drafts = await db.siteContentDraft.findMany({
      where: { OR: [{ division: admin.division }, { division: "Global" }] },
    });

    if (drafts.length === 0) {
      return Response.json({ ok: true, published: [] });
    }

    const imageKeys = drafts.filter((d) => d.kind === "image").map((d) => d.key);
    const textKeys = drafts.filter((d) => d.kind !== "image").map((d) => d.key);

    const [previousImages, previousTexts] = await Promise.all([
      imageKeys.length ? db.siteImage.findMany({ where: { key: { in: imageKeys } } }) : [],
      textKeys.length ? db.siteSetting.findMany({ where: { key: { in: textKeys } } }) : [],
    ]);
    const previousImageMap = new Map(previousImages.map((r) => [r.key, { url: r.url, link: r.link }]));
    const previousTextMap = new Map(previousTexts.map((r) => [r.key, r.value]));

    // A key may never have had a live override before (it was just showing
    // the slot's built-in default) — snapshot that default too, so restoring
    // this version later actually reverts to something instead of no-op'ing.
    const snapshot = {
      images: Object.fromEntries(
        imageKeys.map((key) => [
          key,
          previousImageMap.get(key) ?? {
            url: IMAGE_SLOTS.find((s) => s.key === key)?.defaultSrc ?? "",
            link: null,
          },
        ]),
      ),
      texts: Object.fromEntries(
        textKeys.map((key) => [key, previousTextMap.get(key) ?? defaultSettingValue(key)]),
      ),
    };

    await db.$transaction([
      ...drafts
        .filter((d) => d.kind === "image")
        .map((d) =>
          db.siteImage.upsert({
            where: { key: d.key },
            update: { url: d.value, link: d.link },
            create: { key: d.key, url: d.value, link: d.link },
          }),
        ),
      ...drafts
        .filter((d) => d.kind !== "image")
        .map((d) =>
          db.siteSetting.upsert({
            where: { key: d.key },
            update: { value: d.value },
            create: { key: d.key, value: d.value },
          }),
        ),
      db.siteContentVersion.create({
        data: {
          createdBy: admin.fullName,
          division: admin.division,
          label: `Publicación · ${admin.division}`,
          snapshot,
        },
      }),
      db.siteContentDraft.deleteMany({
        where: { key: { in: drafts.map((d) => d.key) } },
      }),
    ]);

    return Response.json({
      ok: true,
      published: drafts.map((d) => ({ key: d.key, kind: d.kind, label: labelFor(d.key, d.kind) })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
