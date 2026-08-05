"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";
import { useSalesSettings } from "./sales-settings-provider";
import type { DivisionName } from "@/lib/divisions";

type Props = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  division?: DivisionName;
  accent?: "blue" | "red" | "gray";
  cantidad?: number;
  disabled?: boolean;
};

const accentClasses = {
  blue: "border border-[#075ed8] bg-white text-[#075ed8] shadow-[0_10px_24px_rgba(7,94,216,0.08)] hover:bg-[#075ed8] hover:text-white hover:shadow-[0_16px_30px_rgba(7,94,216,0.18)]",
  red: "border border-[#e31313] bg-white text-[#e31313] shadow-[0_10px_24px_rgba(227,19,19,0.08)] hover:bg-[#e31313] hover:text-white hover:shadow-[0_16px_30px_rgba(227,19,19,0.18)]",
  gray: "border border-[#6b7280] bg-white text-[#6b7280] shadow-[0_10px_24px_rgba(107,114,128,0.08)] hover:bg-[#6b7280] hover:text-white hover:shadow-[0_16px_30px_rgba(107,114,128,0.18)]",
};

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={`h-4 w-4 fill-current ${className}`} aria-hidden="true">
      <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.352.615 4.646 1.784 6.667L2.667 29.333l6.83-1.766a13.28 13.28 0 0 0 6.507 1.706h.006c7.362 0 13.333-5.97 13.333-13.333S23.366 2.667 16.004 2.667Zm7.82 18.81c-.332.933-1.65 1.71-2.694 1.933-.716.153-1.652.276-4.802-1.032-4.03-1.67-6.626-5.75-6.828-6.014-.194-.267-1.64-2.183-1.64-4.166 0-1.982 1.036-2.955 1.404-3.36.368-.406.803-.507 1.07-.507.267 0 .535.003.767.014.246.011.577-.093.902.688.332.798 1.128 2.767 1.226 2.968.098.2.164.435.033.7-.13.267-.196.434-.39.667-.196.234-.41.522-.586.7-.196.196-.4.408-.172.8.229.392 1.017 1.68 2.183 2.72 1.5 1.34 2.764 1.755 3.156 1.95.392.196.62.164.85-.1.229-.267.98-1.144 1.243-1.535.264-.392.527-.327.884-.196.36.13 2.28 1.075 2.672 1.27.392.196.653.294.751.457.098.163.098.947-.234 1.88Z" />
    </svg>
  );
}

export default function CauchosAddToCartButton({
  id,
  nombre,
  precio,
  imagen,
  division = "Cauchos",
  accent = "blue",
  cantidad = 1,
  disabled = false,
}: Props) {
  const { addItem } = useCart();
  const { cauchosSalesMode, whatsappNumber } = useSalesSettings();
  const [added, setAdded] = useState(false);

  const whatsappModeActive = division === "Cauchos" && cauchosSalesMode === "whatsapp";

  if (whatsappModeActive) {
    const message = `Hola GEU, quiero comprar: ${nombre} (x${cantidad}). Precio: ${precio}.`;
    const href = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
      : undefined;
    const canContact = Boolean(href) && !disabled;

    return (
      <a
        href={canContact ? href : undefined}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!canContact}
        onClick={(event) => {
          if (!canContact) event.preventDefault();
        }}
        className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.08em] transition ${
          canContact
            ? "bg-[#25D366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.24)] hover:brightness-95"
            : "cursor-not-allowed border border-slate-300 bg-slate-100 text-slate-500"
        }`}
      >
        <WhatsAppIcon className="shrink-0" />
        <span className="text-center leading-tight">
          {disabled ? "Sin stock" : href ? "Comprar por WhatsApp" : "WhatsApp no disponible"}
        </span>
      </a>
    );
  }

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
