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

  // A product can sit in several subcategorías / categorías menores at once.
  // Emit one flat view per (categoría × subcategoría × categoría menor) combo
  // so category-grouping UI that reads single `subcategoria` / `categoriaMenor`
  // keeps working — it just iterates more rows.
  const pushCombos = (
    base: StoreProduct,
    categoria: string,
    subcategorias: string[] | undefined,
    categoriasMenores: string[] | undefined,
  ) => {
    const subs = subcategorias?.length ? subcategorias : [undefined];
    const minors = categoriasMenores?.length ? categoriasMenores : [undefined];
    for (const subcategoria of subs) {
      for (const categoriaMenor of minors) {
        views.push({ ...base, categoria, subcategoria, categoriaMenor });
      }
    }
  };

  for (const product of products) {
    if (!productSellsInDivision(product, division)) continue;

    const seenCategoryKeys = new Set<string>();

    if (product.division === division) {
      pushCombos(
        product,
        product.categoria,
        product.subcategorias,
        product.categoriasMenores,
      );
      seenCategoryKeys.add(normalizeMatchKey(product.categoria));
    } else {
      // The product only reaches this division as a cross-listed "también
      // funciona para otra empresa GEU" entry — its own-division categoría
      // isn't part of this division's taxonomy. Use every categoría the admin
      // picked for this division instead.
      const overrides = (product.categoriasPorDivision || []).filter(
        (entry) => entry.division === division,
      );

      if (overrides.length === 0) {
        // Legacy data: cross-listed with no category assigned. Keep old
        // behaviour (show it, carrying its origin categoría).
        views.push(product);
        seenCategoryKeys.add(normalizeMatchKey(product.categoria));
      }

      for (const override of overrides) {
        pushCombos(
          product,
          override.categoria,
          override.subcategorias,
          override.categoriasMenores,
        );
        seenCategoryKeys.add(normalizeMatchKey(override.categoria));
      }
    }

    for (const extra of product.categoriasAdicionales || []) {
      const categoria = extra.categoria?.trim();
      if (!categoria || seenCategoryKeys.has(normalizeMatchKey(categoria))) continue;
      seenCategoryKeys.add(normalizeMatchKey(categoria));

      pushCombos(product, categoria, extra.subcategorias, extra.categoriasMenores);
    }
  }

  return views;
}
