"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";

type Solution = {
  title: string;
  text: string;
  image: string;
};

export default function SolutionsCarousel({ items }: { items: Solution[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const drag = useRef({ isDown: false, startX: 0, startScrollLeft: 0, moved: false });

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    drag.current = { isDown: true, startX: e.clientX, startScrollLeft: track.scrollLeft, moved: false };
    track.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !drag.current.isDown) return;
    const delta = e.clientX - drag.current.startX;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    track.scrollLeft = drag.current.startScrollLeft - delta;
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    drag.current.isDown = false;
    if (track) track.releasePointerCapture(e.pointerId);
  }

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[index] as HTMLElement | undefined;
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActive(index);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const trackLeft = track.scrollLeft + track.offsetLeft;
    let closest = 0;
    let closestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - trackLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });
    setActive(closest);
  }

  function goNext() {
    scrollToIndex(Math.min(active + 1, items.length - 1));
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-4 active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div key={item.title} className="flex w-80 shrink-0 snap-start flex-col select-none sm:w-96 lg:w-[440px]">
            <div className="relative aspect-square w-full bg-slate-900">
              <Image
                src={item.image}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 1024px) 440px, (min-width: 640px) 384px, 320px"
                className="pointer-events-none object-cover"
              />
            </div>
            <h3 className="mt-5 text-xl font-black tracking-[-0.02em] text-slate-950">
              {item.title}
            </h3>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente"
        disabled={active === items.length - 1}
        className="absolute right-0 top-1/2 hidden h-11 w-11 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.14)] hover:bg-slate-950 hover:text-white disabled:opacity-0 sm:flex"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Ir a ${item.title}`}
            onClick={() => scrollToIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === active ? "w-6 bg-slate-950" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
