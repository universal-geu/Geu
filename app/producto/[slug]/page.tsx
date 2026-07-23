"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import CauchosAddToCartButton from "../../components/cauchos-add-to-cart-button";
import CauchosHeader from "../../components/cauchos-header";
import { useProducts } from "../../components/products-provider";
import { FALLBACK_PRODUCT_IMAGE } from "../../components/cauchos-category-products-page";
import { slugCategoria } from "../../data/catalog";
import { CART_ACCENT, DIVISION_BRAND, isServiceDivision } from "@/lib/divisions";

const ACCENT_TEXT_CLASS = {
  blue: "text-[#075ed8]",
  red: "text-[#e31313]",
  gray: "text-[#6b7280]",
} as const;

const ACCENT_DECORATION_CLASS = {
  blue: "decoration-[#075ed8]/50",
  red: "decoration-[#e31313]/50",
  gray: "decoration-[#6b7280]/50",
} as const;

const OUTLINE_BUTTON_CLASS = {
  blue: "border-[#075ed8] text-[#075ed8] hover:bg-[#075ed8] hover:text-white",
  red: "border-[#e31313] text-[#e31313] hover:bg-[#e31313] hover:text-white",
  gray: "border-[#6b7280] text-[#6b7280] hover:bg-[#6b7280] hover:text-white",
} as const;

const GALLERY_ACTIVE_BORDER_CLASS = {
  blue: "border-[#2d7af0] shadow-[0_12px_24px_rgba(45,122,240,0.18)]",
  red: "border-[#e31313] shadow-[0_12px_24px_rgba(227,19,19,0.18)]",
  gray: "border-[#6b7280] shadow-[0_12px_24px_rgba(107,114,128,0.18)]",
} as const;

const GALLERY_HOVER_BORDER_CLASS = {
  blue: "border-black/8 hover:border-[#2d7af0]/35",
  red: "border-black/8 hover:border-[#e31313]/35",
  gray: "border-black/8 hover:border-[#6b7280]/35",
} as const;

const GALLERY_LIGHTBOX_HOVER_BORDER_CLASS = {
  blue: "border-white/10 hover:border-[#2d7af0]/35",
  red: "border-white/10 hover:border-[#e31313]/35",
  gray: "border-white/10 hover:border-[#6b7280]/35",
} as const;

const GALLERY_BADGE_CLASS = {
  blue: "bg-[#edf4ff] text-[#2d7af0]",
  red: "bg-[#fff0f0] text-[#e31313]",
  gray: "bg-slate-100 text-[#6b7280]",
} as const;

function ProductImageGallery({
  nombre,
  images,
  accent = "blue",
}: {
  nombre: string;
  images: string[];
  accent?: "blue" | "red" | "gray";
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
                ? GALLERY_ACTIVE_BORDER_CLASS[accent]
                : GALLERY_HOVER_BORDER_CLASS[accent]
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
          <span className={`rounded-full px-4 py-2 text-sm font-medium ${GALLERY_BADGE_CLASS[accent]}`}>
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
                        ? GALLERY_ACTIVE_BORDER_CLASS[accent]
                        : GALLERY_LIGHTBOX_HOVER_BORDER_CLASS[accent]
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
              href="/"
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
  const productDivision = producto.division ?? "Cauchos";
  const cartAccent = CART_ACCENT[productDivision];
  const isRed = cartAccent === "red";
  const accentTextClass = ACCENT_TEXT_CLASS[cartAccent];
  const isService = isServiceDivision(productDivision);
  const canPurchase = isService ? true : producto.puedeComprar;
  const productImage =
    producto.imagen === "/hero-unipars.jpg"
      ? FALLBACK_PRODUCT_IMAGE[productDivision]
      : producto.imagen;
  const fichaTecnica =
    producto.especificacionesTecnicas && producto.especificacionesTecnicas.length > 0
      ? producto.especificacionesTecnicas
      : [
          { etiqueta: "Categoría", valor: producto.categoria },
          { etiqueta: "Marca", valor: producto.marca },
          { etiqueta: "Disponibilidad", valor: producto.disponibilidad },
          ...(producto.garantia ? [{ etiqueta: "Garantía", valor: producto.garantia }] : []),
          ...(producto.aplicacion ? [{ etiqueta: "Aplicación", valor: producto.aplicacion }] : []),
        ];

  return (
    <>
      <CauchosHeader division={productDivision} />
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
      <section className="mx-auto max-w-[1440px] px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-[#6e7379]">
          <Link
            href={`${DIVISION_BRAND[productDivision].basePath}/categoria/${slugCategoria(producto.categoria)}`}
            className={`font-bold transition-colors duration-200 hover:text-slate-950 ${accentTextClass}`}
          >
            Volver a categoría
          </Link>
          <span>·</span>
          <span>{producto.categoria}</span>
          <span>·</span>
          <span>{producto.marca}</span>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
          <div className={`rounded-[2rem] border bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] ${isRed ? "border-slate-200" : "border-black/8"}`}>
            <ProductImageGallery
              key={producto.slug}
              nombre={producto.nombre}
              images={galleryImages.map((image) => (image === "/hero-unipars.jpg" ? FALLBACK_PRODUCT_IMAGE[productDivision] : image))}
              accent={cartAccent}
            />

            {producto.descripcion && (
              <div className={`mt-6 overflow-hidden rounded-[1.2rem] border ${isRed ? "border-slate-200" : "border-black/8"}`}>
                <div className={`flex items-center justify-between border-b px-6 py-4 ${isRed ? "border-slate-200 bg-[#f8f8f7]" : "border-black/8 bg-[#f8f8f7]"}`}>
                  <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#33373d]">
                    Descripción
                  </h2>
                </div>
                <div className="bg-white px-6 py-5">
                  <p className="whitespace-pre-line text-lg leading-8 text-[#22262b]">
                    {producto.descripcion}
                  </p>
                  {producto.fichaTecnicaUrl && (
                    <a
                      href={producto.fichaTecnicaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-5 inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-black uppercase tracking-[0.06em] transition-colors duration-200 ${OUTLINE_BUTTON_CLASS[cartAccent]}`}
                    >
                      Descargar ficha técnica (PDF)
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className={`mt-6 overflow-hidden rounded-[1.2rem] border ${isRed ? "border-slate-200" : "border-black/8"}`}>
              <div className={`flex items-center justify-between border-b px-6 py-4 ${isRed ? "border-slate-200 bg-[#f8f8f7]" : "border-black/8 bg-[#f8f8f7]"}`}>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#33373d]">
                  Ficha técnica
                </h2>
                <span className={`text-xl ${accentTextClass}`}>⌃</span>
              </div>

              <div className="bg-white">
                <div className="border-b border-black/8 px-6 py-4">
                  <h3 className={`text-xl font-semibold ${isRed ? "text-slate-950" : "text-[#33373d]"}`}>
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
                      <div className={`${isRed ? "bg-[#fff4f4] text-slate-800" : "bg-[#f3f3f2] text-[#33373d]"} px-6 py-5 text-lg`}>
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

          <div className="space-y-5 rounded-[10px] border border-slate-200 bg-white p-8 shadow-[0_14px_36px_rgba(15,23,42,0.07)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className={`text-[11px] font-black uppercase tracking-[0.12em] ${accentTextClass}`}>
                  {producto.marca}
                </p>
                <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.02em] text-slate-950 md:text-4xl">
                  {producto.nombre}
                </h1>
                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Código {producto.sku || producto.slug.toUpperCase().replace(/-/g, "")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-y border-slate-100 py-4">
              <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${isRed ? "bg-[#e31313] text-white" : "bg-[#eef5ff] text-slate-600"}`}>
                {producto.disponibilidad}
              </span>
            </div>

            <div>
              <p className={`text-xs font-bold text-slate-400 line-through ${ACCENT_DECORATION_CLASS[cartAccent]}`}>
                {producto.precioAnterior}
              </p>
              <p className="mt-1 text-4xl font-black tracking-[-0.02em] text-slate-950">
                {producto.precio}
              </p>
              {!isService && (
                <p className="mt-3 text-sm font-bold text-slate-500">
                  Stock disponible: {producto.stock ?? 0}
                </p>
              )}
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

              <CauchosAddToCartButton
                id={producto.slug}
                nombre={producto.nombre}
                precio={producto.precio}
                imagen={productImage}
                cantidad={cantidad}
                disabled={!canPurchase}
                accent={cartAccent}
              />
            </div>

            <div className={`rounded-[10px] border p-6 ${isRed ? "border-[#f0caca] bg-[#fff7f7]" : "border-slate-200 bg-slate-50"}`}>
              <h2 className="text-xl font-black text-slate-950">
                Especificaciones principales
              </h2>
              <ul className="mt-4 space-y-3 text-base font-semibold leading-7 text-slate-600">
                <li>Compatibilidad directa con la línea {producto.categoria}.</li>
                <li>Producto con respaldo comercial y disponibilidad {producto.disponibilidad.toLowerCase()}.</li>
                {!isService && (
                  <li>Inventario actual: {producto.stock ?? 0} unidad{(producto.stock ?? 0) === 1 ? "" : "es"}.</li>
                )}
                <li>Componente pensado para rendimiento estable y mantenimiento ágil.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16">
        <div className="mb-8">
          <p className={`mb-2 text-xs font-black uppercase tracking-[0.16em] ${accentTextClass}`}>
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
                src={item.imagen === "/hero-unipars.jpg" ? FALLBACK_PRODUCT_IMAGE[item.division ?? "Cauchos"] : item.imagen}
                alt={item.nombre}
                width={900}
                height={700}
                className="h-52 w-full object-cover"
              />
              <div className="space-y-4 p-5">
                <div>
                  <p className={`mb-2 text-[11px] font-black uppercase tracking-[0.12em] ${accentTextClass}`}>
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
                  className={`inline-flex rounded-full border bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200 ${OUTLINE_BUTTON_CLASS[cartAccent]}`}
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
