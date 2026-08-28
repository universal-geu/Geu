"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type MoreItem = { label: string; href: string };

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

  const brandQuery = accountBrand ? `?brand=${accountBrand}` : "";
  const accountHref = user
    ? user.role === "ADMIN"
      ? `/admin${brandQuery}`
      : `/mi-cuenta${brandQuery}`
    : `/login?next=/mi-cuenta${accountBrand ? `&brand=${accountBrand}` : ""}`;
  const accountLabel = user ? "Cuenta" : "Ingresar";
  const isHomeActive = pathname === homeHref;

  return (
    <>
      {showMore && (
        <div
          className={`fixed inset-0 z-40 bg-black/40 ${breakpointClassName}`}
          onClick={() => setShowMore(false)}
        />
      )}

      {showMore && (
        <div
          className={`fixed inset-x-0 bottom-[60px] z-50 rounded-t-2xl bg-white shadow-[0_-8px_32px_rgba(15,23,42,0.15)] ${breakpointClassName}`}
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
                  className="rounded-xl px-3 py-3 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] ${breakpointClassName}`}
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

          {categoriasHref ? (
            <Link
              href={categoriasHref}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: inactiveColor }}
            >
              <GridIcon />
              {categoriasLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onCategoriasClick}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: inactiveColor }}
            >
              <GridIcon />
              {categoriasLabel}
            </button>
          )}

          {cart && (
            <Link
              href={cart.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
              style={{ color: inactiveColor }}
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

          <Link
            href={accountHref}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
            style={{ color: inactiveColor }}
          >
            <UserIcon />
            {accountLabel}
          </Link>

          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold"
            style={{ color: showMore ? accent : inactiveColor }}
          >
            <MoreIcon />
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
