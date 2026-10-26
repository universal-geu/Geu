"use client";

import { useId, useState } from "react";

export type Spec = { label: string; value: string };
export type Configuracion = { nombre: string; componentes: string[] };

type TabId = "descripcion" | "configuraciones" | "especificaciones";

const tabs: { id: TabId; label: string }[] = [
  { id: "descripcion", label: "Descripción" },
  { id: "configuraciones", label: "Componentes" },
  { id: "especificaciones", label: "Especificaciones" },
];

function SpecGrid({ items }: { items: Spec[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-black/10">
      {items.map((spec, index) => (
        <div key={spec.label} className={index % 4 > 0 ? "lg:pl-8" : undefined}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-neutral-400">{spec.label}</dt>
          <dd className="mt-1.5 text-lg font-black tracking-[-0.01em] text-neutral-900">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function TechosProductTabs({
  cubierta,
  descripcion,
  configuraciones,
  especificaciones,
}: {
  cubierta: string;
  descripcion: Spec[];
  configuraciones: Configuracion[];
  especificaciones: Spec[];
}) {
  const [active, setActive] = useState<TabId>("descripcion");
  const baseId = useId();

  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50/70">
      <div
        role="tablist"
        aria-label={`Ficha del sistema de fijación para ${cubierta.toLowerCase()}`}
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
        <div
          id={`${baseId}-panel-descripcion`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-descripcion`}
          hidden={active !== "descripcion"}
        >
          <SpecGrid items={descripcion} />
        </div>

        <div
          id={`${baseId}-panel-configuraciones`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-configuraciones`}
          hidden={active !== "configuraciones"}
        >
          <div className={`grid gap-6 ${configuraciones.length > 1 ? "md:grid-cols-2" : ""}`}>
            {configuraciones.map((config) => (
              <div key={config.nombre}>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0498b4]">
                  Sistema {config.nombre}
                </p>
                <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {config.componentes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm font-semibold leading-6 text-neutral-700">
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#0498b4]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          id={`${baseId}-panel-especificaciones`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-especificaciones`}
          hidden={active !== "especificaciones"}
        >
          <SpecGrid items={especificaciones} />
        </div>
      </div>
    </div>
  );
}
