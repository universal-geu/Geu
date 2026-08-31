"use client";

import { useEffect, useRef, useState } from "react";

type Tone = "default" | "hot" | "done";
type State = "pending" | "active" | "complete";

type Step = {
  num: string;
  title: string;
  desc: string;
  tone: Tone;
};

const steps: Step[] = [
  { num: "01", title: "Desengrase", desc: "Retira grasa y aceite", tone: "default" },
  { num: "02", title: "Decapado", desc: "Elimina óxido y calamina", tone: "default" },
  { num: "03", title: "Fluxado", desc: "Prepara la superficie", tone: "default" },
  { num: "04", title: "Inmersión", desc: "Zinc fundido a 450 °C", tone: "hot" },
  { num: "05", title: "Enfriamiento", desc: "Fija el recubrimiento", tone: "default" },
  { num: "06", title: "Inspección", desc: "Espesor y adherencia", tone: "done" },
];

function TankGlyph({ tone, state }: { tone: Tone; state: State }) {
  const liquid =
    tone === "hot" ? "#e8912b" : tone === "done" ? "#0498b4" : "#8a97a6";
  const liquidTop = tone === "hot" ? 20 : 22;
  const pieceHeight = tone === "done" ? 24 : 34;
  const dip = state === "active";

  return (
    <svg viewBox="0 0 64 56" className="h-14 w-14" aria-hidden="true">
      {/* tank body */}
      <rect
        x="7"
        y="16"
        width="50"
        height="36"
        rx="6"
        fill="none"
        className="stroke-white/25"
        strokeWidth="2"
      />
      {/* liquid */}
      <rect
        x="10"
        y={liquidTop}
        width="44"
        height={52 - liquidTop - 3}
        rx="3"
        fill={liquid}
        opacity={tone === "default" ? 0.35 : 0.9}
      />
      {/* ripple when active */}
      {dip && (
        <rect
          x="10"
          y={liquidTop}
          width="44"
          height="3"
          rx="1.5"
          fill="#ffffff"
          opacity="0.5"
        >
          <animate
            attributeName="opacity"
            values="0.5;0.1;0.5"
            dur="1s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      {/* workpiece being dipped */}
      <rect
        x="28"
        y="2"
        width="8"
        height={pieceHeight}
        rx="1.5"
        className="fill-white/70"
        style={{
          transform: dip ? "translateY(8px)" : "translateY(0)",
          transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      {tone === "hot" && (
        <>
          <circle cx="20" cy="34" r="1.6" className="fill-white/80" />
          <circle cx="33" cy="40" r="1.4" className="fill-white/70" />
          <circle cx="44" cy="32" r="1.5" className="fill-white/75" />
        </>
      )}
      {tone === "done" && (
        <path
          d="M23 35l6 6 11-12"
          fill="none"
          stroke="#0498b4"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: state === "pending" ? 1 : 0,
            transition: "stroke-dashoffset 500ms ease 200ms",
          }}
        />
      )}
    </svg>
  );
}

export default function GalvanizingProcess() {
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // start the sequence when the block scrolls into view
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const raf = requestAnimationFrame(() => setActive(steps.length));
      return () => cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRunning(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // advance through the steps, then loop
  useEffect(() => {
    if (!running) return;
    let step = -1;
    const tick = () => {
      step += 1;
      if (step > steps.length) {
        step = -1;
        setActive(-1);
        return;
      }
      setActive(step);
    };
    tick();
    const id = setInterval(tick, 1100);
    return () => clearInterval(id);
  }, [running]);

  const stateFor = (i: number): State => {
    if (active >= steps.length) return "complete";
    if (i < active) return "complete";
    if (i === active) return "active";
    return "pending";
  };

  return (
    <div className="mt-10" ref={rootRef}>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {steps.map((step, i) => {
          const state = stateFor(i);
          const isHot = step.tone === "hot";
          const isActive = state === "active";
          return (
            <li
              key={step.num}
              className={`relative flex flex-col items-center rounded-[12px] border p-5 text-center transition-all duration-500 ${
                isHot
                  ? "border-[#e8912b]/45 bg-[#e8912b]/10"
                  : "border-white/10 bg-white/[0.03]"
              } ${
                isActive
                  ? isHot
                    ? "-translate-y-1 border-[#e8912b] shadow-[0_0_0_1px_#e8912b,0_18px_40px_-12px_rgba(232,145,43,0.5)]"
                    : "-translate-y-1 border-[#0498b4] shadow-[0_0_0_1px_#0498b4,0_18px_40px_-12px_rgba(4,152,180,0.45)]"
                  : ""
              } ${state === "pending" ? "opacity-55" : "opacity-100"}`}
            >
              <span
                className={`text-[10px] font-black uppercase tracking-[0.12em] ${
                  isHot ? "text-[#f0a552]" : isActive ? "text-[#0498b4]" : "text-white/35"
                }`}
              >
                Paso {step.num}
              </span>
              <div className="mt-3">
                <TankGlyph tone={step.tone} state={state} />
              </div>
              <p
                className={`mt-3 text-sm font-black uppercase tracking-[-0.01em] ${
                  isHot ? "text-[#f0a552]" : "text-white"
                }`}
              >
                {step.title}
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-white/50">
                {step.desc}
              </p>

              {i < steps.length - 1 && (
                <span
                  className={`pointer-events-none absolute right-[-10px] top-1/2 z-10 hidden -translate-y-1/2 transition-colors duration-500 lg:block ${
                    i < active || active >= steps.length ? "text-[#0498b4]" : "text-white/20"
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                    <path d="M8 4l8 8-8 8V4Z" />
                  </svg>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* progress bar */}
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#0498b4] transition-[width] duration-700 ease-out"
          style={{
            width: `${
              active < 0
                ? 0
                : Math.min(100, ((active + 1) / steps.length) * 100)
            }%`,
          }}
        />
      </div>

      <p className="mt-4 rounded-[10px] border border-[#0498b4]/25 bg-[#0498b4]/[0.07] px-4 py-3 text-center text-xs font-semibold leading-5 text-white/60">
        Todo el proceso está normalizado por ASTM A123 (perfilería) y ASTM A153
        (herrajes y tornillería) · NTC 2076
      </p>
    </div>
  );
}
