"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CauchosHeader from "../components/cauchos-header";
import { useCart } from "../components/cart-provider";
import { useProducts } from "../components/products-provider";
import { formatearMoneda } from "../data/catalog";
import { CART_ACCENT, DIVISION_BRAND, getDivisionFromBrandParam } from "@/lib/divisions";

function parsePrecio(precio: string) {
  const numeric = Number(precio.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

const ACTION_BUTTON_CLASS = {
  blue: "border-[#075ed8] text-[#075ed8] hover:bg-[#075ed8]",
  red: "border-[#e31313] text-[#e31313] hover:bg-[#e31313]",
  gray: "border-[#6b7280] text-[#6b7280] hover:bg-[#6b7280]",
} as const;

const PRIMARY_BUTTON_CLASS = {
  blue: "border-[#075ed8] bg-[#075ed8] hover:bg-white hover:text-[#075ed8]",
  red: "border-[#e31313] bg-[#e31313] hover:bg-white hover:text-[#e31313]",
  gray: "border-[#6b7280] bg-[#6b7280] hover:bg-white hover:text-[#6b7280]",
} as const;

export default function CarritoPage() {
  const searchParams = useSearchParams();
  const { items, incrementItem, decrementItem, removeItem, clearCart } =
    useCart();
  const { products } = useProducts();
  const brandParam = searchParams.get("brand");
  const division = getDivisionFromBrandParam(brandParam);
  const brand = DIVISION_BRAND[division];
  const getItemBrand = (itemId: string) => {
    const product = products.find((entry) => entry.slug === itemId);
    return DIVISION_BRAND[product?.division ?? division];
  };
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
                {isImportCart ? "Importacion empresarial" : "Compra empresarial"}
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
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-5">
                {items.map((item) => {
                  const itemBrand = getItemBrand(item.id);
                  const unitPrice = parsePrecio(item.precio);
                  const lineTotal = unitPrice * item.cantidad;

                  return (
                  <article
                    key={item.id}
                    className="flex flex-col gap-5 rounded-[10px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(15,23,42,0.07)] md:flex-row md:items-center"
                  >
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      width={220}
                      height={160}
                      className="h-32 w-full rounded-[8px] border border-slate-100 object-cover md:w-44"
                    />

                    <div className="flex-1">
                      <p
                        className="text-[11px] font-black uppercase tracking-[0.12em]"
                        style={{ color: itemBrand.accent }}
                      >
                        {itemBrand.label}
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-slate-950">
                        {item.nombre}
                      </h2>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {formatearMoneda(unitPrice)} c/u
                      </p>
                      <div className="mt-4 inline-flex overflow-hidden rounded-full border border-slate-200 bg-white">
                        <button
                          type="button"
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                          onClick={() => decrementItem(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center text-lg font-bold text-slate-500 transition-colors duration-200 hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="inline-flex h-10 min-w-[3.2rem] items-center justify-center border-x border-slate-200 text-base font-black text-slate-950">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          onClick={() => incrementItem(item.id)}
                          className="inline-flex h-10 w-10 items-center justify-center text-lg font-bold text-slate-500 transition-colors duration-200 hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                      <p className="mt-4 text-2xl font-black text-slate-950">
                        {formatearMoneda(lineTotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.06em] text-slate-600 transition-colors duration-200 hover:border-[#e4002b] hover:bg-[#fff0f3] hover:text-[#e4002b]"
                    >
                      Quitar
                    </button>
                  </article>
                  );
                })}
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
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="font-semibold text-slate-700">
                        {item.nombre} <span className="text-slate-400">×{item.cantidad}</span>
                      </span>
                      <span className="shrink-0 font-black text-slate-900">
                        {formatearMoneda(parsePrecio(item.precio) * item.cantidad)}
                      </span>
                    </div>
                  ))}
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

                <Link
                  href={checkoutHref}
                  className={`mt-6 inline-flex w-full items-center justify-center rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 ${primaryClasses}`}
                >
                  Continuar compra
                </Link>
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
