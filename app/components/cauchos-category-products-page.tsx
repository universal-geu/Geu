"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { cauchosCategorySubcategories, getCategoriasForDivision, slugify } from "../data/catalog";
import CauchosAddToCartButton from "./cauchos-add-to-cart-button";
import CauchosHeader from "./cauchos-header";
import { useProducts } from "./products-provider";
import { useSiteImages } from "./use-site-images";
import { resolveImage } from "@/lib/image-slots";
import { CART_ACCENT, DIVISION_BRAND, type DivisionName } from "@/lib/divisions";
import { expandProductCategoryViews } from "@/lib/product-category-views";

type Props = {
  segments?: string[];
  searchQuery?: string;
  division?: DivisionName;
};

const priceRanges = [
  { label: "Hasta $100.000", min: 0, max: 100000 },
  { label: "$100.000 a $300.000", min: 100000, max: 300000 },
  { label: "Más de $300.000", min: 300000, max: Number.POSITIVE_INFINITY },
];

const CATEGORY_BANNER: Record<DivisionName, { src: string; alt: string }> = {
  Cauchos: { src: "/cauchos-category-banner.jpg", alt: "Universal de Cauchos" },
  Import: { src: "/geu-import-main-banner.png", alt: "GEU Import" },
  Innovation: { src: "/cauchos-category-banner.jpg", alt: "GEU Innovation" },
  Energy: { src: "/cauchos-category-banner.jpg", alt: "GEU Energy" },
  Plastic: { src: "/geu-plastic-main-banner.png", alt: "GEU Plastic" },
};

export const FALLBACK_PRODUCT_IMAGE: Record<DivisionName, string> = {
  Cauchos: "/home-cauchos.png",
  Import: "/home-import.png",
  Innovation: "/home-cauchos.png",
  Energy: "/home-cauchos.png",
  Plastic: "/home-plastic.png",
};

function humanizeSegment(value?: string) {
  if (!value) return "";

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CauchosCategoryProductsPage({
  segments = [],
  searchQuery,
  division = "Cauchos",
}: Props) {
  const { products } = useProducts();
  const siteImages = useSiteImages();
  const brand = DIVISION_BRAND[division];
  const cartAccent = CART_ACCENT[division];
  const [subcategorySlug, minorSlug] = segments;
  const [selectedBrand, setSelectedBrand] = useState("Todas");
  const [selectedAvailability, setSelectedAvailability] = useState("Todas");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Todos");
  const [sortBy, setSortBy] = useState("relevance");

  const trimmedSearchQuery = searchQuery?.trim() ?? "";
  const isSearchMode = trimmedSearchQuery.length > 0;

  const categoryProducts = useMemo(() => {
    if (isSearchMode) {
      const needle = trimmedSearchQuery.toLowerCase();
      return products.filter((product) => {
        if (product.division !== division) return false;

        return (
          product.nombre.toLowerCase().includes(needle) ||
          product.marca.toLowerCase().includes(needle) ||
          product.categoria.toLowerCase().includes(needle) ||
          (product.subcategoria?.toLowerCase().includes(needle) ?? false) ||
          (product.sku?.toLowerCase().includes(needle) ?? false) ||
          (product.categoriasAdicionales?.some(
            (entry) =>
              entry.categoria.toLowerCase().includes(needle) ||
              (entry.subcategoria?.toLowerCase().includes(needle) ?? false),
          ) ?? false)
        );
      });
    }

    return expandProductCategoryViews(products, division).filter((product) => {
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
  }, [division, isSearchMode, minorSlug, products, subcategorySlug, trimmedSearchQuery]);

  const matchedDepartment = useMemo(
    () => getCategoriasForDivision(division).find((title) => slugify(title) === subcategorySlug),
    [division, subcategorySlug],
  );
  const placeholderGroups = useMemo(() => {
    if (minorSlug || !matchedDepartment) return [];
    return cauchosCategorySubcategories[matchedDepartment] ?? [];
  }, [matchedDepartment, minorSlug]);

  const resolvedDepartment = matchedDepartment || categoryProducts[0]?.categoria || null;

  const subcategoryQuickNav = useMemo(() => {
    if (isSearchMode || minorSlug || !resolvedDepartment) return [];
    const menuGroups = cauchosCategorySubcategories[resolvedDepartment] ?? [];

    const departmentProducts = expandProductCategoryViews(products, division).filter(
      (product) => product.categoria.trim() === resolvedDepartment,
    );

    const bySubcategory = new Map<string, number>();
    for (const product of departmentProducts) {
      const name = product.subcategoria?.trim();
      if (!name) continue;
      bySubcategory.set(name, (bySubcategory.get(name) ?? 0) + 1);
    }

    if (bySubcategory.size < 2) return [];

    return Array.from(bySubcategory.entries()).map(([name, count]) => {
      const imageKey = menuGroups.find((group) => group.name === name)?.imageKey;
      return {
        name,
        count,
        image: imageKey ? resolveImage(imageKey, siteImages) : null,
        href: `${brand.basePath}/categoria/${slugify(name)}`,
        active: slugify(name) === subcategorySlug,
      };
    });
  }, [brand.basePath, division, isSearchMode, minorSlug, products, resolvedDepartment, siteImages, subcategorySlug]);

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
    (!minorSlug && matchedDepartment) ||
    categoryProducts[0]?.subcategoria ||
    humanizeSegment(subcategorySlug) ||
    "Productos";
  const breadcrumbMinor = minorSlug
    ? categoryProducts[0]?.categoriaMenor || humanizeSegment(minorSlug)
    : undefined;
  const breadcrumbDepartment = resolvedDepartment;
  const breadcrumbDepartmentSlug = breadcrumbDepartment
    ? slugify(breadcrumbDepartment)
    : null;
  const showBreadcrumbDepartment =
    Boolean(breadcrumbDepartment) && breadcrumbDepartmentSlug !== subcategorySlug;
  const countByBrand = (brandName: string) =>
    brandName === "Todas"
      ? categoryProducts.length
      : categoryProducts.filter((product) => product.marca === brandName).length;
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
          ? "bg-[#eef5ff] text-[var(--brand-accent)]"
          : "text-slate-700 hover:bg-slate-50 hover:text-[var(--brand-accent)]"
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
            selected ? "border-[var(--brand-accent)] bg-[var(--brand-accent)]" : "border-slate-300 bg-white"
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

  const banner =
    division === "Import"
      ? { src: resolveImage("import-cierre", siteImages), alt: "GEU Import" }
      : CATEGORY_BANNER[division];
  const fallbackProductImage = FALLBACK_PRODUCT_IMAGE[division];

  return (
    <main
      className="min-h-screen bg-slate-50 text-slate-950"
      style={{ "--brand-accent": brand.accent } as CSSProperties}
    >
      <CauchosHeader division={division} />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1632px] overflow-hidden rounded-[8px] px-5 pb-3 pt-5 md:px-8">
          <Image
            src={banner.src}
            alt={banner.alt}
            width={1920}
            height={217}
            className="h-[118px] w-full rounded-[8px] object-cover md:h-[150px]"
            priority
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1632px] px-5 pb-10 pt-5 md:px-8">
        {categoryProducts.length > 0 ? (
          <div>
            {isSearchMode ? (
              <nav
                aria-label="Ruta de categoría"
                className="mb-4 flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-[2px] border border-slate-100 bg-white px-6 py-3 text-sm font-semibold text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
              >
                <span>
                  <Link href={brand.basePath} className="text-[var(--brand-accent)] hover:underline">
                    {division}
                  </Link>
                  <span className="mx-3 text-slate-300">›</span>
                  <span className="text-slate-700">
                    Resultados para &ldquo;{trimmedSearchQuery}&rdquo;
                  </span>
                </span>
                <Link href={brand.basePath} className="text-[var(--brand-accent)] hover:underline">
                  Volver a {division}
                </Link>
              </nav>
            ) : (
              <nav
                aria-label="Ruta de categoría"
                className="mb-4 flex min-h-12 flex-wrap items-center gap-3 rounded-[2px] border border-slate-100 bg-white px-6 py-3 text-sm font-semibold text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
              >
                <Link href={brand.basePath} className="text-[var(--brand-accent)] hover:underline">
                  {division}
                </Link>
                {showBreadcrumbDepartment ? (
                  <>
                    <span className="text-slate-300">›</span>
                    <Link
                      href={`${brand.basePath}/categoria/${breadcrumbDepartmentSlug}`}
                      className="text-[var(--brand-accent)] hover:underline"
                    >
                      {breadcrumbDepartment}
                    </Link>
                  </>
                ) : null}
                <span className="text-slate-300">›</span>
                <Link
                  href={`${brand.basePath}/categoria/${subcategorySlug}`}
                  className="text-[var(--brand-accent)] hover:underline"
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
            )}

            {subcategoryQuickNav.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-x-10 gap-y-4 rounded-[4px] border border-slate-100 bg-white px-6 py-5 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                {subcategoryQuickNav.map((group) => (
                  <Link
                    key={group.name}
                    href={group.href}
                    className="flex shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={`relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border bg-slate-50 ${
                        group.active ? "border-2 border-[var(--brand-accent)]" : "border-slate-200"
                      }`}
                    >
                      {group.image ? (
                        <Image
                          src={group.image}
                          alt={group.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs font-black text-[var(--brand-accent)]">
                          {group.name.charAt(0)}
                        </span>
                      )}
                    </span>
                    <span
                      className={`max-w-[96px] text-xs font-bold leading-tight ${
                        group.active ? "text-[var(--brand-accent)]" : "text-slate-800"
                      }`}
                    >
                      {group.name}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {group.count} producto{group.count === 1 ? "" : "s"}
                    </span>
                  </Link>
                ))}
              </div>
            )}

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
                      className="text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-accent)] hover:underline"
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
                    href={`${brand.basePath}/categoria/${subcategorySlug}`}
                    className="text-[var(--brand-accent)] hover:underline"
                  >
                    {breadcrumbSubcategory}
                  </Link>
                  {breadcrumbMinor ? (
                    <span className="border-l-2 border-[var(--brand-accent)] pl-3 text-slate-700">
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
                  {brands.map((brandName) => (
                    renderFilterOption({
                      group: "brand",
                      value: brandName,
                      count: countByBrand(brandName),
                      selected: selectedBrand === brandName,
                      onChange: () => setSelectedBrand(brandName),
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
                    className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none focus:border-[var(--brand-accent)]"
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
                  ? fallbackProductImage
                  : product.imagen;

              return (
                <article
                  key={product.slug}
                  className="group flex min-h-[455px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[var(--brand-accent)]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
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
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[var(--brand-accent)] shadow-sm">
                      Industrial
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--brand-accent)]">
                      {product.marca}
                    </span>
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[var(--brand-accent)]"
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
                      accent={cartAccent}
                    />
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-3 inline-flex justify-center rounded-full border border-[var(--brand-accent)] bg-white px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-[var(--brand-accent)] transition-colors duration-200 hover:bg-[var(--brand-accent)] hover:text-white"
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
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-accent)]">
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
                    className="mt-6 inline-flex rounded-full bg-[var(--brand-accent)] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {matchedDepartment && (
              <nav
                aria-label="Ruta de categoría"
                className="mb-4 flex min-h-12 flex-wrap items-center gap-3 rounded-[2px] border border-slate-100 bg-white px-6 py-3 text-sm font-semibold text-slate-500 shadow-[0_10px_28px_rgba(15,23,42,0.04)]"
              >
                <Link href={brand.basePath} className="text-[var(--brand-accent)] hover:underline">
                  {division}
                </Link>
                <span className="text-slate-300">›</span>
                <span className="text-slate-700">{matchedDepartment}</span>
              </nav>
            )}

            {placeholderGroups.length > 0 && (
              <div className="mb-6 rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] md:p-8">
                <h1 className="text-2xl font-black md:text-3xl">{matchedDepartment}</h1>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Explora las subcategorías de esta industria.
                </p>

                <div className="mt-6 flex flex-wrap gap-x-10 gap-y-6">
                  {placeholderGroups.map((group) => (
                    <div key={group.name} className="flex w-24 shrink-0 flex-col items-center gap-2 text-center">
                      <span className="relative block h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                        <Image
                          src={resolveImage(group.imageKey, siteImages)}
                          alt={group.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-bold leading-tight text-slate-800">{group.name}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-8 grid gap-x-8 gap-y-8 border-t border-slate-100 pt-6"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
                >
                  {placeholderGroups.map((group, index) => (
                    <div
                      key={group.name}
                      className={index === 0 ? "" : "border-l border-slate-100 pl-8"}
                    >
                      <p className="text-[13px] font-black tracking-[0.02em] text-[var(--brand-accent)]">
                        {group.name}
                      </p>
                      <div className="mt-3 grid gap-2 text-[13px] text-slate-900">
                        {group.items.map((item) => (
                          <Link
                            key={item}
                            href={`${brand.basePath}/categoria/${subcategorySlug}/${slugify(item)}`}
                            className="leading-5 hover:text-[var(--brand-accent)] hover:underline"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[10px] border border-slate-200 bg-white px-6 py-12 text-center shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
              {isSearchMode ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                    Sin resultados
                  </p>
                  <h2 className="mt-3 text-3xl font-black">
                    No encontramos productos para &ldquo;{trimmedSearchQuery}&rdquo;
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                    Prueba con otra palabra o revisa el catálogo completo de {brand.label}.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand-accent)]">
                    Sin productos todavía
                  </p>
                  <h2 className="mt-3 text-3xl font-black">Esta sección se llenará al crear productos</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                    Cuando agregues productos con esta subcategoría desde el panel maestro, aparecerán aquí automáticamente.
                  </p>
                </>
              )}
              <Link
                href={brand.basePath}
                className="mt-6 inline-flex rounded-full bg-[var(--brand-accent)] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white"
              >
                Volver a {division}
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
