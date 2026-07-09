"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { slugify } from "../data/catalog";
import CauchosAddToCartButton from "./cauchos-add-to-cart-button";
import CauchosCartLink from "./cauchos-cart-link";
import CauchosCategorySidebarMenu from "./cauchos-category-sidebar-menu";
import CauchosMenuButton from "./cauchos-menu-button";
import { CauchosMenuProvider } from "./cauchos-menu-context";
import { useProducts } from "./products-provider";

type Props = {
  segments: string[];
};

const priceRanges = [
  { label: "Hasta $100.000", min: 0, max: 100000 },
  { label: "$100.000 a $300.000", min: 100000, max: 300000 },
  { label: "Más de $300.000", min: 300000, max: Number.POSITIVE_INFINITY },
];


function humanizeSegment(value?: string) {
  if (!value) return "";

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CauchosCategoryProductsPage({ segments }: Props) {
  const { products } = useProducts();
  const [subcategorySlug, minorSlug] = segments;
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedAvailability, setSelectedAvailability] = useState("Todas");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Todos");
  const [sortBy, setSortBy] = useState("relevance");

  const categoryProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.division !== "Cauchos") return false;

      const productSubcategory = product.subcategoria?.trim() || "Productos";
      const productMinor = product.categoriaMenor?.trim() || product.nombre;
      const department = product.categoria.trim();

      const matchesSubcategory =
        !subcategorySlug ||
        slugify(productSubcategory) === subcategorySlug ||
        slugify(department) === subcategorySlug;
      const matchesMinor =
        !minorSlug ||
        slugify(productMinor) === minorSlug ||
        slugify(product.nombre) === minorSlug;

      return matchesSubcategory && matchesMinor;
    });
  }, [minorSlug, products, subcategorySlug]);

  const brands = useMemo(
    () => [
      "Todas",
      ...Array.from(new Set(categoryProducts.map((product) => product.marca))).sort(),
    ],
    [categoryProducts],
  );
  const availabilities = useMemo(
    () => [
      "Todas",
      ...Array.from(
        new Set(categoryProducts.map((product) => product.disponibilidad)),
      ).sort(),
    ],
    [categoryProducts],
  );
  const visibleProducts = useMemo(() => {
    const priceRange = priceRanges.find(
      (range) => range.label === selectedPriceRange,
    );

    return categoryProducts
      .filter((product) => {
        const matchesBrand =
          selectedBrand === "Todas" || product.marca === selectedBrand;
        const matchesAvailability =
          selectedAvailability === "Todas" ||
          product.disponibilidad === selectedAvailability;
        const matchesPrice =
          !priceRange ||
          (product.precioValor >= priceRange.min &&
            product.precioValor < priceRange.max);

        return matchesBrand && matchesAvailability && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.precioValor - b.precioValor;
        if (sortBy === "price-desc") return b.precioValor - a.precioValor;
        if (sortBy === "name") return a.nombre.localeCompare(b.nombre);
        return Number(Boolean(b.destacado)) - Number(Boolean(a.destacado));
      });
  }, [
    categoryProducts,
    selectedAvailability,
    selectedBrand,
    selectedPriceRange,
    sortBy,
  ]);
  const hasActiveFilters =
    selectedBrand !== "Todas" ||
    selectedAvailability !== "Todas" ||
    selectedPriceRange !== "Todos";
  const breadcrumbSubcategory =
    categoryProducts[0]?.subcategoria ||
    humanizeSegment(subcategorySlug) ||
    "Productos";
  const breadcrumbMinor =
    categoryProducts[0]?.categoriaMenor || humanizeSegment(minorSlug);
  const countByBrand = (brand: string) =>
    brand === "Todas"
      ? categoryProducts.length
      : categoryProducts.filter((product) => product.marca === brand).length;
  const countByAvailability = (availability: string) =>
    availability === "Todas"
      ? categoryProducts.length
      : categoryProducts.filter(
          (product) => product.disponibilidad === availability,
        ).length;
  const countByPriceRange = (rangeLabel: string) => {
    const range = priceRanges.find((item) => item.label === rangeLabel);

    if (!range) return categoryProducts.length;

    return categoryProducts.filter(
      (product) =>
        product.precioValor >= range.min && product.precioValor < range.max,
    ).length;
  };
  const renderFilterOption = ({
    group,
    value,
    count,
    selected,
    onChange,
  }: {
    group: string;
    value: string;
    count: number;
    selected: boolean;
    onChange: () => void;
  }) => (
    <label
      key={`${group}-${value}`}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-[4px] px-2.5 py-2 text-sm font-semibold transition ${
        selected
          ? "bg-[#eef5ff] text-[#075ed8]"
          : "text-slate-700 hover:bg-slate-50 hover:text-[#075ed8]"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        <input
          type="checkbox"
          name={group}
          checked={selected}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
            selected ? "border-[#075ed8] bg-[#075ed8]" : "border-slate-300 bg-white"
          }`}
        >
          {selected ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-3 w-3 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8.5 6.2 12 13 4" />
            </svg>
          ) : null}
        </span>
        <span className="truncate">{value}</span>
      </span>
      <span className="shrink-0 text-xs font-bold text-slate-400">{count}</span>
    </label>
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <CauchosMenuProvider>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
            <div className="hidden gap-3 md:flex">
              <span>Servicio al cliente 320 88 999 33</span>
              <span className="text-slate-300">|</span>
              <span>Ventas empresariales</span>
              <span className="text-slate-300">|</span>
              <span>Centro de ayuda</span>
            </div>
            <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
              <Link href="/cauchos#contacto" className="hover:text-[#075ed8]">
                Cotizaciones
              </Link>
              <Link href="/cauchos#productos" className="hover:text-[#075ed8]">
                Catalogos
              </Link>
              <Link href="/quienes-somos" className="hover:text-[#075ed8]">
                GEU empresas
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[260px_1fr_auto] md:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo-universal-cauchos.png"
              alt="GEU Universal de Cauchos"
              width={2518}
              height={420}
              className="h-auto object-contain"
              style={{ width: "260px", maxWidth: "100%" }}
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <CauchosMenuButton />
            <form className="flex min-h-11 flex-1 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
              <input
                aria-label="Buscar productos de caucho"
                className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Buscar laminas, sellos, mangueras, empaques..."
              />
              <button
                type="button"
                className="flex w-14 items-center justify-center border-l border-slate-200 text-xl text-slate-800"
                aria-label="Buscar"
              >
                ⌕
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between gap-5 text-sm text-slate-700 md:justify-end">
            <CauchosCartLink />
            <Link href="/login?next=/mi-cuenta" className="font-bold hover:text-[#075ed8]">
              Mi cuenta
            </Link>
          </div>
        </div>
        <CauchosCategorySidebarMenu basePath="/cauchos" />
      </header>
      </CauchosMenuProvider>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 pb-3 pt-5 md:px-8">
          <Image
            src="/cauchos-category-banner.jpg"
            alt="Universal de Cauchos"
            width={1920}
            height={217}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-10 pt-5 md:px-8">
        {categoryProducts.length > 0 ? (
          <div>
            <nav
              aria-label="Ruta de categoría"
              className="mb-4 flex min-h-12 flex-wrap items-center gap-3 rounded-[2px] border border-slate-100 bg-white px-6 py-3 text-sm font-semibold text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
            >
              <Link href="/cauchos" className="text-[#075ed8] hover:underline">
                Cauchos
              </Link>
              <span className="text-slate-300">›</span>
              <Link
                href={`/cauchos/categoria/${subcategorySlug}`}
                className="text-[#075ed8] hover:underline"
              >
                {breadcrumbSubcategory}
              </Link>
              {breadcrumbMinor ? (
                <>
                  <span className="text-slate-300">›</span>
                  <span className="text-slate-700">{breadcrumbMinor}</span>
                </>
              ) : null}
            </nav>

            <div className="grid gap-8 lg:grid-cols-[310px_1fr]">
              <aside className="h-fit overflow-hidden rounded-[4px] border border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-200 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Filtrar por</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {visibleProducts.length} resultados
                    </p>
                  </div>
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrand("Todas");
                        setSelectedAvailability("Todas");
                        setSelectedPriceRange("Todos");
                      }}
                      className="text-xs font-black uppercase tracking-[0.08em] text-[#075ed8] hover:underline"
                    >
                      Limpiar
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="border-b border-slate-200 px-5 py-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                  Categoría
                </p>
                <div className="mt-3 grid gap-2 text-sm font-semibold">
                  <Link
                    href={`/cauchos/categoria/${subcategorySlug}`}
                    className="text-[#075ed8] hover:underline"
                  >
                    {breadcrumbSubcategory}
                  </Link>
                  {breadcrumbMinor ? (
                    <span className="border-l-2 border-[#075ed8] pl-3 text-slate-700">
                      {breadcrumbMinor}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="border-b border-slate-200 px-5 py-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                  Marca
                </p>
                <div className="mt-3 grid gap-2">
                  {brands.map((brand) => (
                    renderFilterOption({
                      group: "brand",
                      value: brand,
                      count: countByBrand(brand),
                      selected: selectedBrand === brand,
                      onChange: () => setSelectedBrand(brand),
                    })
                  ))}
                </div>
              </div>

              <div className="border-b border-slate-200 px-5 py-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                  Disponibilidad
                </p>
                <div className="mt-3 grid gap-2">
                  {availabilities.map((availability) => (
                    renderFilterOption({
                      group: "availability",
                      value: availability,
                      count: countByAvailability(availability),
                      selected: selectedAvailability === availability,
                      onChange: () => setSelectedAvailability(availability),
                    })
                  ))}
                </div>
              </div>

              <div className="px-5 py-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-600">
                  Precio
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <input
                    readOnly
                    value="$0"
                    aria-label="Precio mínimo"
                    className="h-10 rounded-[4px] border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none"
                  />
                  <input
                    readOnly
                    value="$300.000+"
                    aria-label="Precio máximo"
                    className="h-10 rounded-[4px] border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600 outline-none"
                  />
                </div>
                <div className="mt-3 grid gap-2">
                  {["Todos", ...priceRanges.map((range) => range.label)].map((range) => (
                    renderFilterOption({
                      group: "price",
                      value: range,
                      count: countByPriceRange(range),
                      selected: selectedPriceRange === range,
                      onChange: () => setSelectedPriceRange(range),
                    })
                  ))}
                </div>
              </div>
              </aside>

              <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-slate-200 bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
                <p className="text-sm font-bold text-slate-500">
                  Mostrando <span className="text-slate-950">{visibleProducts.length}</span> de {categoryProducts.length} productos
                </p>
                <label className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  Ordenar
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none focus:border-[#075ed8]"
                  >
                    <option value="relevance">Relevancia</option>
                    <option value="price-asc">Menor precio</option>
                    <option value="price-desc">Mayor precio</option>
                    <option value="name">Nombre A-Z</option>
                  </select>
                </label>
              </div>

              {visibleProducts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => {
              const productImage =
                product.imagen === "/hero-unipars.jpg"
                  ? "/home-cauchos.png"
                  : product.imagen;

              return (
                <article
                  key={product.slug}
                  className="group flex min-h-[455px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#075ed8]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
                >
                  <Link
                    href={`/producto/${product.slug}`}
                    className="relative block h-52 overflow-hidden bg-slate-200"
                  >
                    <Image
                      src={productImage}
                      alt={product.nombre}
                      fill
                      sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-3 top-3 rounded-[4px] bg-[#e4002b] px-2.5 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(228,0,43,0.24)]">
                      {product.descuento}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#075ed8] shadow-sm">
                      Industrial
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#075ed8]">
                      {product.marca}
                    </span>
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[#075ed8]"
                    >
                      {product.nombre}
                    </Link>
                    <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                      {product.descripcion}
                    </p>
                    <span className="mt-3 inline-flex w-fit rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-black text-slate-600">
                      {product.disponibilidad}
                    </span>
                    <div className="mt-auto border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-slate-400 line-through decoration-[#e4002b]/50">
                        {product.precioAnterior}
                      </span>
                      <span className="mt-1 block text-2xl font-black tracking-[-0.02em] text-slate-950">
                        {product.precio}
                      </span>
                    </div>
                    <CauchosAddToCartButton
                      id={product.slug}
                      nombre={product.nombre}
                      precio={product.precio}
                      imagen={productImage}
                    />
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-3 inline-flex justify-center rounded-full border border-[#075ed8] bg-white px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-[#075ed8] transition-colors duration-200 hover:bg-[#075ed8] hover:text-white"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </article>
              );
                  })}
                </div>
              ) : (
                <div className="rounded-[10px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#075ed8]">
                    Sin resultados
                  </p>
                  <h2 className="mt-3 text-3xl font-black">No hay productos con esos filtros</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBrand("Todas");
                      setSelectedAvailability("Todas");
                      setSelectedPriceRange("Todos");
                    }}
                    className="mt-6 inline-flex rounded-full bg-[#075ed8] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[10px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#075ed8]">
              Sin productos todavía
            </p>
            <h2 className="mt-3 text-3xl font-black">Esta sección se llenará al crear productos</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">
              Cuando agregues productos con esta subcategoría desde el panel maestro, aparecerán aquí automáticamente.
            </p>
            <Link
              href="/cauchos"
              className="mt-6 inline-flex rounded-full bg-[#075ed8] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
            >
              Volver a Cauchos
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
