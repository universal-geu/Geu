"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type Aplicacion = { titulo: string; img: string };

// Carrusel infinito: tres copias seguidas (copia · original · copia). Siempre
// avanza de a una tarjeta y, al salir del bloque central, salta en silencio a
// la tarjeta equivalente, así nunca "rebobina" al inicio.
export default function TornilloCarrusel({ items }: { items: Aplicacion[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<(dir: 1 | -1) => void>(() => {});

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const total = items.length;

    const paso = () => {
      const card = track.firstElementChild as HTMLElement | null;
      return card ? card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || "0") : track.clientWidth;
    };
    const bloque = () => paso() * total;
    const saltar = (left: number) => track.scrollTo({ left, behavior: "instant" });
    const recentrar = () => {
      const b = bloque();
      if (track.scrollLeft < b - 2) saltar(track.scrollLeft + b);
      else if (track.scrollLeft >= 2 * b - 2) saltar(track.scrollLeft - b);
    };
    const mover = (dir: 1 | -1) => {
      recentrar();
      track.scrollBy({ left: dir * paso(), behavior: "smooth" });
    };
    moverRef.current = mover;

    let t = 0;
    const onScroll = () => {
      clearTimeout(t);
      t = window.setTimeout(recentrar, 140);
    };
    const onResize = () => saltar(bloque() + Math.round((track.scrollLeft % bloque()) / paso()) * paso());
    track.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    saltar(bloque());

    let pausa = false;
    const pausar = () => (pausa = true);
    const seguir = () => (pausa = false);
    const zona = track.parentElement;
    zona?.addEventListener("mouseenter", pausar);
    zona?.addEventListener("mouseleave", seguir);
    track.addEventListener("touchstart", pausar, { passive: true });
    const auto = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : window.setInterval(() => {
          if (!pausa && !document.hidden) mover(1);
        }, 3500);

    return () => {
      clearTimeout(t);
      clearInterval(auto);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      zona?.removeEventListener("mouseenter", pausar);
      zona?.removeEventListener("mouseleave", seguir);
      track.removeEventListener("touchstart", pausar);
    };
  }, [items.length]);

  return (
    <div className="carousel">
      <div className="apps" ref={trackRef}>
        {[true, false, true].flatMap((copia, bloque) =>
          items.map((a) => (
            <figure key={`${bloque}-${a.img}`} className="app" aria-hidden={copia || undefined}>
              <Image src={`/structure-tornillo/${a.img}`} alt={copia ? "" : a.titulo} width={900} height={900} loading="lazy" />
              <figcaption>{a.titulo}</figcaption>
            </figure>
          )),
        )}
      </div>
      <button className="carousel__btn carousel__btn--prev" type="button" aria-label="Anterior" onClick={() => moverRef.current(-1)}>
        ←
      </button>
      <button className="carousel__btn carousel__btn--next" type="button" aria-label="Siguiente" onClick={() => moverRef.current(1)}>
        →
      </button>
    </div>
  );
}
