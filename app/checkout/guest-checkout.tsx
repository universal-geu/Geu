"use client";

import Link from "next/link";
import { useCart } from "../components/cart-provider";
import { parsePrecio } from "@/lib/cart-format";
import { DIVISION_BRAND, type DivisionName } from "@/lib/divisions";
import CheckoutForm from "./checkout-form";

const EMPTY_GUEST_USER = {
  fullName: "",
  company: null,
  email: "",
  phone: null,
  department: null,
  city: null,
  addressLine1: null,
  addressLine2: null,
  division: null,
} as const;

export default function GuestCheckout({
  division,
  brand,
  wompiEnabled = false,
}: {
  division: DivisionName;
  brand?: string;
  wompiEnabled?: boolean;
}) {
  const { items } = useCart();

  if (items.length === 0) {
    const brandLabel = DIVISION_BRAND[division];
    const cartHref = brand ? `/carrito?brand=${brand}` : "/carrito";

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6 text-center">
        <div className="w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
          <p className="text-sm leading-7 text-[#6e7379]">
            Tu carrito está vacío por ahora.
          </p>
          <Link
            href={cartHref}
            className="mt-5 inline-flex rounded-full px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: brandLabel.accent }}
          >
            Volver al carrito
          </Link>
        </div>
      </main>
    );
  }

  const subtotal = items.reduce(
    (total, item) => total + parsePrecio(item.precio) * item.cantidad,
    0,
  );

  return (
    <CheckoutForm
      user={EMPTY_GUEST_USER}
      items={items}
      subtotal={subtotal}
      division={division}
      brand={brand}
      wompiEnabled={wompiEnabled}
    />
  );
}
