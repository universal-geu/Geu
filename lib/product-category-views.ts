import type { StoreProduct } from "./products";
import type { DivisionName } from "./divisions";

function normalizeMatchKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

// Kept here (rather than lib/products.ts) because this file is safe to
// import from "use client" components — see the note below on why
// lib/products.ts's runtime code can't be.
export function productSellsInDivision(
  product: Pick<StoreProduct, "division" | "divisionesAdicionales">,
  division: DivisionName,
) {
  return (
    product.division === division ||
    Boolean(product.divisionesAdicionales?.includes(division))
  );
}

// A product tagged with additional categories (see the admin's "Este
// producto también aplica para otra categoría") should show up when
// browsing each of those categories too, not just its primary one. This
// expands every product of a division into one view per category it
// belongs to, so category-grouping UI built around a flat product list
// (storefront category pages, the header's category menu) keeps working
// unchanged just by iterating the expanded list instead of the raw one.
//
// This file only imports the StoreProduct *type* from lib/products.ts
// (erased at compile time), never its runtime code — lib/products.ts pulls
// in Prisma/pg, which breaks bundling if imported from a "use client"
// component. Keep it that way.
export function expandProductCategoryViews(
  products: StoreProduct[],
  division: DivisionName,
): StoreProduct[] {
  const views: StoreProduct[] = [];

  for (const product of products) {
    if (!productSellsInDivision(product, division)) continue;

    views.push(product);
    const primaryKey = normalizeMatchKey(product.categoria);

    for (const extra of product.categoriasAdicionales || []) {
      const categoria = extra.categoria?.trim();
      if (!categoria || normalizeMatchKey(categoria) === primaryKey) continue;

      views.push({
        ...product,
        categoria,
        subcategoria: extra.subcategoria,
        categoriaMenor: extra.categoriaMenor,
      });
    }
  }

  return views;
}
