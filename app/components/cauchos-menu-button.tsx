"use client";

import { useCauchosMenu } from "./cauchos-menu-context";

export default function CauchosMenuButton() {
  const { isOpen, toggle } = useCauchosMenu();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={isOpen}
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
  );
}
