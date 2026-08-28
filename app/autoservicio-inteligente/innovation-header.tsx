"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CauchosAccountLink from "../components/cauchos-account-link";
import MobileBottomNav from "../components/mobile-bottom-nav";
import { useSiteColors } from "../components/use-site-colors";
import { buildDivisionColorOverrideCss } from "@/lib/color-overrides";

const navItems = [
  { label: "Nosotros", href: "/autoservicio-inteligente/nosotros" },
  { label: "Contacto", href: "/autoservicio-inteligente#contacto" },
];

const mobileMoreItems = [...navItems, { label: "Ver todo GEU", href: "/" }];

const solutionsMenu = [
  { label: "Estufas", href: "/autoservicio-inteligente/estufas" },
  { label: "Doypack", href: "/autoservicio-inteligente/doypack" },
];

function InnovationMark() {
  return (
    <Image
      src="/logo-geu-innovation.png"
      alt="GEU Innovation"
      width={2000}
      height={452}
      priority
      className="h-auto w-[245px] max-w-full object-contain"
    />
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );
}

export default function InnovationHeader() {
  const [isSolucionesOpen, setIsSolucionesOpen] = useState(false);
  const [isMobileSolucionesOpen, setIsMobileSolucionesOpen] = useState(false);
  const siteColors = useSiteColors();
  const colorOverrideCss = buildDivisionColorOverrideCss("Innovation", siteColors);

  return (
    <>
    {colorOverrideCss && <style dangerouslySetInnerHTML={{ __html: colorOverrideCss }} />}
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-8">
        <Link href="/autoservicio-inteligente" className="shrink-0">
          <InnovationMark />
        </Link>
        <nav className="hidden items-center gap-7 text-[11px] font-black uppercase tracking-[0.08em] text-white/85 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setIsSolucionesOpen(true)}
            onMouseLeave={() => setIsSolucionesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsSolucionesOpen((current) => !current)}
              className={`inline-flex items-center gap-1.5 border-b border-transparent py-2 ${
                isSolucionesOpen ? "border-[#0498b4] text-[#0498b4]" : ""
              }`}
            >
              Soluciones
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`h-3 w-3 transition-transform duration-200 ${isSolucionesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div
              className={`absolute left-0 top-full z-50 pt-3 transition-all duration-150 ${
                isSolucionesOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <div className="min-w-[180px] rounded-xl border border-white/10 bg-[#0a0a0a] p-2 shadow-[0_18px_34px_rgba(0,0,0,0.45)]">
                {solutionsMenu.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsSolucionesOpen(false)}
                    className="block rounded-lg px-4 py-2.5 normal-case tracking-normal text-[13px] font-semibold text-white/85 hover:bg-white/10 hover:text-[#0498b4]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="inline-flex items-center gap-1 border-b border-transparent py-2 hover:border-[#0498b4] hover:text-[#0498b4]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-white">
          <Link
            href="/"
            className="hidden items-center gap-1.5 rounded-full bg-[#d6006e] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.08em] text-white shadow-sm transition-colors duration-150 hover:bg-[#b8005e] lg:inline-flex"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true">
              <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
            </svg>
            Ver todo GEU
          </Link>
          <button type="button" aria-label="Buscar" className="hover:text-[#0498b4]">
            <SearchIcon />
          </button>
          <CauchosAccountLink
            brand="innovation"
            className="hidden text-[11px] font-black uppercase tracking-[0.08em] hover:text-[#0498b4] lg:inline-flex"
          />
        </div>
      </div>

      {isMobileSolucionesOpen && (
        <div className="border-t border-white/10 bg-[#050505] px-5 py-4 lg:hidden">
          <p className="px-1 text-[11px] font-black uppercase tracking-[0.08em] text-white/50">Soluciones</p>
          <div className="mt-1 flex flex-col">
            {solutionsMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileSolucionesOpen(false)}
                className="rounded-lg px-1 py-2.5 text-sm font-semibold text-white/85 hover:text-[#0498b4]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>

    <MobileBottomNav
      homeHref="/autoservicio-inteligente"
      accent="#0498b4"
      onCategoriasClick={() => setIsMobileSolucionesOpen((current) => !current)}
      categoriasLabel="Soluciones"
      accountBrand="innovation"
      moreItems={mobileMoreItems}
      breakpointClassName="lg:hidden"
    />
    </>
  );
}
