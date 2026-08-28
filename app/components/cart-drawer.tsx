"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./cart-provider";
import { useProducts } from "./products-provider";
import { formatearMoneda } from "../data/catalog";
import { CART_ACCENT, DIVISION_BRAND, type DivisionName } from "@/lib/divisions";
import {
  parsePrecio,
  resolveProductSlug,
  CART_ACTION_BUTTON_CLASS,
  CART_PRIMARY_BUTTON_CLASS,
} from "@/lib/cart-format";

export default function CartDrawer() {
  const router = useRouter();
  const {
    items,
    totalItems,
    incrementItem,
    decrementItem,
    removeItem,
    isDrawerOpen,
    lastAddedItemId,
    closeDrawer,
  } = useCart();
  const { products } = useProducts();

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const getItemDivision = (itemId: string): DivisionName =>
    products.find((entry) => entry.slug === resolveProductSlug(itemId))?.division ?? "Cauchos";

  const subtotal = items.reduce(
    (total, item) => total + parsePrecio(item.precio) * item.cantidad,
    0,
  );
  const lastAddedItem = items.find((item) => item.id === lastAddedItemId);
  const focusItem = lastAddedItem ?? items[0];
  const division = focusItem ? getItemDivision(focusItem.id) : "Cauchos";
  const brand = DIVISION_BRAND[division];
  const cartAccent = CART_ACCENT[division];
  const actionClasses = CART_ACTION_BUTTON_CLASS[cartAccent];
  const primaryClasses = CART_PRIMARY_BUTTON_CLASS[cartAccent];

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-[60] bg-slate-950/40 transition-opacity duration-300 ${
          isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        style={{ "--brand-accent": brand.accent } as React.CSSProperties}
        className={`fixed inset-y-0 right-0 z-[61] flex w-full max-w-[420px] flex-col bg-white shadow-[-24px_0_60px_rgba(2,8,18,0.24)] transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-5">
          <div>
            <p
              className="text-[11px] font-black uppercase tracking-[0.16em]"
              style={{ color: brand.accent }}
            >
              Tu carrito
            </p>
            <h2 className="mt-1 text-xl font-black tracking-[-0.02em] text-slate-950">
              {totalItems} producto{totalItems === 1 ? "" : "s"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Cerrar carrito"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors duration-200 hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-base font-semibold text-slate-500">
              Tu carrito está vacío por ahora.
            </p>
            <button
              type="button"
              onClick={closeDrawer}
              className={`inline-flex rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 ${primaryClasses}`}
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {lastAddedItem && (
                <div className="mb-5 flex items-center gap-3 rounded-[10px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">
                    ✓
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black uppercase tracking-[0.02em] text-emerald-700">
                      ¡Agregado al carrito!
                    </p>
                    <p className="truncate text-xs font-semibold text-emerald-600">
                      {lastAddedItem.nombre}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {items.map((item) => {
                  const itemBrand = DIVISION_BRAND[getItemDivision(item.id)];
                  const unitPrice = parsePrecio(item.precio);

                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-[8px] border border-slate-100 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.1em]"
                          style={{ color: itemBrand.accent }}
                        >
                          {itemBrand.label}
                        </p>
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-black text-slate-950">
                            {item.nombre}
                          </p>
                          <button
                            type="button"
                            aria-label={`Quitar ${item.nombre}`}
                            onClick={() => removeItem(item.id)}
                            className="shrink-0 text-slate-400 transition-colors duration-200 hover:text-[#e4002b]"
                          >
                            <svg
                              aria-hidden="true"
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M4 7h16" />
                              <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
                              <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm font-black text-slate-900">
                          {formatearMoneda(unitPrice)}
                        </p>
                        <div className="mt-2 inline-flex overflow-hidden rounded-full border border-slate-200 bg-white">
                          <button
                            type="button"
                            aria-label={`Disminuir cantidad de ${item.nombre}`}
                            onClick={() => decrementItem(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-500 transition-colors duration-200 hover:bg-slate-50"
                          >
                            -
                          </button>
                          <span className="inline-flex h-8 min-w-[2.6rem] items-center justify-center border-x border-slate-200 text-sm font-black text-slate-950">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar cantidad de ${item.nombre}`}
                            onClick={() => incrementItem(item.id)}
                            className="inline-flex h-8 w-8 items-center justify-center text-sm font-bold text-slate-500 transition-colors duration-200 hover:bg-slate-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">Subtotal</span>
                <span className="text-2xl font-black tracking-[-0.02em] text-slate-950">
                  {formatearMoneda(subtotal)}
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Envío calculado al finalizar la compra.
              </p>

              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  router.push("/checkout");
                }}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 ${primaryClasses}`}
              >
                Continuar compra →
              </button>
              <Link
                href="/carrito"
                onClick={closeDrawer}
                className={`mt-3 inline-flex w-full items-center justify-center rounded-full border bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.08em] transition-colors duration-200 ${actionClasses} hover:text-white`}
              >
                Ver carrito completo
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="mt-3 inline-flex w-full items-center justify-center px-6 py-2 text-sm font-black uppercase tracking-[0.08em] text-slate-500 transition-colors duration-200 hover:text-slate-950"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
