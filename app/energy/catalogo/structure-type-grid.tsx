"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "../../components/image-lightbox";

type TipoEstructura = {
  nombre: string;
  imagen: string;
  texto: string;
};

export default function StructureTypeGrid({ tipos }: { tipos: TipoEstructura[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openTipo = openIndex !== null ? tipos[openIndex] : null;

  return (
    <>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {tipos.map((tipo, index) => (
          <article
            key={tipo.nombre}
            className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              className="group relative block h-40 w-full overflow-hidden bg-slate-100"
              aria-label={`Ver imagen ampliada de ${tipo.nombre}`}
            >
              <Image
                src={tipo.imagen}
                alt={`Estructura solar tipo ${tipo.nombre}`}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Ampliar
              </span>
            </button>
            <div className="p-5">
              <h3 className="text-base font-black text-slate-900">{tipo.nombre}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{tipo.texto}</p>
            </div>
          </article>
        ))}
      </div>

      {openTipo && (
        <ImageLightbox src={openTipo.imagen} label={openTipo.nombre} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}
