"use client";

import { useState } from "react";
import Image from "next/image";
import ImageLightbox from "../../../components/image-lightbox";

type Aplicacion = {
  titulo: string;
  texto: string;
  imagen: string;
};

export default function ApplicationsGallery({ items }: { items: Aplicacion[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.titulo}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Ver imagen ampliada de ${item.titulo}`}
            className="group relative aspect-[4/3] overflow-hidden rounded-[14px] border border-slate-200 bg-slate-900 text-left shadow-[0_2px_10px_rgba(15,23,42,0.06)]"
          >
            <Image
              src={item.imagen}
              alt={item.titulo}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="text-base font-black leading-tight text-white">{item.titulo}</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/80">{item.texto}</p>
            </div>
            <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Ampliar
            </span>
          </button>
        ))}
      </div>

      {openItem && (
        <ImageLightbox src={openItem.imagen} label={openItem.titulo} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}
