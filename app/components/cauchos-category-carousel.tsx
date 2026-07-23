"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CauchosCategory = {
  label: string;
  title: string;
  image: string;
  count: string;
  href?: string;
};

type Props = {
  categories: CauchosCategory[];
  accent?: "blue" | "red" | "silver";
};

const accentClasses = {
  blue: {
    arrow: "text-[#075ed8] hover:border-[#075ed8]",
    card: "hover:border-[#075ed8]",
  },
  red: {
    arrow: "text-[#e31313] hover:border-[#e31313]",
    card: "hover:border-[#e31313]",
  },
  silver: {
    arrow: "text-[#666769] hover:border-[#a3a3a4]",
    card: "hover:border-[#a3a3a4]",
  },
};

export default function CauchosCategoryCarousel({ categories, accent = "blue" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const tone = accentClasses[accent];
  const [canScroll, setCanScroll] = useState(false);
  const [visibleWidth, setVisibleWidth] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    // Clamp the row to a width that fits only whole cards, so the last
    // one is either fully visible or fully hidden until scrolled — never
    // sliced in half at the edge (which reads as a layout bug).
    const recompute = () => {
      const firstCard = scroller.children[0] as HTMLElement | undefined;
      if (!firstCard) return;

      const cardWidth = firstCard.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(scroller).columnGap || "0");
      const available = container.clientWidth;
      if (cardWidth <= 0 || available <= 0) return;

      const wholeCount = Math.max(1, Math.floor((available + gap) / (cardWidth + gap)));
      const width = wholeCount * (cardWidth + gap) - gap;
      setVisibleWidth(width);
      setCanScroll(scroller.scrollWidth > width + 1);
    };

    recompute();

    const observer = new ResizeObserver(recompute);
    observer.observe(container);
    return () => observer.disconnect();
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  return (
    <div ref={containerRef} className="relative">
      {canScroll && (
        <button
          type="button"
          aria-label="Ver categorias anteriores"
          onClick={() => scroll("left")}
          className={`absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-black shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition md:inline-flex ${tone.arrow}`}
        >
          ‹
        </button>
      )}

      <div
        ref={scrollerRef}
        style={visibleWidth ? { maxWidth: visibleWidth } : undefined}
        className={`mx-auto flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          accent === "red" ? "gap-7 py-2" : accent === "silver" ? "gap-5 py-2" : "gap-2 py-1"
        }`}
      >
        {categories.map((category) => (
          <Link
            key={category.label}
            href={category.href ?? "#productos"}
            title={category.title}
            className={
              accent === "red"
                ? "group grid grid-cols-1 min-w-[150px] shrink-0 snap-start justify-items-center gap-3 px-2 py-2 text-center transition hover:-translate-y-1 md:min-w-[165px]"
                : accent === "silver"
                  ? "group grid grid-cols-1 w-[152px] shrink-0 snap-start justify-items-center gap-4 px-3 py-4 text-center transition hover:-translate-y-1 md:w-[168px]"
                  : `group grid grid-cols-1 min-h-[156px] w-[210px] shrink-0 snap-start grid-rows-[5rem_auto_1rem] justify-items-center gap-2 rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-3 text-center shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] md:min-h-[166px] md:w-[228px] md:grid-rows-[5.5rem_auto_1rem] ${tone.card}`
            }
          >
            <span
              className={
                accent === "red"
                  ? "relative block h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_0_0_2px_rgba(227,19,19,0.18),0_14px_30px_rgba(15,23,42,0.12)] transition group-hover:shadow-[0_0_0_3px_rgba(227,19,19,0.42),0_18px_34px_rgba(15,23,42,0.16)] md:h-28 md:w-28"
                  : accent === "silver"
                    ? "relative block h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-[0_0_0_2px_rgba(163,163,164,0.56),0_14px_30px_rgba(15,23,42,0.11)] transition group-hover:shadow-[0_0_0_3px_rgba(163,163,164,0.86),0_18px_34px_rgba(15,23,42,0.15)] md:h-28 md:w-28"
                  : "relative block h-20 w-20 self-start overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-[0_0_0_2px_rgba(15,23,42,0.12)] md:h-[5.5rem] md:w-[5.5rem]"
              }
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(min-width: 768px) 112px, 96px"
                className="object-cover"
              />
            </span>
            <span
              className={`${
                accent === "red" ? "min-h-9" : accent === "silver" ? "min-h-[3.25rem]" : ""
              } block w-full min-w-0 break-words text-[13px] font-black leading-tight text-slate-950`}
            >
              {category.title}
            </span>
            <span className="block self-start text-xs font-bold leading-none text-slate-500">
              {category.count}
            </span>
          </Link>
        ))}
      </div>

      {canScroll && (
        <button
          type="button"
          aria-label="Ver mas categorias"
          onClick={() => scroll("right")}
          className={`absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-2xl font-black shadow-[0_14px_34px_rgba(15,23,42,0.14)] transition md:inline-flex ${tone.arrow}`}
        >
          ›
        </button>
      )}
    </div>
  );
}
