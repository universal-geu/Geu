import Image from "next/image";
import Link from "next/link";
import { resolveImage, type SiteImages } from "@/lib/site-images";

type PromoItem = {
  title: string;
  href: string;
  imageKey: string;
};

type OfferSectionProps = {
  accent: string;
  eyebrow: string;
  title: string;
  ctaHref: string;
  ctaLabel?: string;
  items: PromoItem[];
  siteImages: SiteImages;
  surface?: "light" | "dark";
  maxWidth?: string;
};

type FeaturedSectionProps = {
  title: string;
  items: PromoItem[];
  siteImages: SiteImages;
  surface?: "light" | "dark";
  compact?: boolean;
  maxWidth?: string;
};

type ClosingBannerProps = {
  imageKey: string;
  alt: string;
  siteImages: SiteImages;
  maxWidth?: string;
};

export function BrandOfferSection({
  accent,
  eyebrow,
  title,
  ctaHref,
  ctaLabel = "Ver todos",
  items,
  siteImages,
  surface = "light",
  maxWidth = "1500px",
}: OfferSectionProps) {
  const isDark = surface === "dark";

  return (
    <section className={isDark ? "border-b border-white/10 bg-black text-white" : "border-b border-slate-200 bg-white text-slate-950"}>
      <div className="mx-auto px-5 py-12 md:px-8" style={{ maxWidth }}>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: accent }}>
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
              {title}
            </h2>
          </div>
          <Link href={ctaHref} className="inline-flex rounded-full border px-5 py-3 text-sm font-black transition" style={{ borderColor: accent, color: accent }}>
            {ctaLabel}
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              aria-label={item.title}
              className="cauchos-offer-card group relative block aspect-[9/16] min-h-[430px] overflow-hidden rounded-[10px] border border-slate-200 bg-[#071225] shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
            >
              <Image
                src={resolveImage(item.imageKey, siteImages)}
                alt={item.title}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="cauchos-offer-image object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              <span className="cauchos-offer-shine pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-white/18 blur-xl" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandFeaturedSection({
  title,
  items,
  siteImages,
  surface = "light",
  compact = false,
  maxWidth,
}: FeaturedSectionProps) {
  const isDark = surface === "dark";
  const containerClass = compact ? "mx-auto px-5 py-7 md:px-8" : "mx-auto px-5 py-10 md:px-8";
  const containerMaxWidth = maxWidth ?? (compact ? "1500px" : "1320px");
  const titleClass = isDark
    ? compact
      ? "text-center text-xl font-black tracking-[-0.02em] text-white"
      : "text-center text-2xl font-black tracking-[-0.02em] text-white"
    : compact
      ? "text-center text-xl font-black tracking-[-0.02em] text-slate-900"
      : "text-center text-2xl font-black tracking-[-0.02em] text-slate-900";
  const gridClass = compact ? "mt-5 grid gap-3 sm:grid-cols-2" : "mt-7 grid gap-4 lg:grid-cols-2";
  const cardClass = compact
    ? "group block aspect-[18/5] overflow-hidden rounded-[4px] bg-[#071225] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
    : "group block h-[190px] overflow-hidden rounded-[4px] bg-[#071225] shadow-[0_12px_28px_rgba(15,23,42,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(15,23,42,0.16)] sm:h-[230px] lg:h-[215px]";

  return (
    <section className={isDark ? "border-t border-white/10 bg-[#050505] text-white" : "border-t border-slate-200 bg-[#f5f5f5] text-slate-950"}>
      <div className={containerClass} style={{ maxWidth: containerMaxWidth }}>
        <h2 className={titleClass}>
          {title}
        </h2>
        <div className={gridClass}>
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              aria-label={item.title}
              className={cardClass}
            >
              <Image
                src={resolveImage(item.imageKey, siteImages)}
                alt={item.title}
                width={compact ? 900 : 1792}
                height={compact ? 250 : 1024}
                sizes={compact ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 50vw, 100vw"}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BrandClosingBanner({ imageKey, alt, siteImages, maxWidth = "1500px" }: ClosingBannerProps) {
  return (
    <section className="bg-white px-5 py-8 md:px-8">
      <div
        className="mx-auto overflow-hidden rounded-[8px] border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)]"
        style={{ maxWidth }}
      >
        <Image
          src={resolveImage(imageKey, siteImages)}
          alt={alt}
          width={1920}
          height={217}
          className="h-[118px] w-full object-cover md:h-[150px]"
        />
      </div>
    </section>
  );
}
