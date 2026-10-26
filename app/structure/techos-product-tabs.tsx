"use client";

import { useId, useState } from "react";

type Spec = { label: string; value: string };

const descripcion: Spec[] = [
  { label: "Aplicación", value: "Teja trapezoidal" },
  { label: "Perfiles", value: "Aluminio" },
  { label: "Sujeción", value: "Clamps y tornillería" },
  { label: "Montaje", value: "Sobre cubierta" },
];

const componentes: Spec[] = [
  { label: "Perfiles", value: "Aluminio" },
  { label: "Clamps", value: "Fijación de módulos" },
  { label: "Tornillería", value: "Componentes de ensamblaje" },
  { label: "Conexión a tierra", value: "Accesorios del sistema" },
];

const aplicacion: Spec[] = [
  { label: "Sistema 01", value: "Losa liviana" },
  { label: "Sistema 02", value: "Teja trapezoidal" },
  { label: "Sistema 03", value: "Teja grafada" },
  { label: "Sistema 04", value: "Teja de barro" },
];

const tabs = [
  { id: "descripcion", label: "Descripción", items: descripcion },
  { id: "componentes", label: "Componentes", items: componentes },
  { id: "aplicacion", label: "Aplicación", items: aplicacion },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function TechosProductTabs() {
  const [active, setActive] = useState<TabId>("descripcion");
  const baseId = useId();

  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50/70">
      <div
        role="tablist"
        aria-label="Ficha del sistema de fijación para teja trapezoidal"
        className="flex gap-1 overflow-x-auto overflow-y-hidden border-b border-black/10 px-2 sm:px-4"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`relative shrink-0 px-3 py-4 text-[11px] font-black uppercase tracking-[0.1em] transition-colors ${
                selected ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              {tab.label}
              <span
                className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#0498b4] transition-opacity ${
                  selected ? "opacity-100" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="p-5 sm:p-7">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`${baseId}-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={tab.id !== active}
          >
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-black/10">
              {tab.items.map((spec, index) => (
                <div key={spec.label} className={index > 0 ? "lg:pl-8" : undefined}>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-neutral-400">{spec.label}</dt>
                  <dd className="mt-1.5 text-lg font-black tracking-[-0.01em] text-neutral-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
