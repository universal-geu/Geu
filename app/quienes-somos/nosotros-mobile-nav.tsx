"use client";

import Link from "next/link";
import { useState } from "react";

type NavItem = { label: string; href: string; active?: boolean };

export default function NosotrosMobileNav({ navItems }: { navItems: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label="Abrir menú"
        className={`flex shrink-0 items-center gap-2 rounded-[3px] border px-4 py-2.5 text-sm font-bold transition-colors duration-150 ${
          isOpen
            ? "border-[#075ed8] bg-[#eef5ff] text-[#075ed8]"
            : "border-slate-300 text-slate-800 hover:border-slate-400"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Menú
      </button>

      {isOpen && (
        <nav className="absolute inset-x-0 top-full z-30 flex flex-col gap-1 border-t border-slate-200 bg-white px-7 py-4 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`rounded-[3px] px-3 py-3 text-sm font-black uppercase tracking-[0.04em] transition-colors ${
                item.active ? "bg-[#eef5ff] text-[#075ed8]" : "text-[#061735] hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
