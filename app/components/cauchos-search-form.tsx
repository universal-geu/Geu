"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "./products-provider";
import { productSellsInDivision } from "@/lib/product-category-views";
import { matchesQuery, nameMatchesQuery, nameMatchRank } from "@/lib/text-match";
import { productHref, type DivisionName } from "@/lib/divisions";

type Props = {
  className?: string;
  basePath?: string;
  placeholder?: string;
  division?: DivisionName;
};

const MAX_SUGGESTIONS = 6;

export type ProductSuggestion = { slug: string; nombre: string; marca: string; imagen: string };

// Productos de la división cuyo nombre contiene la búsqueda (mínimo 2 letras).
// Si ningún nombre coincide, cae a la búsqueda aproximada (errores de tipeo en nombre, marca y SKU).
export function useProductSuggestions(query: string, division: DivisionName, limit: number): ProductSuggestion[] {
  const { products } = useProducts();

  return useMemo(() => {
    if (query.length < 2) return [];

    const seen = new Set<string>();
    const divisionProducts = products.filter((product) => {
      if (!productSellsInDivision(product, division) || seen.has(product.slug)) return false;
      seen.add(product.slug);
      return true;
    });

    let matches = divisionProducts
      .filter((product) => nameMatchesQuery(product.nombre, query))
      .sort((a, b) => nameMatchRank(a.nombre, query) - nameMatchRank(b.nombre, query));

    if (matches.length === 0) {
      matches = divisionProducts.filter((product) =>
        matchesQuery(
          [product.nombre, product.marca, product.sku].filter((v): v is string => Boolean(v)).join(" "),
          query,
        ),
      );
    }

    return matches
      .slice(0, limit)
      .map((product) => ({ slug: product.slug, nombre: product.nombre, marca: product.marca, imagen: product.imagen }));
  }, [products, division, query, limit]);
}

export default function CauchosSearchForm({
  className,
  basePath = "/cauchos",
  placeholder = "Buscar laminas, sellos, mangueras, empaques...",
  division = "Cauchos",
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trimmedQuery = value.trim();

  const suggestions = useProductSuggestions(trimmedQuery, division, MAX_SUGGESTIONS);

  function goToSearch(query: string) {
    const trimmed = query.trim();
    router.push(trimmed ? `${basePath}/buscar?q=${encodeURIComponent(trimmed)}` : basePath);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <form
        className={className}
        onSubmit={(event) => {
          event.preventDefault();
          if (highlighted >= 0 && suggestions[highlighted]) {
            router.push(productHref(suggestions[highlighted].slug, division));
            setOpen(false);
            return;
          }
          goToSearch(value);
        }}
      >
        <input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!open || suggestions.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlighted((prev) => (prev + 1) % suggestions.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlighted((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-label="Buscar productos"
          autoComplete="off"
          className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          placeholder={placeholder}
        />
        <button
          type="submit"
          className="flex w-14 items-center justify-center border-l border-slate-200 text-xl text-slate-800"
          aria-label="Buscar"
        >
          ⌕
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-[3px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          {suggestions.map((suggestion, index) => (
            <Link
              key={suggestion.slug}
              href={productHref(suggestion.slug, division)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setOpen(false)}
              className={`flex flex-col gap-0.5 px-4 py-2.5 text-sm transition-colors duration-100 ${
                index === highlighted ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <span className="font-medium text-slate-800">{suggestion.nombre}</span>
              <span className="text-xs text-slate-500">{suggestion.marca}</span>
            </Link>
          ))}
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => goToSearch(value)}
            className="block w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold text-[var(--brand-accent,#075ed8)] hover:bg-slate-50"
          >
            Ver todos los resultados para &quot;{trimmedQuery}&quot;
          </button>
        </div>
      )}
    </div>
  );
}
