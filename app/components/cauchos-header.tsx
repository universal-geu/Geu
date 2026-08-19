"use client";

import Image from "next/image";
import Link from "next/link";
import CauchosAccountLink from "./cauchos-account-link";
import CauchosCartLink from "./cauchos-cart-link";
import CauchosSearchForm from "./cauchos-search-form";
import CauchosCategorySidebarMenu from "./cauchos-category-sidebar-menu";
import CauchosMenuButton from "./cauchos-menu-button";
import { CauchosMenuProvider, useCauchosMenu } from "./cauchos-menu-context";
import { CART_ACCENT, DIVISION_BRAND, type DivisionName } from "@/lib/divisions";
import { useSiteTexts } from "./use-site-texts";
import { useSiteColors } from "./use-site-colors";
import { resolveText } from "@/lib/text-slots";
import { buildDivisionColorOverrideCss } from "@/lib/color-overrides";
import { resolveColor } from "@/lib/color-slots";
import { useCart } from "./cart-provider";
import { useSalesSettings } from "./sales-settings-provider";
import MobileBottomNav from "./mobile-bottom-nav";

type BottomNavProps = {
  homeHref: string;
  accent: string;
  cartHref: string;
  accountBrand?: string;
  moreItems: { label: string; href: string }[];
  showCart: boolean;
};

function CauchosBottomNav({ homeHref, accent, cartHref, accountBrand, moreItems, showCart }: BottomNavProps) {
  const { toggle } = useCauchosMenu();
  const { totalItems } = useCart();

  return (
    <MobileBottomNav
      homeHref={homeHref}
      accent={accent}
      cart={showCart ? { href: cartHref, count: totalItems } : undefined}
      onCategoriasClick={toggle}
      accountBrand={accountBrand}
      moreItems={moreItems}
    />
  );
}

type Props = {
  division?: DivisionName;
};

export default function CauchosHeader({ division = "Cauchos" }: Props) {
  const siteTexts = useSiteTexts();
  const siteColors = useSiteColors();
  const colorOverrideCss = buildDivisionColorOverrideCss(division, siteColors);
  const { cauchosSalesMode } = useSalesSettings();
  const showCart = !(division === "Cauchos" && cauchosSalesMode === "whatsapp");
  const phone = resolveText("header-phone", siteTexts);
  const brand = DIVISION_BRAND[division];
  const resolvedAccent = resolveColor(
    `color-${division.toLowerCase()}-accent`,
    siteColors,
    brand.accent,
  );
  const cartAccent = CART_ACCENT[division];
  const brandParam = division === "Cauchos" ? undefined : division.toLowerCase();
  const cartHref = brandParam ? `/carrito?brand=${brandParam}` : "/carrito";
  const nosotrosHref =
    division === "Import"
      ? "/import/nosotros"
      : division === "Cauchos"
        ? "/cauchos/nosotros"
        : division === "Plastic"
          ? "/plastic/nosotros"
          : "/quienes-somos";

  return (
    <CauchosMenuProvider>
      {colorOverrideCss && <style dangerouslySetInnerHTML={{ __html: colorOverrideCss }} />}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-slate-50">
          <div
            className="mx-auto flex h-8 max-w-[1632px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8"
            style={{ "--brand-accent": resolvedAccent } as React.CSSProperties}
          >
            <div className="hidden gap-3 md:flex">
              <span>{phone}</span>
            </div>
            <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
              <Link href={`${brand.basePath}#contacto`} className="hover:text-[var(--brand-accent)]">
                Cotizaciones
              </Link>
              <Link href={`${brand.basePath}#productos`} className="hover:text-[var(--brand-accent)]">
                Catalogos
              </Link>
              <Link
                href="/"
                className="flex h-5 items-center gap-1 rounded-full bg-[var(--brand-accent)] px-2 text-[10px] font-bold uppercase leading-none tracking-[0.03em] text-white shadow-sm transition-transform duration-150 hover:scale-105 hover:text-white"
              >
                <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 shrink-0 fill-current" aria-hidden="true">
                  <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
                </svg>
                Todas las empresas
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74px] max-w-[1632px] items-center gap-4 px-5 py-3 md:grid-cols-[280px_1fr_auto] md:px-8">
          <Link href={brand.basePath} className="flex shrink-0 items-center">
            <Image
              src={brand.logo}
              alt={brand.logoAlt}
              width={2518}
              height={420}
              priority
              className="h-auto object-contain"
              style={{ width: "260px", maxWidth: "100%" }}
            />
          </Link>

          <div className="flex items-center gap-3">
            <CauchosMenuButton />
            <CauchosSearchForm
              basePath={brand.basePath}
              className="flex min-h-11 flex-1 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner"
            />
          </div>

          <div
            className="flex items-center justify-between gap-5 text-sm text-slate-700 md:justify-end"
            style={{ "--brand-accent": resolvedAccent } as React.CSSProperties}
          >
            <Link href={nosotrosHref} className="font-bold hover:text-[var(--brand-accent)]">
              Nosotros
            </Link>
            {showCart && <CauchosCartLink accent={cartAccent} href={cartHref} />}
            <CauchosAccountLink className="font-bold hover:text-[var(--brand-accent)]" brand={brandParam} />
          </div>
        </div>

        <CauchosCategorySidebarMenu basePath={brand.basePath} division={division} accent={resolvedAccent} />

        <CauchosBottomNav
          homeHref={brand.basePath}
          accent={resolvedAccent}
          cartHref={cartHref}
          accountBrand={brandParam}
          showCart={showCart}
          moreItems={[
            { label: "Nosotros", href: nosotrosHref },
            { label: "Cotizaciones", href: `${brand.basePath}#contacto` },
            { label: "Catálogos", href: `${brand.basePath}#productos` },
            { label: "Todas las empresas", href: "/" },
          ]}
        />
      </header>
    </CauchosMenuProvider>
  );
}
