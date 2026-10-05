"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import MobileBottomNav from "../components/mobile-bottom-nav";
import { useSiteColors } from "../components/use-site-colors";
import { buildDivisionColorOverrideCss } from "@/lib/color-overrides";

const navItems = [
  { label: "Producto", href: "/structure#producto" },
  { label: "Fabricación", href: "/structure#fabricacion" },
  { label: "Ingeniería", href: "/structure#ingenieria" },
  { label: "Servicios", href: "/structure#servicios" },
  { label: "Contacto", href: "/structure#contacto" },
];

const toolItems = [
  { label: "Cómo funciona la M24", href: "/structure/herramientas/como-funciona" },
  { label: "Configurador M24", href: "/structure/herramientas/configurador-m24" },
  { label: "Simulador de inversión", href: "/structure/herramientas/simulador-inversion" },
  // Ocultos por ahora — la ruta/HTML se conservan:
  // { label: "Asesor Técnico", href: "/structure/herramientas/asesor-tecnico" },
  // { label: "Asesor Técnico · carrito", href: "/structure/herramientas/asesor-tecnico-carrito" },
];

const mobileMoreItems = [...navItems, ...toolItems, { label: "Ver todo GEU", href: "/" }];

// Structure no vende productos: en vez de "Categorías", la barra inferior
// lleva a las dos herramientas principales de la M24.
const mobileExtraTabs = [
  { label: "Cómo funciona", href: "/structure/herramientas/como-funciona", icon: "info" as const },
  { label: "Configurador", href: "/structure/herramientas/configurador-m24", icon: "tool" as const },
];

function StructureMark() {
  return (
    <Image
      src="/logo-geu-structure.png"
      alt="GEU Structure"
      width={947}
      height={162}
      priority
      className="h-auto w-[210px] max-w-full object-contain"
    />
  );
}

function MainNavMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Abrir menú"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white transition-colors hover:border-[#0498b4] hover:text-[#0498b4]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] py-1.5 shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.06em] text-white/85 transition-colors hover:bg-white/5 hover:text-[#0498b4]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 border-b border-transparent py-2 uppercase hover:border-[#0498b4] hover:text-[#0498b4]"
      >
        Herramientas
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] py-1.5 shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
          {toolItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.06em] text-white/80 transition-colors hover:bg-white/5 hover:text-[#0498b4]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
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
          <Link href="/structure" className="shrink-0">
            <StructureMark />
          </Link>
          <nav className="hidden items-center gap-4 text-[11px] font-black uppercase tracking-[0.08em] text-white/85 lg:flex">
            <MainNavMenu />
            <ToolsMenu />
          </nav>
          <div className="flex items-center gap-5 text-white">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#d6006e] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.03em] text-white shadow-sm transition-colors duration-150 hover:bg-[#b8005e] active:bg-[#b8005e] lg:px-3.5 lg:py-2 lg:text-[11px] lg:tracking-[0.08em]"
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-current lg:h-3.5 lg:w-3.5" aria-hidden="true">
                <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
              </svg>
              Ver todo GEU
            </Link>
          </div>
        </div>
      </header>

      <MobileBottomNav
        homeHref="/structure"
        accent="#0498b4"
        hideCategorias
        extraTabs={mobileExtraTabs}
        hideAccount
        moreItems={mobileMoreItems}
        breakpointClassName="lg:hidden"
      />
    </>
  );
}
