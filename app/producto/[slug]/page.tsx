"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import AddToCartButton from "../../components/add-to-cart-button";
import CauchosCartLink from "../../components/cauchos-cart-link";
import CauchosCategorySidebarMenu from "../../components/cauchos-category-sidebar-menu";
import CauchosMenuButton from "../../components/cauchos-menu-button";
import { CauchosMenuProvider } from "../../components/cauchos-menu-context";
import { useProducts } from "../../components/products-provider";
import { cauchosCategoriasNombres } from "../../data/catalog";

const importProductNavItems = [
  "Luces y direccionales",
  "Motores",
  "Mecanizados",
  "Inyeccion y extrusion",
  "Linea electrica",
  "Busqueda global",
  "Logistica",
  "Rastreo",
];

function normalizeProductDivision(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function belongsToUniversalCauchos(producto: {
  categoria: string;
  marca: string;
  nombre: string;
  subcategoria?: string;
  categoriaMenor?: string;
}) {
  const divisionText = normalizeProductDivision(
    [
      producto.categoria,
      producto.subcategoria || "",
      producto.categoriaMenor || "",
      producto.marca,
      producto.nombre,
    ].join(" "),
  );

  return (
    (cauchosCategoriasNombres as readonly string[]).includes(producto.categoria) ||
    divisionText.includes("caucho") ||
    divisionText.includes("universal de cauchos") ||
    divisionText.includes("laminas") ||
    divisionText.includes("sellos") ||
    divisionText.includes("empaques") ||
    divisionText.includes("mangueras")
  );
}

function ProductImageGallery({
  nombre,
  images,
  accent = "blue",
}: {
  nombre: string;
  images: string[];
  accent?: "blue" | "red";
}) {
  const [activeImage, setActiveImage] = useState(images[0] || "");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeImageIndex = Math.max(images.indexOf(activeImage), 0);

  const goToPreviousImage = () => {
    const previousIndex =
      activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1;
    setActiveImage(images[previousIndex]);
  };

  const goToNextImage = () => {
    const nextIndex =
      activeImageIndex === images.length - 1 ? 0 : activeImageIndex + 1;
    setActiveImage(images[nextIndex]);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[100px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 md:order-1 md:flex-col">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={`overflow-hidden rounded-[1.1rem] border-2 bg-white p-2 shadow-sm transition-all duration-200 ${
              activeImage === image
                ? accent === "red"
                  ? "border-[#e31313] shadow-[0_12px_24px_rgba(227,19,19,0.18)]"
                  : "border-[#2d7af0] shadow-[0_12px_24px_rgba(45,122,240,0.18)]"
                : accent === "red"
                  ? "border-black/8 hover:border-[#e31313]/35"
                  : "border-black/8 hover:border-[#2d7af0]/35"
            }`}
          >
            <Image
              src={image}
              alt={`${nombre} vista ${index + 1}`}
              width={84}
              height={84}
              className="h-16 w-16 object-contain md:h-20 md:w-20"
            />
          </button>
        ))}
      </div>

      <div className="order-1 rounded-[1.6rem] bg-white md:order-2">
        <div className="flex justify-end">
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${accent === "red" ? "bg-[#fff0f0] text-[#e31313]" : "bg-[#edf4ff] text-[#2d7af0]"}`}>
            Envío disponible
          </span>
        </div>
        <div className="flex items-center justify-center px-4 py-6 md:px-10 md:py-10">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="group relative w-full"
          >
            <Image
              src={activeImage}
              alt={nombre}
              width={1200}
              height={900}
              className="h-auto max-h-[620px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
            />
            <span className="absolute bottom-4 right-4 rounded-full bg-[#16384f]/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Ampliar
            </span>
          </button>
        </div>
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-[120] bg-[#0f1a24]/88 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default"
            aria-label="Cerrar vista ampliada"
          />

          <div className="relative z-[121] flex h-full w-full items-center justify-center px-4 py-8 md:px-8">
            <div className="grid max-h-full w-full max-w-6xl gap-4 md:grid-cols-[110px_minmax(0,1fr)]">
              <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-visible">
                {images.map((image, index) => (
                  <button
                    key={`lightbox-${image}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(image)}
                    className={`overflow-hidden rounded-[1.1rem] border-2 bg-white/95 p-2 shadow-sm transition-all duration-200 ${
                      activeImage === image
                        ? accent === "red"
                          ? "border-[#e31313] shadow-[0_12px_24px_rgba(227,19,19,0.18)]"
                          : "border-[#2d7af0] shadow-[0_12px_24px_rgba(45,122,240,0.18)]"
                        : accent === "red"
                          ? "border-white/10 hover:border-[#e31313]/35"
                          : "border-white/10 hover:border-[#2d7af0]/35"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${nombre} ampliada ${index + 1}`}
                      width={84}
                      height={84}
                      className="h-16 w-16 object-contain md:h-20 md:w-20"
                    />
                  </button>
                ))}
              </div>

              <div className="order-1 flex min-h-[60vh] items-center justify-center rounded-[2rem] border border-white/10 bg-white/6 p-6 md:order-2 md:p-10">
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/10 text-xl text-white transition-colors duration-200 hover:bg-white/18"
                  aria-label="Cerrar lightbox"
                >
                  ×
                </button>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-white/10 text-2xl text-white transition-colors duration-200 hover:bg-white/18 md:left-6"
                      aria-label="Imagen anterior"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-white/10 text-2xl text-white transition-colors duration-200 hover:bg-white/18 md:right-6"
                      aria-label="Imagen siguiente"
                    >
                      ›
                    </button>
                  </>
                )}

                <Image
                  src={activeImage}
                  alt={`${nombre} ampliada`}
                  width={1600}
                  height={1200}
                  className="max-h-[78vh] w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCauchosHeader() {
  return (
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

      <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[280px_1fr_auto] md:px-8">
        <Link href="/cauchos" className="flex shrink-0 items-center">
          <Image
            src="/logo-universal-cauchos.png"
            alt="GEU Universal de Cauchos"
            width={2518}
            height={420}
            priority
            className="h-auto object-contain"
            style={{ width: "260px", maxWidth: "100%" }}
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
  );
}

function ProductImportHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
          <div className="hidden gap-3 md:flex">
            <span>Servicio al cliente 320 88 999 33</span>
            <span className="text-slate-300">|</span>
            <span>Importaciones empresariales</span>
            <span className="text-slate-300">|</span>
            <span>Centro de ayuda</span>
          </div>
          <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
            <Link href="/import#contacto" className="hover:text-[#e31313]">
              Cotizaciones
            </Link>
            <Link href="/import#productos" className="hover:text-[#e31313]">
              Catalogos
            </Link>
            <Link href="/quienes-somos" className="hover:text-[#e31313]">
              GEU empresas
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[300px_1fr_auto] md:px-8">
        <Link href="/import" className="flex shrink-0 items-center">
          <span className="inline-flex items-center gap-2 font-[family:var(--font-display)] text-3xl font-black tracking-[0.08em] text-slate-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e31313] text-xs text-[#e31313]">
              GE
            </span>
            GEU
            <span className="text-[#e31313]">Import</span>
          </span>
        </Link>

        <form className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
          <input
            aria-label="Buscar productos importados"
            className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Buscar luces, motores, mecanizados, referencias..."
          />
          <button
            type="button"
            className="flex w-14 items-center justify-center border-l border-slate-200 text-xl text-slate-800"
            aria-label="Buscar"
          >
            ⌕
          </button>
        </form>

        <div className="flex items-center justify-between gap-5 text-sm text-slate-700 md:justify-end">
          <CauchosCartLink accent="red" href="/carrito?brand=import" />
          <Link href="/login?next=/mi-cuenta&brand=import" className="font-bold hover:text-[#e31313]">
            Mi cuenta
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <nav className="flex min-h-14 items-stretch justify-between gap-2 overflow-x-auto text-[11px] font-black uppercase tracking-[0.02em] text-slate-800">
            {importProductNavItems.map((item, index) => (
              <Link
                key={item}
                href={index < 6 ? "/import#catalogo-import" : index === 7 ? "/import#rastreo" : "/import#contacto"}
                className="flex min-w-max items-center border-b-2 border-transparent px-3 text-center hover:border-[#e31313] hover:text-[#e31313]"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default function ProductoDetallePage() {
  const params = useParams<{ slug: string }>();
  const { products } = useProducts();
  const [cantidad, setCantidad] = useState(1);
  const slug = params.slug;
  const producto = products.find((item) => item.slug === slug);
  const galleryImages = useMemo(
    () =>
      producto
        ? [producto.imagen, ...(producto.imagenesExtra || [])].filter(Boolean)
        : [],
    [producto],
  );

  const maxCantidad = Math.max(1, producto?.stock ?? 1);

  if (!producto) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto max-w-[960px] px-6 py-20 text-center">
          <div className="rounded-[2rem] border border-dashed border-black/12 bg-white p-12 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#4f545a]">
              Producto no encontrado
            </h1>
            <p className="mt-4 text-lg text-[#6e7379]">
              Puede que este producto ya no exista o todavía no esté disponible.
            </p>
            <Link
              href="/cauchos"
              className="mt-8 inline-flex rounded-full bg-[#ed8435] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#d67024]"
            >
              Volver al catálogo
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const ajustarCantidad = (delta: number) => {
    setCantidad((actual) => {
      const siguiente = actual + delta;
      if (siguiente < 1) return 1;
      if (siguiente > maxCantidad) return maxCantidad;
      return siguiente;
    });
  };

  const relacionados = products
    .filter(
      (item) =>
        item.categoria === producto.categoria && item.slug !== producto.slug,
    )
    .slice(0, 3);
  const isCauchosProduct = belongsToUniversalCauchos(producto);
  const isImportProduct = !isCauchosProduct;
  const productImage = producto.imagen === "/hero-unipars.jpg" && isImportProduct
    ? "/home-import.png"
    : producto.imagen;
  const fichaTecnica = [
    {
      etiqueta: "Observaciones",
      valor:
        "La imagen de este producto es de referencia visual y puede variar levemente frente a la versión final entregada.",
    },
    {
      etiqueta: "Material",
      valor: "Aleación técnica de alta resistencia",
    },
    {
      etiqueta: "Categoría",
      valor: producto.categoria,
    },
    {
      etiqueta: "Marca",
      valor: producto.marca,
    },
    {
      etiqueta: "Disponibilidad",
      valor: producto.disponibilidad,
    },
    {
      etiqueta: "Garantía",
      valor: "1 año de garantía del fabricante",
    },
    {
      etiqueta: "Aplicación",
      valor: "Uso técnico, industrial y de reposición especializada",
    },
    {
      etiqueta: "Origen",
      valor: "Importado",
    },
  ];

  return (
    <>
      {isCauchosProduct && <ProductCauchosHeader />}
      {isImportProduct && <ProductImportHeader />}
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <section className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-[#6e7379]">
          <Link
            href={isImportProduct ? "/import#productos" : `/cauchos/categoria/${encodeURIComponent(
                producto.categoria
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, ""),
              )}`}
            className={`font-bold transition-colors duration-200 hover:text-slate-950 ${isImportProduct ? "text-[#e31313]" : "text-[#075ed8]"}`}
          >
            {isImportProduct ? "Volver a GEU Import" : "Volver a categoría"}
          </Link>
          <span>·</span>
          <span>{producto.categoria}</span>
          <span>·</span>
          <span>{producto.marca}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <div className={`rounded-[2rem] border bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] ${isImportProduct ? "border-slate-200" : "border-black/8"}`}>
            <ProductImageGallery
              key={producto.slug}
              nombre={producto.nombre}
              images={galleryImages.map((image) => image === "/hero-unipars.jpg" && isImportProduct ? "/home-import.png" : image)}
              accent={isImportProduct ? "red" : "blue"}
            />

            <div className={`mt-6 overflow-hidden rounded-[1.2rem] border ${isImportProduct ? "border-slate-200" : "border-black/8"}`}>
              <div className={`flex items-center justify-between border-b px-6 py-4 ${isImportProduct ? "border-slate-200 bg-[#f8f8f7]" : "border-black/8 bg-[#f8f8f7]"}`}>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#33373d]">
                  Ficha técnica
                </h2>
                <span className={`text-xl ${isImportProduct ? "text-[#e31313]" : "text-[#4f545a]"}`}>⌃</span>
              </div>

              <div className="bg-white">
                <div className="border-b border-black/8 px-6 py-4">
                  <h3 className={`text-xl font-semibold ${isImportProduct ? "text-slate-950" : "text-[#33373d]"}`}>
                    Especificaciones
                  </h3>
                </div>

                <div>
                  {fichaTecnica.map((item, index) => (
                    <div
                      key={item.etiqueta}
                      className={`grid md:grid-cols-[260px_minmax(0,1fr)] ${
                        index < fichaTecnica.length - 1
                          ? "border-b border-black/8"
                          : ""
                      }`}
                    >
                      <div className={`${isImportProduct ? "bg-[#fff4f4] text-slate-800" : "bg-[#f3f3f2] text-[#33373d]"} px-6 py-5 text-lg`}>
                        {item.etiqueta}
                      </div>
                      <div className="px-6 py-5 text-lg font-medium leading-8 text-[#22262b]">
                        {item.valor}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-5 rounded-[10px] border p-8 shadow-[0_14px_36px_rgba(15,23,42,0.07)] ${isImportProduct ? "border-slate-200 bg-white" : "border-slate-200 bg-white"}`}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.12em] ${isImportProduct ? "text-[#e31313]" : "text-[#075ed8]"}`}>
                  {isImportProduct ? `GEU Import · ${producto.marca}` : producto.marca}
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.02em] text-slate-950 md:text-4xl">
                  {producto.nombre}
                </h1>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Código {producto.sku || producto.slug.toUpperCase().replace(/-/g, "")}
                </p>
              </div>

              <button className={`text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200 ${isImportProduct ? "text-[#e31313] hover:text-slate-950" : "text-[#075ed8] hover:text-slate-950"}`}>
                Guardar
              </button>
            </div>

            <div className="flex items-center gap-3 border-y border-slate-100 py-4">
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${isImportProduct ? "bg-[#e31313] text-white" : "bg-[#eef5ff] text-slate-600"}`}>
                {producto.disponibilidad}
              </span>
              <span className="text-xs font-bold text-slate-400">★★★★★</span>
              <span className="text-xs font-bold text-slate-500">0.0 (0)</span>
            </div>

            <div>
              <p className={`text-xs font-bold text-slate-400 line-through ${isImportProduct ? "decoration-[#e4002b]/50" : "decoration-[#075ed8]/50"}`}>
                {producto.precioAnterior}
              </p>
              <p className="mt-1 text-4xl font-black tracking-[-0.02em] text-slate-950">
                {producto.precio}
              </p>
              <p className="mt-3 text-sm font-bold text-slate-500">
                Stock disponible: {producto.stock ?? 0}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => ajustarCantidad(-1)}
                  className="px-5 py-3 text-xl font-bold text-slate-500 transition-colors duration-200 hover:bg-slate-50"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <div className="border-x border-slate-200 px-7 py-3 text-lg font-black text-slate-950">
                  {cantidad}
                </div>
                <button
                  type="button"
                  onClick={() => ajustarCantidad(1)}
                  className="px-5 py-3 text-xl font-bold text-slate-500 transition-colors duration-200 hover:bg-slate-50"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>

              <AddToCartButton
                id={producto.slug}
                nombre={producto.nombre}
                precio={producto.precio}
                imagen={productImage}
                cantidad={cantidad}
                disabled={!producto.puedeComprar}
                variant={isCauchosProduct ? "cauchos" : "import"}
              />
            </div>

            <div className={`rounded-[10px] border p-6 ${isImportProduct ? "border-[#f0caca] bg-[#fff7f7]" : "border-slate-200 bg-slate-50"}`}>
              <h2 className="text-xl font-black text-slate-950">
                Especificaciones principales
              </h2>
              <ul className="mt-4 space-y-3 text-base font-semibold leading-7 text-slate-600">
                <li>Compatibilidad directa con la línea {producto.categoria}.</li>
                <li>Producto con respaldo comercial y disponibilidad {producto.disponibilidad.toLowerCase()}.</li>
                <li>Inventario actual: {producto.stock ?? 0} unidad{(producto.stock ?? 0) === 1 ? "" : "es"}.</li>
                <li>Componente pensado para rendimiento estable y mantenimiento ágil.</li>
              </ul>
              <button className={`mt-5 text-sm font-black uppercase tracking-[0.06em] transition-colors duration-200 ${isImportProduct ? "text-[#e31313] hover:text-slate-950" : "text-[#075ed8] hover:text-slate-950"}`}>
                Ver más especificaciones
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-8">
          <p className={`mb-2 text-xs font-black uppercase tracking-[0.16em] ${isImportProduct ? "text-[#e31313]" : "text-[#075ed8]"}`}>
            Relacionados
          </p>
          <h2 className="text-3xl font-black tracking-[-0.02em] text-slate-950 md:text-5xl">
            Más productos de esta categoría
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {relacionados.map((item) => (
            <article
              key={item.slug}
              className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)]"
            >
              <Image
                src={item.imagen === "/hero-unipars.jpg" && isImportProduct ? "/home-import.png" : item.imagen}
                alt={item.nombre}
                width={900}
                height={700}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-4 p-5">
                <div>
                  <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.12em] ${isImportProduct ? "text-[#e31313]" : "text-[#075ed8]"}`}>
                    {item.categoria} · {item.marca}
                  </p>
                  <h3 className="text-xl font-black leading-tight tracking-[-0.02em] text-slate-950">
                    {item.nombre}
                  </h3>
                </div>

                <p className="text-2xl font-black text-slate-950">
                  {item.precio}
                </p>

                <Link
                  href={`/producto/${item.slug}`}
                  className={`inline-flex rounded-full border bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200 ${isImportProduct ? "border-[#e31313] text-[#e31313] hover:bg-[#e31313] hover:text-white" : "border-[#075ed8] text-[#075ed8] hover:bg-[#075ed8] hover:text-white"}`}
                >
                  Ver producto
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      </main>
    </>
  );
}
