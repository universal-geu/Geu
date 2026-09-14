"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProducts } from "./products-provider";
import { productSellsInDivision } from "@/lib/product-category-views";
import { matchesQuery } from "@/lib/text-match";
import type { DivisionName } from "@/lib/divisions";

type Props = {
  className?: string;
  basePath?: string;
  placeholder?: string;
  division?: DivisionName;
};

const MAX_SUGGESTIONS = 6;

export default function CauchosSearchForm({
  className,
  basePath = "/cauchos",
  placeholder = "Buscar laminas, sellos, mangueras, empaques...",
  division = "Cauchos",
}: Props) {
  const router = useRouter();
  const { products } = useProducts();
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

  const suggestions = useMemo(() => {
    if (trimmedQuery.length < 2) return [];

    const seen = new Set<string>();
    const matches: { slug: string; nombre: string; marca: string }[] = [];

    for (const product of products) {
      if (!productSellsInDivision(product, division)) continue;
      const haystack = [product.nombre, product.marca, product.categoria, product.sku]
        .filter((v): v is string => Boolean(v))
        .join(" ");
      if (!matchesQuery(haystack, trimmedQuery)) continue;
      if (seen.has(product.slug)) continue;

      seen.add(product.slug);
      matches.push({ slug: product.slug, nombre: product.nombre, marca: product.marca });
      if (matches.length >= MAX_SUGGESTIONS) break;
    }

    return matches;
  }, [products, division, trimmedQuery]);

  function goToSearch(query: string) {
    const trimmed = query.trim();
    router.push(trimmed ? `${basePath}/buscar?q=${encodeURIComponent(trimmed)}` : basePath);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <form
        className={className}
        onSubmit={(event) => {
          event.preventDefault();
          if (highlighted >= 0 && suggestions[highlighted]) {
            router.push(`/producto/${suggestions[highlighted].slug}`);
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
              href={`/producto/${suggestion.slug}`}
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
