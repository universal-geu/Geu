"use client";

import { useId, useState } from "react";

type Spec = { label: string; value: string };

const geometria: Spec[] = [
  { label: "Dimensiones generales", value: "14,60 × 5,50 m" },
  { label: "Inclinación", value: "8,13°" },
  { label: "Columnas", value: "10 · 5 + 5" },
  { label: "Apoyos · eje a eje", value: "3,40 m" },
  { label: "Altura frontal / posterior", value: "1,00 / 1,50 m" },
  { label: "Espesor de perfiles", value: "2,50 mm" },
];

const estructura: Spec[] = [
  { label: "Modelo", value: "GEU-EF-14.6×5.5" },
  { label: "Norma de diseño", value: "AISC 360 · ASCE 7-16" },
  { label: "Acero", value: "ASTM A36 · Fy ≥ 250 MPa" },
  { label: "Recubrimiento", value: "Galvanizado 80–100 µm" },
  { label: "Carga de viento · ref.", value: "≤ 50 m/s · 180 km/h" },
  { label: "Vida útil estimada", value: "+25 años" },
];

const incluido: string[] = [
  "Ingeniería estructural y memorias de cálculo",
  "Planos de fabricación y manual de montaje",
  "Estudio de cargas de viento certificado (CFD / Dlubal)",
  "Ensamble en sitio y asistencia técnica",
];

const tabs = [
  { id: "geometria", label: "Geometría" },
  { id: "estructura", label: "Estructura y durabilidad" },
  { id: "incluido", label: "Incluido" },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SpecGrid({ items }: { items: Spec[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((spec) => (
        <div key={spec.label}>
          <dt className="text-[10px] font-bold uppercase tracking-[0.06em] text-neutral-400">
            {spec.label}
          </dt>
          <dd className="mt-1.5 text-lg font-black tracking-[-0.01em] text-neutral-900">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function IncluidoList() {
  return (
    <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {incluido.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-sm font-semibold leading-6 text-neutral-700"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0498b4]/12 text-[#0498b4]">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ProductSpecs() {
  const [active, setActive] = useState<TabId>("geometria");
  const baseId = useId();

  return (
    <div className="rounded-2xl border border-black/10 bg-neutral-50/70">
      <div
        role="tablist"
        aria-label="Ficha técnica de la estructura M24"
        className="flex gap-1 overflow-x-auto border-b border-black/10 px-2 sm:px-4"
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
                selected
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-600"
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

      <div className="p-5 sm:min-h-[7.5rem] sm:p-7">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`${baseId}-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            hidden={tab.id !== active}
          >
            {tab.id === "geometria" && <SpecGrid items={geometria} />}
            {tab.id === "estructura" && <SpecGrid items={estructura} />}
            {tab.id === "incluido" && <IncluidoList />}
          </div>
        ))}
      </div>

      <p className="border-t border-black/10 px-5 py-4 text-[11px] font-semibold leading-5 text-neutral-400 sm:px-7">
        Tornillería ASTM A325 · tuercas A194 Gr. 2H · arandelas F436, galvanizada.
        Cargas de referencia sujetas a validación con el cálculo estructural de cada sitio.
      </p>
    </div>
  );
}
