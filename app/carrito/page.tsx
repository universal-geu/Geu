"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CauchosAccountLink from "../components/cauchos-account-link";
import CauchosCartLink from "../components/cauchos-cart-link";
import CauchosSearchForm from "../components/cauchos-search-form";
import { useCart } from "../components/cart-provider";

const importCartNavItems = [
  "Luces y direccionales",
  "Motores",
  "Mecanizados",
  "Inyeccion y extrusion",
  "Linea electrica",
  "Busqueda global",
  "Logistica",
  "Rastreo",
];

function ImportMark() {
  return (
    <span className="inline-flex items-center gap-2 font-[family:var(--font-display)] text-3xl font-black tracking-[0.08em] text-slate-950">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e31313] text-xs text-[#e31313]">
        GE
      </span>
      GEU
      <span className="text-[#e31313]">Import</span>
    </span>
  );
}

function CauchosCartHeader() {
  return (
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

        <CauchosSearchForm className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner" />

        <div className="flex items-center justify-between gap-5 text-sm text-slate-700 md:justify-end">
          <CauchosCartLink />
          <CauchosAccountLink className="font-bold hover:text-[#075ed8]" />
        </div>
      </div>
    </header>
  );
}

function ImportCartHeader() {
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
          <ImportMark />
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
            {importCartNavItems.map((item, index) => (
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

export default function CarritoPage() {
  const searchParams = useSearchParams();
  const { items, incrementItem, decrementItem, removeItem, clearCart } =
    useCart();
  const isImportCart =
    searchParams.get("brand") === "import" ||
    items.some((item) => item.imagen.includes("import") || item.imagen.includes("home-import"));
  const accent = isImportCart ? "#e31313" : "#075ed8";
  const homeHref = isImportCart ? "/import#productos" : "/cauchos#productos";
  const actionClasses = isImportCart
    ? "border-[#e31313] text-[#e31313] hover:bg-[#e31313]"
    : "border-[#075ed8] text-[#075ed8] hover:bg-[#075ed8]";
  const primaryClasses = isImportCart
    ? "border-[#e31313] bg-[#e31313] hover:bg-white hover:text-[#e31313]"
    : "border-[#075ed8] bg-[#075ed8] hover:bg-white hover:text-[#075ed8]";

  return (
    <>
      {isImportCart ? <ImportCartHeader /> : <CauchosCartHeader />}
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
                {items.map((item) => (
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
                        style={{ color: accent }}
                      >
                        {isImportCart ? "GEU Import" : "Universal de Cauchos"}
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-[-0.02em] text-slate-950">
                        {item.nombre}
                      </h2>
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
                        {item.precio}
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
                ))}
              </div>

              <aside className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.07)]">
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
                      <span className="font-semibold text-slate-700">{item.nombre}</span>
                      <span className="font-black" style={{ color: accent }}>
                        {item.cantidad}x
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/checkout"
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full border px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 ${primaryClasses}`}
                >
                  Continuar compra
                </Link>
              </aside>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
