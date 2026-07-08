"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

type Props = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  cantidad?: number;
  disabled?: boolean;
  variant?: "default" | "cauchos" | "import";
};

export default function AddToCartButton({
  id,
  nombre,
  precio,
  imagen,
  cantidad = 1,
  disabled = false,
  variant = "default",
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
      className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200 ${
        variant === "cauchos"
          ? disabled
            ? "cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-500"
            : added
              ? "border border-[#075ed8] bg-[#075ed8] text-white"
              : "border border-[#075ed8] bg-white text-[#075ed8] hover:bg-[#075ed8] hover:text-white"
          : variant === "import"
            ? disabled
              ? "cursor-not-allowed border border-slate-700 bg-slate-800 text-slate-400"
              : added
                ? "border border-[#e31313] bg-[#e31313] text-white"
                : "border border-[#e31313] bg-[#e31313] text-white shadow-[0_16px_30px_rgba(227,19,19,0.24)] hover:bg-[#ba1010]"
          : disabled
            ? "cursor-not-allowed bg-[#d8dbe0] text-[#6b7280]"
            : added
              ? "bg-[#16384f] text-white"
              : "bg-[#ed8435] text-white hover:bg-[#d67024]"
      }`}
    >
      {disabled ? "Sin stock" : added ? "Agregado" : variant === "cauchos" ? "Agregar" : "Agregar al carrito"}
    </button>
  );
}
