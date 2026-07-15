"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

type Props = {
  accent?: "blue" | "red" | "gray";
  href?: string;
};

const accentClasses = {
  blue: {
    link: "hover:text-[#075ed8]",
    icon: "group-hover:border-[#075ed8]",
    badge: "bg-[#e4002b]",
  },
  red: {
    link: "hover:text-[#e31313]",
    icon: "group-hover:border-[#e31313]",
    badge: "bg-[#e31313]",
  },
  gray: {
    link: "hover:text-[#6b7280]",
    icon: "group-hover:border-[#6b7280]",
    badge: "bg-[#6b7280]",
  },
};

export default function CauchosCartLink({ accent = "blue", href = "/carrito" }: Props) {
  const { totalItems } = useCart();
  const tone = accentClasses[accent];

  return (
    <Link
      href={href}
      aria-label={`Ir al carrito con ${totalItems} productos`}
      className={`group inline-flex items-center gap-2 font-bold text-slate-800 ${tone.link}`}
    >
      <span className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-lg shadow-sm ${tone.icon}`}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6.2" />
        </svg>
        {totalItems > 0 && (
          <span className={`absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-black text-white ${tone.badge}`}>
            {totalItems}
          </span>
        )}
      </span>
      <span>Carrito</span>
    </Link>
  );
}
