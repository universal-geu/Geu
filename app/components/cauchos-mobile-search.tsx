"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProductSuggestions } from "./cauchos-search-form";
import { productHref, type DivisionName } from "@/lib/divisions";

const MAX_RESULTS = 12;

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

// Buscador para celular: una lupa en el header que abre una pantalla completa
// con el campo de búsqueda, "Cancelar" y los productos que coinciden.
export default function CauchosMobileSearch({
  basePath,
  division,
  accent,
}: {
  basePath: string;
  division: DivisionName;
  accent: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const query = value.trim();
  const results = useProductSuggestions(query, division, MAX_RESULTS);

  const close = () => {
    setOpen(false);
    setValue("");
  };

  // Bloquea el scroll de la página mientras el buscador está abierto.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Buscar productos"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 transition hover:bg-slate-100"
      >
        <SearchIcon className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex flex-col bg-white" role="dialog" aria-modal="true" aria-label="Buscar productos">
          <form
            className="flex items-center gap-3 border-b border-slate-200 px-4 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!query) return;
              router.push(`${basePath}/buscar?q=${encodeURIComponent(query)}`);
              close();
            }}
          >
            <span className="text-slate-400">
              <SearchIcon />
            </span>
            <input
              autoFocus
              type="search"
              enterKeyHint="search"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") close();
              }}
              placeholder="¿Qué estás buscando?"
              aria-label="¿Qué estás buscando?"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button type="button" onClick={close} className="shrink-0 text-sm font-bold" style={{ color: accent }}>
              Cancelar
            </button>
          </form>

          <div className="flex-1 overflow-y-auto">
            {query.length < 2 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                <SearchIcon className="h-8 w-8" />
                <p className="text-sm">Escribe para buscar productos...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                <SearchIcon className="h-8 w-8" />
                <p className="text-sm">No encontramos productos para &quot;{query}&quot;.</p>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-slate-100">
                  {results.map((product) => (
                    <li key={product.slug}>
                      <Link
                        href={productHref(product.slug, division)}
                        onClick={close}
                        className="flex items-center gap-3 px-4 py-3 active:bg-slate-50"
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-white">
                          <Image src={product.imagen} alt="" fill sizes="48px" className="object-contain p-1" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-800">{product.nombre}</span>
                          <span className="block truncate text-xs text-slate-500">{product.marca}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    router.push(`${basePath}/buscar?q=${encodeURIComponent(query)}`);
                    close();
                  }}
                  className="block w-full border-t border-slate-100 px-4 py-4 text-left text-sm font-bold"
                  style={{ color: accent }}
                >
                  Ver todos los resultados para &quot;{query}&quot;
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
