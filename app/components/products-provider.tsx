"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  descripcionProducto,
  formatearDescuento,
  formatearMoneda,
  slugify,
  type Disponibilidad,
} from "../data/catalog";
import type { StoreProduct } from "@/lib/products";
import { DIVISION_BRAND, isServiceDivision, type DivisionName } from "@/lib/divisions";

export type AdminProductInput = {
  sku?: string;
  oemReferencia?: string;
  referenciasAlternas?: string[];
  categoria: string;
  subcategoria?: string;
  categoriaMenor?: string;
  nombre: string;
  marca: string;
  division: DivisionName;
  precioValor: number;
  precioAnteriorValor: number;
  displayPriceOverride?: string;
  displaySecondaryLabel?: string;
  stock: number;
  stockMinimo: number;
  imagen: string;
  imagenesExtra?: string[];
  disponibilidad: Disponibilidad;
  descripcion?: string;
  aplicacion?: string;
  compatibilidad?: string[];
  garantia?: string;
};

type ProductsContextValue = {
  products: StoreProduct[];
  adminProducts: StoreProduct[];
  createProduct: (
    input: AdminProductInput,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  updateProduct: (
    slug: string,
    input: AdminProductInput,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  removeProduct: (
    slug: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  adjustInventory: (
    slug: string,
    quantity: number,
    note?: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  refreshProducts: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | null>(null);
const LOCAL_PRODUCTS_KEY = "geu-local-products";

function isLocalModeError(message?: string) {
  return Boolean(
    message?.toLowerCase().includes("base de datos") ||
      message?.toLowerCase().includes("supabase"),
  );
}

function getInventoryState(stock: number, minimumStock: number) {
  if (stock <= 0) return "out-of-stock" as const;
  if (stock <= minimumStock) return "low-stock" as const;
  return "in-stock" as const;
}

function createLocalProduct(
  input: AdminProductInput,
  currentProducts: StoreProduct[],
  existingSlug?: string,
): StoreProduct {
  const precioValor = Math.max(1, Math.round(input.precioValor));
  const precioAnteriorValor = Math.max(
    precioValor,
    Math.round(input.precioAnteriorValor || input.precioValor),
  );
  const stock = Math.max(0, Math.round(input.stock));
  const stockMinimo = Math.max(0, Math.round(input.stockMinimo));
  const isService = isServiceDivision(input.division);
  const baseSlug = slugify(input.nombre) || `producto-${Date.now()}`;
  let slug = existingSlug || baseSlug;
  let suffix = 1;

  while (
    !existingSlug &&
    currentProducts.some((product) => product.slug === slug)
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return {
    slug,
    sku: input.sku?.trim() || slug.replace(/-/g, "").toUpperCase().slice(0, 10),
    oemReferencia: input.oemReferencia?.trim() || undefined,
    referenciasAlternas: input.referenciasAlternas || [],
    categoria: input.categoria,
    subcategoria: input.subcategoria?.trim() || undefined,
    categoriaMenor: input.categoriaMenor?.trim() || undefined,
    nombre: input.nombre.trim(),
    marca: input.marca.trim(),
    division: input.division,
    displayPriceOverride: input.displayPriceOverride?.trim() || undefined,
    displaySecondaryLabel: input.displaySecondaryLabel?.trim() || undefined,
    precio: input.displayPriceOverride?.trim() || formatearMoneda(precioValor),
    precioAnterior: input.displaySecondaryLabel?.trim() || formatearMoneda(precioAnteriorValor),
    precioValor,
    stock,
    stockMinimo,
    estadoInventario: getInventoryState(stock, stockMinimo),
    puedeComprar: isService ? true : stock > 0,
    descuento: formatearDescuento(precioValor, precioAnteriorValor),
    imagen: input.imagen || DIVISION_BRAND[input.division].logo,
    imagenesExtra: input.imagenesExtra || [],
    disponibilidad: isService ? input.disponibilidad : stock <= 0 ? "Agotado" : input.disponibilidad,
    descripcion:
      input.descripcion ||
      descripcionProducto({
        nombre: input.nombre,
        categoria: input.categoria,
        marca: input.marca,
      }),
    aplicacion:
      input.aplicacion || `Aplicación comercial para ${input.categoria}.`,
    compatibilidad: input.compatibilidad || [input.marca, input.categoria],
    garantia:
      input.garantia || "Garantía técnica según aplicación y condiciones de uso.",
    destacado: false,
  };
}

function persistLocalProducts(products: StoreProduct[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

export function ProductsProvider({
  children,
  initialProducts,
}: {
  children: ReactNode;
  initialProducts: StoreProduct[];
}) {
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(LOCAL_PRODUCTS_KEY);
      if (!stored) return;

      const localProducts = JSON.parse(stored) as StoreProduct[];
      const knownSlugs = new Set(initialProducts.map((product) => product.slug));
      const localOnlyProducts = localProducts.filter(
        (product) => !knownSlugs.has(product.slug),
      );

      if (localOnlyProducts.length > 0) {
        // Merge products cached in localStorage (created while the
        // database was unreachable) with the server-provided list.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProducts([...localOnlyProducts, ...initialProducts]);
      } else {
        window.localStorage.removeItem(LOCAL_PRODUCTS_KEY);
      }
    } catch {
      window.localStorage.removeItem(LOCAL_PRODUCTS_KEY);
    }
  }, [initialProducts]);

  const value: ProductsContextValue = {
    products,
    adminProducts: products,
    createProduct: async (input) => {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const payload = (await response.json()) as {
        error?: string;
        product?: StoreProduct;
      };

      if (!response.ok || !payload.product) {
        if (isLocalModeError(payload.error)) {
          const localProduct = createLocalProduct(input, products);
          const nextProducts = [localProduct, ...products];
          setProducts(nextProducts);
          persistLocalProducts(nextProducts);
          return { ok: true };
        }

        return {
          ok: false,
          message: payload.error || "No fue posible guardar el producto.",
        };
      }

      setProducts((current) => {
        const nextProducts = [payload.product!, ...current];
        persistLocalProducts(nextProducts);
        return nextProducts;
      });

      return { ok: true };
    },
    updateProduct: async (slug, input) => {
      const response = await fetch(`/api/products/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const payload = (await response.json()) as {
        error?: string;
        product?: StoreProduct;
      };

      if (!response.ok || !payload.product) {
        if (isLocalModeError(payload.error)) {
          const nextProducts = products.map((product) =>
            product.slug === slug
              ? createLocalProduct(input, products, slug)
              : product,
          );
          setProducts(nextProducts);
          persistLocalProducts(nextProducts);
          return { ok: true };
        }

        return {
          ok: false,
          message: payload.error || "No fue posible actualizar el producto.",
        };
      }

      setProducts((current) => {
        const nextProducts = current.map((product) =>
          product.slug === slug ? payload.product! : product,
        );
        persistLocalProducts(nextProducts);
        return nextProducts;
      });

      return { ok: true };
    },
    removeProduct: async (slug) => {
      const response = await fetch(`/api/products/${slug}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        if (isLocalModeError(payload.error)) {
          const nextProducts = products.filter((product) => product.slug !== slug);
          setProducts(nextProducts);
          persistLocalProducts(nextProducts);
          return { ok: true };
        }

        return {
          ok: false,
          message: payload.error || "No fue posible eliminar el producto.",
        };
      }

      setProducts((current) => {
        const nextProducts = current.filter((product) => product.slug !== slug);
        persistLocalProducts(nextProducts);
        return nextProducts;
      });

      return { ok: true };
    },
    adjustInventory: async (slug, quantity, note) => {
      const response = await fetch(`/api/inventory/${slug}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity, note }),
      });

      const payload = (await response.json()) as {
        error?: string;
        product?: StoreProduct;
      };

      if (!response.ok || !payload.product) {
        if (isLocalModeError(payload.error)) {
          let blocked = false;
          const nextProducts = products.map((product) => {
            if (product.slug !== slug) return product;

            const stock = Math.max(0, (product.stock ?? 0) + Math.trunc(quantity));
            if ((product.stock ?? 0) + Math.trunc(quantity) < 0) {
              blocked = true;
              return product;
            }

            const disponibilidad: Disponibilidad =
              stock <= 0
                ? "Agotado"
                : stock <= (product.stockMinimo ?? 0)
                  ? "Disponible por pedido"
                  : "Entrega inmediata";

            return {
              ...product,
              stock,
              estadoInventario: getInventoryState(stock, product.stockMinimo ?? 0),
              puedeComprar: stock > 0,
              disponibilidad,
            };
          });

          if (blocked) {
            return {
              ok: false,
              message: "No puedes dejar el stock por debajo de cero.",
            };
          }

          setProducts(nextProducts);
          persistLocalProducts(nextProducts);
          return { ok: true };
        }

        return {
          ok: false,
          message: payload.error || "No fue posible ajustar el inventario.",
        };
      }

      setProducts((current) => {
        const nextProducts = current.map((product) =>
          product.slug === slug ? payload.product! : product,
        );
        persistLocalProducts(nextProducts);
        return nextProducts;
      });

      return { ok: true };
    },
    refreshProducts: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) return;

      const payload = (await response.json()) as { products?: StoreProduct[] };
      if (payload.products) {
        setProducts(payload.products);
      }
    },
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }

  return context;
}
