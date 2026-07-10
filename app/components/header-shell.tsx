"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./site-header";
import { useProducts } from "./products-provider";

type HeaderShellProps = {
  currentUser: {
    fullName: string;
    role: "CUSTOMER" | "ADMIN";
  } | null;
};

export default function HeaderShell({ currentUser }: HeaderShellProps) {
  const pathname = usePathname();
  const { products } = useProducts();

  const productSlug = pathname.startsWith("/producto/")
    ? decodeURIComponent(pathname.split("/producto/")[1] || "")
    : null;
  const producto = productSlug
    ? products.find((item) => item.slug === productSlug)
    : null;

  if (
    pathname === "/" ||
    pathname === "/cauchos" ||
    pathname.startsWith("/cauchos/") ||
    pathname === "/carrito" ||
    pathname === "/checkout" ||
    pathname === "/checkout/exito" ||
    pathname === "/mi-cuenta" ||
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/admin" ||
    pathname === "/quienes-somos" ||
    pathname === "/import" ||
    pathname.startsWith("/import/") ||
    pathname === "/innovation" ||
    pathname === "/energy" ||
    pathname === "/plastic" ||
    Boolean(producto)
  ) {
    return null;
  }

  return <SiteHeader currentUser={currentUser} />;
}
