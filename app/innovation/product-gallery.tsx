"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type Shot = {
  src: string;
  label: string;
  alt: string;
};

const shots: Shot[] = [
  {
    src: "/geu-structure-m24-05.jpg",
    label: "Con módulos FV",
    alt: "Estructura M24 biposte galvanizada con módulos fotovoltaicos montados",
  },
  {
    src: "/geu-structure-m24-01.jpg",
    label: "Vista 3/4",
    alt: "Estructura M24 biposte galvanizada, vista tres cuartos frontal en baja perspectiva",
  },
  {
    src: "/geu-structure-m24-02.jpg",
    label: "Estructura completa",
    alt: "Estructura M24 biposte galvanizada, vista elevada del bastidor completo",
  },
  {
    src: "/geu-structure-m24-03.jpg",
    label: "Alzado frontal",
    alt: "Estructura M24 biposte galvanizada, alzado frontal con columnas escalonadas",
  },
  {
    src: "/geu-structure-m24-04.jpg",
    label: "Perfil lateral",
    alt: "Estructura M24 biposte galvanizada, vista de perfil mostrando la inclinación",
  },
];

function ArrowButton({
  dir,
  onClick,
  className = "",
}: {
  dir: "prev" | "next";
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === "prev" ? "Vista anterior" : "Vista siguiente"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black shadow-sm backdrop-blur transition-colors hover:bg-white ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-4 w-4 ${dir === "prev" ? "" : "rotate-180"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}

export default function ProductGallery({
  sources,
  theme = "dark",
}: {
  sources?: string[];
  theme?: "dark" | "light";
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const light = theme === "light";
  const frameBorder = light ? "border-black/10" : "border-white/10";
  const thumbIdle = light
    ? "border-black/10 hover:border-black/25"
    : "border-white/10 hover:border-white/30";

  const views = shots.map((shot, index) => ({
    ...shot,
    src: sources?.[index]?.trim() || shot.src,
  }));
  const count = views.length;

  const go = useCallback(
    (delta: number) => setActive((current) => (current + delta + count) % count),
    [count],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "Escape") setZoom(false);
    }
    if (zoom) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [zoom, go]);

  return (
    <div>
      <div className={`group relative overflow-hidden rounded-[10px] border bg-white ${frameBorder}`}>
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Ampliar imagen"
          className="relative block aspect-[3/2] w-full cursor-zoom-in"
        >
          {views.map((shot, index) => (
            <Image
              key={shot.src + index}
              src={shot.src}
              alt={shot.alt}
              fill
              sizes="(min-width: 1024px) 720px, 100vw"
              priority={index === 0}
              className={`object-cover transition-opacity duration-300 ${
                index === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
          <span className="pointer-events-none rounded-[3px] bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-white backdrop-blur">
            {views[active].label}
          </span>
          <span className="pointer-events-none rounded-[3px] bg-black/70 px-2 py-1 text-[10px] font-black tabular-nums text-white/80 backdrop-blur">
            {active + 1} / {count}
          </span>
        </div>

        <ArrowButton
          dir="prev"
          onClick={() => go(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
        />
        <ArrowButton
          dir="next"
          onClick={() => go(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2.5">
        {views.map((shot, index) => (
          <button
            key={shot.src + index}
            type="button"
            onClick={() => setActive(index)}
            aria-label={shot.label}
            aria-pressed={index === active}
            className={`group overflow-hidden rounded-[8px] border bg-white transition-colors ${
              index === active
                ? "border-[#0498b4] ring-1 ring-[#0498b4]"
                : thumbIdle
            }`}
          >
            <span className="relative block aspect-[3/2] w-full">
              <Image
                src={shot.src}
                alt=""
                fill
                sizes="180px"
                className={`object-cover transition-opacity ${
                  index === active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                }`}
              />
            </span>
          </button>
        ))}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4 md:p-10"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`M24 · ${views[active].label}`}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="relative aspect-[3/2] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image
              src={views[active].src}
              alt={views[active].alt}
              fill
              sizes="90vw"
              className="rounded-[8px] object-contain"
            />
            <div className="absolute inset-x-0 -bottom-9 flex items-center justify-center gap-4">
              <ArrowButton dir="prev" onClick={() => go(-1)} />
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-white/70">
                {views[active].label} · {active + 1} / {count}
              </span>
              <ArrowButton dir="next" onClick={() => go(1)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
