"use client";

import Image from "next/image";
import Link from "next/link";
import CauchosAccountLink from "../components/cauchos-account-link";
import MobileBottomNav from "../components/mobile-bottom-nav";

const navItems = [
  { label: "Catálogos", href: "/energy/catalogo" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "/energy#contacto" },
];

const moreItems = [
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "/energy#contacto" },
];

function EnergyMark() {
  return (
    <Image
      src="/logo-geu-energy.png"
      alt="GEU Energy"
      width={2000}
      height={452}
      priority
      className="h-auto w-[245px] max-w-full object-contain"
    />
  );
}

export default function EnergyHeader() {
  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="shrink-0">
          <EnergyMark />
        </Link>
        <nav className="hidden items-center gap-7 text-[11px] font-black uppercase tracking-[0.08em] text-white/85 lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="inline-flex items-center gap-1 border-b border-transparent py-2 hover:border-[#f5a623] hover:text-[#f5a623]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-white">
          <CauchosAccountLink
            brand="energy"
            className="hidden text-[11px] font-black uppercase tracking-[0.08em] hover:text-[#f5a623] lg:inline-flex"
          />
        </div>
      </div>
    </header>

    <MobileBottomNav
      homeHref="/energy"
      accent="#d4a900"
      categoriasHref="/energy/catalogo"
      categoriasLabel="Catálogo"
      accountBrand="energy"
      moreItems={moreItems}
      breakpointClassName="lg:hidden"
    />
    </>
  );
}
