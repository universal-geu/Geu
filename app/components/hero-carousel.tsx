"use client";

import { useEffect, useEffectEvent, useState } from "react";

const slides = [
  {
    id: 1,
    eyebrow: "GEU 01",
    title: "Explora productos y soluciones desde una sola vitrina digital",
    description:
      "Encuentra líneas destacadas, referencias útiles y una experiencia de compra pensada para avanzar rápido.",
    image: "/banner-principal-geu.jpg",
  },
  {
    id: 2,
    eyebrow: "GEU 02",
    title: "Compra con apoyo comercial y categorías listas para cada necesidad",
    description:
      "Combina catálogo, búsqueda y atención en una plataforma más clara para clientes, talleres y negocios.",
    image: "/banner-3-geu.jpg",
  },
  {
    id: 3,
    eyebrow: "GEU 03",
    title: "Convierte tu catálogo en una experiencia visual más fuerte y más vendible",
    description:
      "Presenta productos destacados, rutas de compra y contenido comercial sin perder la identidad gráfica de GEU.",
    image: "/banner-secundario-geu.jpg",
  },
];

const AUTO_PLAY_MS = 5000;

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const advanceSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const syncAdvanceSlide = useEffectEvent(() => {
    advanceSlide();
  });

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      syncAdvanceSlide();
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="relative overflow-hidden text-white">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <article
            key={slide.id}
            className="relative min-h-[560px] w-full shrink-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,10,20,0.94)_0%,rgba(4,10,20,0.78)_28%,rgba(4,10,20,0.36)_54%,rgba(4,10,20,0.12)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_28%,rgba(64,244,255,0.22),transparent_26%)]" />

            <div className="relative mx-auto flex min-h-[560px] max-w-[1520px] items-center px-6 py-24 md:px-8 xl:px-10">
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex rounded-full border border-[var(--line)] bg-black/20 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--cyan)] shadow-[0_0_24px_rgba(64,244,255,0.14)]">
                  {slide.eyebrow}
                </p>
                <h1 className="mb-5 max-w-[11ch] font-[family:var(--font-display)] text-4xl font-black uppercase leading-[0.92] tracking-[0.04em] md:text-6xl xl:text-7xl">
                  {slide.title}
                </h1>
                <p className="mb-8 max-w-2xl text-base leading-8 text-[#d2e4f6] md:text-lg">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-[var(--cyan)] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#07101e] shadow-[0_0_24px_rgba(64,244,255,0.24)] transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Explorar catálogo
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-[var(--line)] bg-black/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
                  >
                    Ver destacados
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        type="button"
        aria-label="Banner anterior"
        onClick={goToPrev}
        className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[#07101e]/80 text-2xl transition-colors duration-200 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
      >
        ‹
      </button>

      <button
        type="button"
        aria-label="Banner siguiente"
        onClick={advanceSlide}
        className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--line)] bg-[#07101e]/80 text-2xl transition-colors duration-200 hover:border-[var(--cyan)] hover:text-[var(--cyan)]"
      >
        ›
      </button>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Ir al banner ${index + 1}`}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-10 bg-[var(--cyan)]"
                : "w-3 bg-white/45 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
