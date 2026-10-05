"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MoreItem = { label: string; href: string };

// Pestañas propias de una unidad (ej. herramientas de Structure), entre Categorías y Cuenta.
type ExtraTab = { label: string; href: string; icon: "tool" | "contact" | "info" };

type AccountUser = {
  fullName: string;
  role: "CUSTOMER" | "ADMIN";
};

type Props = {
  homeHref: string;
  accent: string;
  cart?: { href: string; count: number };
  onCategoriasClick?: () => void;
  categoriasHref?: string;
  categoriasLabel?: string;
  accountBrand?: string;
  hideAccount?: boolean;
  hideCategorias?: boolean;
  extraTabs?: ExtraTab[];
  moreItems: MoreItem[];
  breakpointClassName?: string;
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 0-5-5L14 2.4Z" />
      <path d="M3 21l6-6" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}

export default function MobileBottomNav({
  homeHref,
  accent,
  cart,
  onCategoriasClick,
  categoriasHref,
  categoriasLabel = "Categorías",
  accountBrand,
  hideAccount = false,
  hideCategorias = false,
  extraTabs = [],
  moreItems,
  breakpointClassName = "md:hidden",
}: Props) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const [user, setUser] = useState<AccountUser | null>(null);
  const inactiveColor = "#6b7280";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/account");
      if (!response.ok) return;
      const payload = (await response.json()) as { user?: AccountUser };
      if (!cancelled && payload.user) setUser(payload.user);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Close the "más" sheet on route change by adjusting state during render
  // (React-recommended) rather than in an effect, which would flash the open
  // sheet on the new route for one frame.
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setShowMore(false);
  }

  // Mientras la hoja "Más" está abierta se oculta el botón flotante de WhatsApp
  // (la barra vive dentro del encabezado y no puede quedar por encima de él).
  useEffect(() => {
    if (!showMore) return;
    const buttons = Array.from(document.querySelectorAll<HTMLElement>(".geu-whatsapp-float"));
    buttons.forEach((button) => {
      button.style.visibility = "hidden";
    });
    return () => {
      buttons.forEach((button) => {
        button.style.visibility = "";
      });
    };
  }, [showMore]);

  const brandQuery = accountBrand ? `?brand=${accountBrand}` : "";
  const accountHref = user
    ? user.role === "ADMIN"
      ? `/admin${brandQuery}`
      : `/mi-cuenta${brandQuery}`
    : `/login?next=/mi-cuenta${accountBrand ? `&brand=${accountBrand}` : ""}`;
  const accountLabel = user ? "Cuenta" : "Ingresar";
  // Cada pestaña se pinta con el color de la unidad cuando estás en esa sección.
  // Con el menú "Más" abierto solo se resalta "Más", para que no queden dos pestañas activas.
  // Un enlace a una sección de la misma página (#ancla) no cuenta como "página actual".
  const isItemActive = (href: string) => !href.includes("#") && pathname === href.split("?")[0];
  const isHomeActive = !showMore && pathname === homeHref;
  const categoriasBase = `${homeHref === "/" ? "" : homeHref}/categoria`;
  const isCategoriasActive =
    !showMore &&
    (pathname.startsWith(categoriasBase) || (!!categoriasHref && pathname.startsWith(categoriasHref)));
  const isCartActive = !showMore && (pathname.startsWith("/carrito") || pathname.startsWith("/checkout"));
  const isAccountActive =
    !showMore &&
    ["/mi-cuenta", "/admin", "/login", "/registro"].some((route) => pathname.startsWith(route));
  const isMoreActive = showMore || moreItems.some((item) => isItemActive(item.href));

  return (
    <>
      {showMore && (
        <div
          className={`fixed inset-0 z-[92] bg-black/40 ${breakpointClassName}`}
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <div
          className={`fixed inset-x-0 bottom-[60px] z-[93] rounded-t-2xl bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.15)] ${breakpointClassName}`}
        >
          <div className="px-4 pb-4 pt-3">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Más opciones</p>
            <div className="grid grid-cols-1 gap-1">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMore(false)}
                  aria-current={isItemActive(item.href) ? "page" : undefined}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                  style={
                    isItemActive(item.href)
                      ? { color: accent, backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`, fontWeight: 700 }
                      : undefined
                  }
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className={`fixed bottom-0 left-0 right-0 ${showMore ? "z-[93]" : "z-50"} border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] ${breakpointClassName}`}
      >
        <div className="flex items-stretch">
          <Link
            href={homeHref}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
            style={{ color: isHomeActive ? accent : inactiveColor }}
          >
            <HomeIcon />
            Inicio
          </Link>

          {hideCategorias ? null : categoriasHref ? (
            <Link
              href={categoriasHref}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: isCategoriasActive ? accent : inactiveColor }}
            >
              <GridIcon />
              {categoriasLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCategoriasClick}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: isCategoriasActive ? accent : inactiveColor }}
            >
              <GridIcon />
              {categoriasLabel}
            </button>
          )}

          {extraTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: !showMore && isItemActive(tab.href) ? accent : inactiveColor }}
            >
              {tab.icon === "tool" ? <ToolIcon /> : tab.icon === "info" ? <InfoIcon /> : <ContactIcon />}
              {tab.label}
            </Link>
          ))}

          {cart && (
            <Link
              href={cart.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: isCartActive ? accent : inactiveColor }}
            >
              <span className="relative">
                <CartIcon />
                {cart.count > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {cart.count}
                  </span>
                )}
              </span>
              Carrito
            </Link>
          )}

          {!hideAccount && (
            <Link
              href={accountHref}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: isAccountActive ? accent : inactiveColor }}
            >
              <UserIcon />
              {accountLabel}
            </Link>
          )}

          {/* Con una sola opción no tiene sentido abrir el menú: se enlaza directo. */}
          {moreItems.length === 1 ? (
            <Link
              href={moreItems[0].href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: isItemActive(moreItems[0].href) ? accent : inactiveColor }}
            >
              <InfoIcon />
              {moreItems[0].label}
            </Link>
          ) : moreItems.length > 1 ? (
            <button
              type="button"
              onClick={() => setShowMore((value) => !value)}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: isMoreActive ? accent : inactiveColor }}
            >
              <MoreIcon />
              Más
            </button>
          ) : null}
        </div>
      </nav>
    </>
  );
}
