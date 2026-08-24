"use client";

import { useEffect, useRef, useState } from "react";

export type CatalogNavItem = { id: string; label: string };

const ACTIVE_THRESHOLD_PX = 140;

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    let ticking = false;
    function update() {
      ticking = false;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= ACTIVE_THRESHOLD_PX) {
          current = section.id;
        } else {
          break;
        }
      }
      setActive(current);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);

  return active;
}

function goTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function CatalogMobileNav({ items }: { items: CatalogNavItem[] }) {
  const ids = items.map((item) => item.id);
  const active = useActiveSection(ids);
  const trackRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const track = trackRef.current;
    const button = buttonRefs.current[active];
    if (!track || !button) return;
    const trackRect = track.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    if (buttonRect.left < trackRect.left || buttonRect.right > trackRect.right) {
      button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active]);

  return (
    <div className="sticky top-20 z-30 border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur md:px-8 lg:hidden">
      <div
        ref={trackRef}
        className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              buttonRefs.current[item.id] = el;
            }}
            type="button"
            onClick={() => goTo(item.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.04em] transition-colors ${
              active === item.id
                ? "border-[#050505] bg-[#050505] text-white"
                : "border-slate-200 text-slate-500"
            }`}
          >
            {index + 1}. {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CatalogSidebarNav({ items }: { items: CatalogNavItem[] }) {
  const ids = items.map((item) => item.id);
  const active = useActiveSection(ids);

  return (
    <aside className="sticky top-28 hidden h-fit w-56 shrink-0 lg:block">
      <p className="mb-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Contenido</p>
      <ul className="space-y-1 border-l border-slate-200">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => goTo(item.id)}
              className={`-ml-px block border-l-2 py-1.5 pl-4 text-left text-sm font-bold transition-colors ${
                active === item.id
                  ? "border-[#b17800] text-[#b17800]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {String(index + 1).padStart(2, "0")}. {item.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
