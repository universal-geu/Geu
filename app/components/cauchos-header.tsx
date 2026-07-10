import Image from "next/image";
import Link from "next/link";
import CauchosAccountLink from "./cauchos-account-link";
import CauchosCartLink from "./cauchos-cart-link";
import CauchosCategorySidebarMenu from "./cauchos-category-sidebar-menu";
import CauchosMenuButton from "./cauchos-menu-button";
import { CauchosMenuProvider } from "./cauchos-menu-context";

export default function CauchosHeader() {
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
            <CauchosAccountLink className="font-bold hover:text-[#075ed8]" />
          </div>
        </div>

        <CauchosCategorySidebarMenu basePath="/cauchos" />
      </header>
    </CauchosMenuProvider>
  );
}
