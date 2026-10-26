"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ProductGallery, { type Shot } from "./product-gallery";
import TechosProductTabs, { type Configuracion, type Spec } from "./techos-product-tabs";

export type Cubierta = {
  id: string;
  num: string;
  title: string;
  text: string;
  description: string;
  cover: string;
  shots: Shot[];
  detalles?: { title: string; src: string }[];
  descripcion: Spec[];
  configuraciones: Configuracion[];
  especificaciones: Spec[];
};

export default function TechosCubiertas({
  cubiertas,
  whatsappNumber,
}: {
  cubiertas: Cubierta[];
  whatsappNumber: string | null;
}) {
  const [selectedId, setSelectedId] = useState(cubiertas[0].id);
  const productRef = useRef<HTMLElement>(null);
  const selected = cubiertas.find((item) => item.id === selectedId) ?? cubiertas[0];

  const quoteHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola GEU Structure, quiero solicitar una cotización del sistema de fijación para ${selected.title.toLowerCase()}.`,
      )}`
    : "#contacto";

  function select(id: string) {
    setSelectedId(id);
    productRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section id="cubiertas" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 pb-16 pt-10 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Soluciones para techos</p>
              <h2 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
                Un sistema de fijación para cada cubierta
              </h2>
            </div>
            <p className="inline-flex max-w-sm items-center gap-2.5 rounded-full border border-[#0498b4]/30 bg-white px-4 py-2 text-[12px] font-bold leading-5 text-slate-700 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#0498b4]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10" />
                <path d="M12 10V8.5a1.5 1.5 0 0 1 3 0V11" />
                <path d="M15 11v-1a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.6-2.2L4 14.6a1.5 1.5 0 0 1 2.2-2L9 15V11" />
              </svg>
              Haz clic en tu tipo de cubierta para ver su sistema
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cubiertas.map((item) => {
              const active = item.id === selected.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => select(item.id)}
                    aria-pressed={active}
                    aria-controls="producto-techos"
                    className={`group relative block aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[16px] bg-neutral-900 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0498b4]/60 ${
                      active
                        ? "shadow-[0_24px_56px_rgba(4,152,180,0.30)] ring-[3px] ring-[#0498b4]"
                        : "shadow-[0_14px_36px_rgba(15,23,42,0.12)] hover:-translate-y-1.5 hover:shadow-[0_24px_52px_rgba(15,23,42,0.20)]"
                    }`}
                  >
                    <Image
                      src={item.cover}
                      alt={`Sistema de fijación para ${item.title.toLowerCase()}`}
                      fill
                      sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                      className={`object-cover transition-all duration-500 group-hover:scale-[1.05] ${
                        active ? "" : "saturate-[0.85] group-hover:saturate-100"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent" />

                    {active && (
                      <span
                        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#0498b4] text-white shadow-lg"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 13 4 4L19 7" />
                        </svg>
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p
                        className={`font-[family:var(--font-display)] text-sm font-black tracking-[0.08em] ${
                          active ? "text-[#5fd3e8]" : "text-white/60"
                        }`}
                      >
                        {item.num}
                      </p>
                      <h3 className="mt-1 text-lg font-black uppercase leading-tight tracking-[0.02em] text-white">
                        {item.title}
                      </h3>
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          active
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100"
                        }`}
                      >
                        <p className="overflow-hidden pt-1.5 text-[12px] font-semibold leading-[1.45] text-white/80">
                          {item.text}
                        </p>
                      </div>
                    </div>
                    <span className="sr-only">{active ? "(seleccionado)" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section
        id="producto-techos"
        ref={productRef}
        aria-live="polite"
        className="scroll-mt-20 border-b border-black/10 bg-white"
      >
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-12 lg:items-stretch">
            <div>
              <ProductGallery
                key={selected.id}
                theme="light"
                productName={selected.title}
                items={selected.shots}
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
                Producto · Sistema {selected.num}
              </p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-neutral-900 md:text-[2.75rem] md:leading-[1.05]">
                Sistema de fijación para {selected.title.toLowerCase()}
              </h2>
              <p className="mt-4 max-w-md text-[15px] font-semibold leading-7 text-neutral-600">{selected.description}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-[#0498b4]/40 bg-[#0498b4]/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0498b4]">
                  Perfiles de aluminio
                </span>
                {selected.configuraciones.map((config) => (
                  <span
                    key={config.nombre}
                    className="inline-flex rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500"
                  >
                    Sistema {config.nombre}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Cambiar tipo de cubierta">
                {cubiertas.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={item.id === selected.id}
                    className={`rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] transition-colors ${
                      item.id === selected.id
                        ? "bg-neutral-900 text-white"
                        : "border border-neutral-300 text-neutral-500 hover:border-neutral-900 hover:text-neutral-900"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-10">
                <dl className="grid grid-cols-3 gap-4 border-t border-black/10 pt-6">
                  {[
                    { value: String(selected.configuraciones.length), label: selected.configuraciones.length > 1 ? "Configuraciones" : "Configuración" },
                    { value: "AA6005 T5", label: "Aleación de perfiles" },
                    { value: "Inox", label: "Tornillería" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dd className="font-[family:var(--font-display)] text-2xl font-black tracking-[-0.02em] text-neutral-900 md:text-[1.75rem]">
                        {stat.value}
                      </dd>
                      <dt className="mt-1 text-[10px] font-bold uppercase leading-tight tracking-[0.06em] text-neutral-400">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={quoteHref}
                    target={whatsappNumber ? "_blank" : undefined}
                    rel={whatsappNumber ? "noopener noreferrer" : undefined}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-[#0498b4] px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#03809a]"
                  >
                    Solicitar cotización <span aria-hidden="true">→</span>
                  </a>
                  <a
                    href="#material-techos"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] border border-neutral-300 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Ver componentes
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <TechosProductTabs
                key={selected.id}
                cubierta={selected.title}
                descripcion={selected.descripcion}
                configuraciones={selected.configuraciones}
                especificaciones={selected.especificaciones}
              />
            </div>

            {selected.detalles && selected.detalles.length > 0 && (
              <div className="lg:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0498b4]">
                  Detalles del sistema · {selected.title}
                </p>
                <div className={`mt-5 grid gap-4 ${selected.detalles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                  {selected.detalles.map((item) => (
                    <figure
                      key={`${selected.id}-${item.title}`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-[14px] bg-neutral-900 shadow-[0_14px_36px_rgba(15,23,42,0.10)] ring-1 ring-black/5"
                    >
                      <Image
                        src={item.src}
                        alt={`${item.title} — sistema de fijación para ${selected.title.toLowerCase()}`}
                        fill
                        sizes="(min-width: 640px) 440px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <figcaption className="absolute inset-x-0 bottom-0 p-4">
                        <span className="inline-block h-[3px] w-8 bg-[#0498b4]" />
                        <span className="mt-2 block text-[12px] font-bold uppercase leading-tight tracking-[0.04em] text-white">
                          {item.title}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
