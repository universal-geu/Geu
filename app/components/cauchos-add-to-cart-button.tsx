"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

type Props = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  accent?: "blue" | "red" | "gray";
  cantidad?: number;
  disabled?: boolean;
};

const accentClasses = {
  blue: "border border-[#075ed8] bg-white text-[#075ed8] shadow-[0_10px_24px_rgba(7,94,216,0.08)] hover:bg-[#075ed8] hover:text-white hover:shadow-[0_16px_30px_rgba(7,94,216,0.18)]",
  red: "border border-[#e31313] bg-white text-[#e31313] shadow-[0_10px_24px_rgba(227,19,19,0.08)] hover:bg-[#e31313] hover:text-white hover:shadow-[0_16px_30px_rgba(227,19,19,0.18)]",
  gray: "border border-[#6b7280] bg-white text-[#6b7280] shadow-[0_10px_24px_rgba(107,114,128,0.08)] hover:bg-[#6b7280] hover:text-white hover:shadow-[0_16px_30px_rgba(107,114,128,0.18)]",
};

export default function CauchosAddToCartButton({
  id,
  nombre,
  precio,
  imagen,
  accent = "blue",
  cantidad = 1,
  disabled = false,
}: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        addItem({ id, nombre, precio, imagen, cantidad });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
      className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.08em] transition ${
        disabled
          ? "cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-500"
          : added
            ? "bg-slate-950 text-white"
            : accentClasses[accent]
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6.1" />
      </svg>
      <span>{disabled ? "Sin stock" : added ? "Agregado" : "Agregar"}</span>
    </button>
  );
}
