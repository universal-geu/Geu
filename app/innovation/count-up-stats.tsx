"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  value: number;
  unit: string;
  label: string;
};

function CountUpValue({ value, unit }: { value: number; unit: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        const duration = 1400;
        const start = performance.now();

        function tick(now: number) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <p
      ref={ref}
      className="font-[family:var(--font-display)] text-6xl font-black leading-none tracking-[-0.02em] text-white [text-shadow:0_4px_28px_rgba(0,0,0,0.55)] sm:text-7xl md:text-8xl"
    >
      {display}
      <span className="text-3xl font-black text-[#37c9e6] md:text-4xl">{unit}</span>
    </p>
  );
}

export default function CountUpStats({ items }: { items: Stat[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4">
      {items.map((stat, index) => (
        <div
          key={stat.label}
          className={`flex flex-col items-center gap-3 px-4 py-6 text-center ${
            index % 2 === 0 ? "border-r border-white/15 md:border-r-0" : ""
          } ${index < 2 ? "border-b border-white/15 md:border-b-0" : ""} ${
            index > 0 ? "md:border-l md:border-white/15" : ""
          }`}
        >
          <CountUpValue value={stat.value} unit={stat.unit} />
          <p className="text-[11px] font-black uppercase leading-tight tracking-[0.14em] text-white/75 md:text-xs">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
