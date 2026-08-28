"use client";

import Image from "next/image";
import Link from "next/link";
import CauchosAccountLink from "../components/cauchos-account-link";
import MobileBottomNav from "../components/mobile-bottom-nav";
import { useSiteColors } from "../components/use-site-colors";
import { buildDivisionColorOverrideCss } from "@/lib/color-overrides";

const navItems = [
  { label: "Producto", href: "/innovation#producto" },
  { label: "Ingeniería", href: "/innovation#ingenieria" },
  { label: "Servicios", href: "/innovation#servicios" },
  { label: "Contacto", href: "/innovation#contacto" },
];

const mobileMoreItems = [...navItems, { label: "Ver todo GEU", href: "/" }];

function StructureMark() {
  return (
    <Image
      src="/logo-geu-structure.svg"
      alt="GEU Structure"
      width={640}
      height={120}
      priority
      className="h-auto w-[210px] max-w-full object-contain"
    />
  );
}

export default function StructureHeader() {
  const siteColors = useSiteColors();
  const colorOverrideCss = buildDivisionColorOverrideCss("Innovation", siteColors);

  return (
    <>
      {colorOverrideCss && <style dangerouslySetInnerHTML={{ __html: colorOverrideCss }} />}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-8">
          <Link href="/innovation" className="shrink-0">
            <StructureMark />
          </Link>
          <nav className="hidden items-center gap-7 text-[11px] font-black uppercase tracking-[0.08em] text-white/85 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1 border-b border-transparent py-2 hover:border-[#0498b4] hover:text-[#0498b4]"
              >
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
            <CauchosAccountLink
              brand="innovation"
              className="hidden text-[11px] font-black uppercase tracking-[0.08em] hover:text-[#0498b4] lg:inline-flex"
            />
          </div>
        </div>
      </header>

      <MobileBottomNav
        homeHref="/innovation"
        accent="#0498b4"
        categoriasHref="/innovation#producto"
        categoriasLabel="Producto"
        accountBrand="innovation"
        moreItems={mobileMoreItems}
        breakpointClassName="lg:hidden"
      />
    </>
  );
}
