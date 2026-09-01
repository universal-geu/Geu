"use client";

import { useEffect, useRef, useState } from "react";

type Servicio = { num: string; title: string; text: string };
type Fase = {
  fase: string;
  nombre: string;
  entregable: string;
  imageKey: string;
  Icon: () => React.ReactElement;
  items: Servicio[];
};

function IconTerreno() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h18M3 12h18M3 7h18" />
      <path d="M8 7v10M16 7v10" />
    </svg>
  );
}
function IconCimentacion() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11" />
      <path d="m8 10 4 4 4-4" />
      <path d="M4 20h16" />
    </svg>
  );
}
function IconMontaje() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20 20 4" />
      <path d="M4 4h6v6" />
      <path d="M14 14h6v6" />
    </svg>
  );
}
function IconOperacion() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z" />
    </svg>
  );
}

const fases: Fase[] = [
  {
    fase: "01",
    nombre: "Terreno",
    entregable: "Informe geotécnico del sitio",
    imageKey: "structure-servicio-terreno",
    Icon: IconTerreno,
    items: [
      { num: "01", title: "Estudio de suelos", text: "Caracterización del terreno como insumo para la solución de cimentación." },
      { num: "02", title: "Pull out test", text: "Validación en campo de la respuesta pilote–terreno." },
    ],
  },
  {
    fase: "02",
    nombre: "Cimentación",
    entregable: "Pilotes instalados y verificados",
    imageKey: "structure-servicio-cimentacion",
    Icon: IconCimentacion,
    items: [
      { num: "03", title: "Pilotaje", text: "Ejecución del sistema de apoyo definido." },
      { num: "04", title: "Hincado", text: "Instalación controlada y alineada de pilotes." },
    ],
  },
  {
    fase: "03",
    nombre: "Montaje",
    entregable: "Estructura montada y nivelada",
    imageKey: "structure-servicio-montaje",
    Icon: IconMontaje,
    items: [
      { num: "05", title: "Montaje", text: "Ensamble, alineación y nivelación estructural de la mesa fotovoltaica." },
    ],
  },
  {
    fase: "04",
    nombre: "Operación",
    entregable: "Servicio recurrente en sitio",
    imageKey: "structure-servicio-operacion",
    Icon: IconOperacion,
    items: [
      { num: "06", title: "Lavado de paneles", text: "Apoyo a la operación del parque fotovoltaico." },
      { num: "07", title: "Mantenimiento de campo", text: "Corte de césped y actividades complementarias." },
    ],
  },
];

export default function ServiciosTimeline({
  images = {},
}: {
  images?: Record<string, string>;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-12" ref={rootRef}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {fases.map((fase, i) => (
          <div
            key={fase.fase}
            className="group relative flex flex-col overflow-hidden rounded-[16px] border border-slate-200 border-t-2 border-t-[#0498b4] bg-white shadow-[0_10px_30px_-12px_rgba(15,23,42,0.12)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_22px_48px_-16px_rgba(4,152,180,0.35)]"
            style={{
              transitionDelay: shown ? `${i * 110}ms` : "0ms",
              opacity: shown ? 1 : 0,
              transform: shown ? "translateY(0)" : "translateY(16px)",
            }}
          >
            {/* photo banner */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              {images[fase.imageKey] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[fase.imageKey]}
                  alt={`Fase ${fase.fase} · ${fase.nombre}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
              <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-[#0498b4] px-2 py-1 text-[11px] font-black tabular-nums tracking-[0.1em] text-white shadow-sm">
                {fase.fase}
              </span>
            </div>

            <div className="relative flex flex-1 flex-col p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#0498b4]/10 text-[#0498b4]">
                  <fase.Icon />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0498b4]">
                    Fase {fase.fase}
                  </p>
                  <p className="text-[15px] font-black uppercase tracking-[-0.01em] text-slate-950">
                    {fase.nombre}
                  </p>
                </div>
              </div>

              <ul className="mt-5 flex-1 space-y-4 border-t border-slate-100 pt-5">
                {fase.items.map((item) => (
                  <li key={item.num} className="flex gap-3">
                    <span className="mt-[3px] shrink-0 text-[11px] font-black tabular-nums text-[#0498b4]">
                      {item.num}
                    </span>
                    <div>
                      <p className="text-[13px] font-black uppercase leading-tight tracking-[-0.01em] text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[13px] font-semibold leading-5 text-slate-600">
                        {item.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-400">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-[#0498b4]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 13 4 4L19 7" />
                </svg>
                {fase.entregable}
              </p>
            </div>

            {i < fases.length - 1 && (
              <span
                className="pointer-events-none absolute right-[-15px] top-1/2 z-10 hidden -translate-y-1/2 text-[#0498b4] lg:block"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current drop-shadow-[0_2px_6px_rgba(4,152,180,0.4)]">
                  <path d="M8 4l8 8-8 8V4Z" />
                </svg>
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="mt-10 flex items-center gap-3 text-sm font-black uppercase tracking-[0.04em] text-slate-500">
        <span className="h-px w-8 bg-[#0498b4]" />
        Del terreno al montaje: una solución estructural con acompañamiento técnico.
      </p>
    </div>
  );
}
