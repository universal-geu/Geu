"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import CauchosHeader from "../components/cauchos-header";
import { useCart } from "../components/cart-provider";
import { useProducts } from "../components/products-provider";
import { useSalesSettings } from "../components/sales-settings-provider";
import { formatearMoneda } from "../data/catalog";
import { CART_ACCENT, DIVISION_BRAND, getDivisionFromBrandParam } from "@/lib/divisions";
import { productSellsInDivision } from "@/lib/product-category-views";
import {
  parsePrecio,
  resolveProductSlug,
  CART_ACTION_BUTTON_CLASS as ACTION_BUTTON_CLASS,
  CART_PRIMARY_BUTTON_CLASS as PRIMARY_BUTTON_CLASS,
  MINIMUM_ORDER_TOTAL,
} from "@/lib/cart-format";

// With large carts the full list lives in the table; the summary only previews it.
const SUMMARY_ITEMS_LIMIT = 5;

export default function CarritoPage() {
  const searchParams = useSearchParams();
  const { items, incrementItem, decrementItem, removeItem, clearCart } =
    useCart();
  const { products } = useProducts();
  const { salesModes, whatsappNumbers } = useSalesSettings();
  const brandParam = searchParams.get("brand");
  const division = getDivisionFromBrandParam(brandParam);
  const brand = DIVISION_BRAND[division];
  const [itemQuery, setItemQuery] = useState("");
  // Variant items are stored as "<slug>::<variantSku>"; otherwise use the
  // product's SKU, falling back to the same slug-derived code the product page shows.
  const getItemCode = (itemId: string) => {
    const [slug, variantSku] = itemId.split("::");
    if (variantSku) return variantSku;
    const product = products.find((entry) => entry.slug === slug);
    return product?.sku || slug.toUpperCase().replace(/-/g, "");
  };
  const getItemBrand = (itemId: string) => {
    const product = products.find((entry) => entry.slug === resolveProductSlug(itemId));
    return DIVISION_BRAND[product?.division ?? division];
  };
  // Also checked against the cart's actual items (not just the `?brand=`
  // query param) so a WhatsApp-only item already in the cart can't dodge the
  // notice just by opening the cart with a different brand. A product
  // cross-listed into this division (via "también aplica para otra empresa
  // GEU") is exempt — it's part of this division's real catalog too, so it
  // should check out normally here instead of blocking the whole cart.
  const cartHasForeignWhatsAppItem = items.some((item) => {
    const product = products.find((entry) => entry.slug === resolveProductSlug(item.id));
    if (!product?.division) return false;
    return salesModes[product.division] === "whatsapp" && !productSellsInDivision(product, division);
  });
  const whatsappModeActive = salesModes[division] === "whatsapp" || cartHasForeignWhatsAppItem;
  const isImportCart = division === "Import";
  const cartAccent = CART_ACCENT[division];
  const accent = brand.accent;
  const homeHref = `${brand.basePath}#productos`;
  const checkoutHref = brandParam ? `/checkout?brand=${brandParam}` : "/checkout";
  const actionClasses = ACTION_BUTTON_CLASS[cartAccent];
  const primaryClasses = PRIMARY_BUTTON_CLASS[cartAccent];
  const totalItems = items.reduce((total, item) => total + item.cantidad, 0);
  const subtotal = items.reduce(
    (total, item) => total + parsePrecio(item.precio) * item.cantidad,
    0,
  );
  const missingForMinimum = Math.max(0, MINIMUM_ORDER_TOTAL - subtotal);
  const normalizedQuery = itemQuery
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const visibleItems = normalizedQuery
    ? items.filter((item) =>
        `${item.nombre} ${getItemCode(item.id)}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(normalizedQuery),
      )
    : items;

  if (whatsappModeActive) {
    const whatsappNumber = whatsappNumbers[division];
    const whatsappHref = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola GEU, quiero comprar productos de ${brand.label}.`)}`
      : undefined;

    return (
      <>
        <CauchosHeader division={division} />
        <main className="min-h-screen bg-slate-50 text-slate-950">
          <section className="mx-auto max-w-2xl px-5 py-24 text-center">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.16em]" style={{ color: accent }}>
              Compra empresarial
            </p>
            <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-slate-950 md:text-5xl">
              Estamos atendiendo por WhatsApp
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-500">
              Por ahora las compras de {brand.label} se coordinan directamente por WhatsApp
              con uno de nuestros asesores. Escríbenos y con gusto te ayudamos con tu pedido.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(37,211,102,0.24)] transition hover:brightness-95"
                >
                  Escribir por WhatsApp
                </a>
              ) : (
                <p className="text-sm font-semibold text-slate-500">
                  El número de WhatsApp aún no está configurado.
                </p>
              )}
              <Link
                href={homeHref}
                className={`inline-flex items-center justify-center rounded-full border bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200 ${actionClasses} hover:text-white`}
              >
                Seguir explorando
              </Link>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <CauchosHeader division={division} />
      <main className="min-h-screen bg-slate-50 text-slate-950">
        <section className="mx-auto max-w-[1500px] px-5 py-12 md:px-8">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p
                className="mb-2 text-xs font-black uppercase tracking-[0.16em]"
                style={{ color: accent }}
              >
                {isImportCart ? "Importación empresarial" : "Compra empresarial"}
              </p>
              <h1 className="text-4xl font-black uppercase tracking-[-0.02em] text-slate-950 md:text-6xl">
                Carrito
              </h1>
              <p className="mt-3 max-w-xl text-base font-semibold leading-7 text-slate-500">
                {isImportCart
                  ? "Revisa referencias, cantidades y detalles antes de continuar con tu compra de GEU Import."
                  : "Revisa productos, cantidades y disponibilidad antes de continuar con tu compra."}
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className={`rounded-full border bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.06em] transition-colors duration-200 ${actionClasses} hover:text-white`}
              >
                Vaciar carrito
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-[10px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-[0_14px_36px_rgba(15,23,42,0.07)]">
              <p className="text-xl font-semibold text-slate-600">
                Tu carrito está vacío por ahora.
              </p>
              <Link
                href={homeHref}
                className={`mt-6 inline-flex rounded-full border bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200 ${actionClasses} hover:text-white`}
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="relative block w-full sm:max-w-sm">
                    <span className="sr-only">Buscar en el carrito</span>
                    <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-3.5-3.5" />
                    </svg>
                    <input
                      type="search"
                      value={itemQuery}
                      onChange={(event) => setItemQuery(event.target.value)}
                      placeholder="Buscar por nombre o código..."
                      className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </label>
                  <p className="text-sm font-semibold text-slate-500">
                    {visibleItems.length === items.length
                      ? `${items.length} ${items.length === 1 ? "producto" : "productos"} · ${totalItems} ${totalItems === 1 ? "unidad" : "unidades"}`
                      : `Mostrando ${visibleItems.length} de ${items.length} productos`}
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                  <div className="hidden grid-cols-[minmax(0,1fr)_120px_128px_130px_40px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 md:grid">
                    <span>Producto</span>
                    <span className="text-right">Precio unit.</span>
                    <span className="text-center">Cantidad</span>
                    <span className="text-right">Total</span>
                    <span />
                  </div>

                  {visibleItems.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                      Ningún producto del carrito coincide con &ldquo;{itemQuery}&rdquo;.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {visibleItems.map((item) => {
                        const itemBrand = getItemBrand(item.id);
                        const unitPrice = parsePrecio(item.precio);
                        const lineTotal = unitPrice * item.cantidad;
                        const productHref = `/producto/${resolveProductSlug(item.id)}`;

                        return (
                          <li
                            key={item.id}
                            className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors duration-150 hover:bg-slate-50/70 md:grid-cols-[minmax(0,1fr)_120px_128px_130px_40px] md:gap-4 md:px-5"
                          >
                            <div className="contents md:flex md:min-w-0 md:items-center md:gap-3">
                              <Link
                                href={productHref}
                                className="row-span-2 flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-[#f6f7f9] p-1 md:row-span-1"
                              >
                                <Image
                                  src={item.imagen}
                                  alt={item.nombre}
                                  width={112}
                                  height={112}
                                  className="h-full w-full object-contain"
                                />
                              </Link>
                              <div className="min-w-0">
                                <Link
                                  href={productHref}
                                  className="line-clamp-2 text-sm font-bold leading-snug text-slate-950 hover:underline md:text-[15px]"
                                >
                                  {item.nombre}
                                </Link>
                                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                                  <span className="font-mono font-semibold text-slate-600">{getItemCode(item.id)}</span>
                                  <span className="text-slate-300">·</span>
                                  <span className="font-semibold" style={{ color: itemBrand.accent }}>
                                    {itemBrand.label}
                                  </span>
                                  <span className="text-slate-400 md:hidden">· {formatearMoneda(unitPrice)} c/u</span>
                                </p>
                              </div>
                            </div>

                            <p className="hidden text-right text-sm font-medium text-slate-600 md:block">
                              {formatearMoneda(unitPrice)}
                            </p>

                            <div className="col-start-2 inline-flex w-fit items-center rounded-full bg-[#f1f3f6] p-0.5 md:col-start-auto md:mx-auto">
                              <button
                                type="button"
                                aria-label={`Disminuir cantidad de ${item.nombre}`}
                                onClick={() => decrementItem(item.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-white hover:shadow-sm"
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                  <path d="M5 12h14" />
                                </svg>
                              </button>
                              <span className="inline-flex h-7 min-w-[2.25rem] items-center justify-center text-sm font-black text-slate-950">
                                {item.cantidad}
                              </span>
                              <button
                                type="button"
                                aria-label={`Aumentar cantidad de ${item.nombre}`}
                                onClick={() => incrementItem(item.id)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors duration-200 hover:bg-white hover:shadow-sm"
                              >
                                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            </div>

                            <p className="col-start-3 row-start-2 text-right text-sm font-black text-slate-950 md:col-start-auto md:row-start-auto md:text-base">
                              {formatearMoneda(lineTotal)}
                            </p>

                            <button
                              type="button"
                              aria-label={`Quitar ${item.nombre} del carrito`}
                              title="Quitar"
                              onClick={() => removeItem(item.id)}
                              className="col-start-3 row-start-1 inline-flex h-8 w-8 items-center justify-center justify-self-end rounded-full text-slate-400 transition-colors duration-200 hover:bg-[#fff0f3] hover:text-[#e4002b] md:col-start-auto md:row-start-auto"
                            >
                              <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                              </svg>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <aside className="h-fit rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.07)] xl:sticky xl:top-24">
                <p
                  className="text-xs font-black uppercase tracking-[0.16em]"
                  style={{ color: accent }}
                >
                  Resumen
                </p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.02em] text-slate-950">
                  Tu compra
                </h2>
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-500">
                  Continúa al checkout cuando tengas confirmadas las cantidades.
                </p>

                <div className="mt-8 space-y-3 border-t border-slate-200 pt-6">
                  {items.slice(0, SUMMARY_ITEMS_LIMIT).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 truncate font-semibold text-slate-700">
                        {item.nombre} <span className="text-slate-400">×{item.cantidad}</span>
                      </span>
                      <span className="shrink-0 font-black text-slate-900">
                        {formatearMoneda(parsePrecio(item.precio) * item.cantidad)}
                      </span>
                    </div>
                  ))}
                  {items.length > SUMMARY_ITEMS_LIMIT && (
                    <p className="text-sm font-semibold text-slate-400">
                      y {items.length - SUMMARY_ITEMS_LIMIT} {items.length - SUMMARY_ITEMS_LIMIT === 1 ? "producto más" : "productos más"}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
                  <span className="text-sm font-semibold text-slate-500">
                    Subtotal · {totalItems} producto{totalItems === 1 ? "" : "s"}
                  </span>
                  <span className="text-2xl font-black tracking-[-0.02em] text-slate-950">
                    {formatearMoneda(subtotal)}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  El envío se calcula en el siguiente paso, según tu ciudad de entrega.
                </p>

                {missingForMinimum > 0 && (
                  <p className="mt-4 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-700">
                    La compra mínima es de {formatearMoneda(MINIMUM_ORDER_TOTAL)}. Te faltan{" "}
                    {formatearMoneda(missingForMinimum)} para continuar.
                  </p>
                )}

                {missingForMinimum > 0 ? (
                  <span
                    className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white opacity-50"
                    style={{ borderColor: accent, backgroundColor: accent }}
                  >
                    Continuar compra
                  </span>
                ) : (
                  <Link
                    href={checkoutHref}
                    className={`mt-6 inline-flex w-full items-center justify-center rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 ${primaryClasses}`}
                  >
                    Continuar compra
                  </Link>
                )}
                <Link
                  href={homeHref}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-slate-500 transition-colors duration-200 hover:text-slate-950"
                >
                  Seguir comprando
                </Link>
              </aside>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
