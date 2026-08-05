import {
  categorias,
  descripcionProducto,
  disponibilidades,
  formatearDescuento,
  formatearMoneda,
  productosCatalogo,
  slugify,
  type Categoria,
  type Disponibilidad,
  type ProductoCatalogo,
  type ProductoCategoriaAdicional,
  type ProductoEspecificacion,
  type ProductoVariante,
} from "@/app/data/catalog";
import { prisma } from "@/lib/prisma";
import { DIVISION_BRAND, isServiceDivision, type DivisionName } from "@/lib/divisions";

type ProductRecord = {
  id?: string;
  slug: string;
  sku?: string | null;
  oemReference?: string | null;
  alternativeReferences?: string[] | null;
  category: string;
  name: string;
  brand: string;
  division: DivisionName;
  price: number;
  previousPrice: number;
  displayPriceOverride?: string | null;
  displaySecondaryLabel?: string | null;
  stock: number;
  minimumStock: number;
  image: string;
  galleryImages?: string[] | null;
  availability: string;
  description: string;
  application?: string | null;
  compatibility?: string[] | null;
  warranty?: string | null;
  technicalSheetUrl?: string | null;
  technicalSpecs?: unknown;
  featured: boolean;
  variants?: Array<{ label: string; sku: string; stock: number; price?: number | null }> | null;
};

export type StoreProduct = ProductoCatalogo & {
  descripcion: string;
  destacado: boolean;
};

export type InventoryMovementSummary = {
  id: string;
  productSlug: string;
  productName: string;
  productSku: string | null;
  type: "CREATED" | "ADJUSTMENT" | "ORDER_DEDUCTION";
  quantity: number;
  stockAfter: number;
  note: string | null;
  createdAt: Date;
};

export type ProductMutationInput = {
  sku?: string;
  oemReferencia?: string;
  referenciasAlternas?: string[];
  categoria: string;
  subcategoria?: string;
  categoriaMenor?: string;
  categoriasAdicionales?: ProductoCategoriaAdicional[];
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
  fichaTecnicaUrl?: string;
  especificacionesTecnicas?: ProductoEspecificacion[];
  variantes?: ProductoVariante[];
};

function normalizeVariantes(variantes: unknown): ProductoVariante[] {
  if (!Array.isArray(variantes)) return [];

  const seenSkus = new Set<string>();
  const result: ProductoVariante[] = [];

  for (const item of variantes) {
    if (!item || typeof item !== "object") continue;

    const medida =
      "medida" in item && typeof item.medida === "string" ? item.medida.trim() : "";
    const sku =
      "sku" in item && typeof item.sku === "string" ? item.sku.trim().toUpperCase() : "";
    const stock =
      "stock" in item && typeof item.stock === "number" && Number.isFinite(item.stock)
        ? Math.max(0, Math.round(item.stock))
        : 0;
    const precioValor =
      "precioValor" in item &&
      typeof item.precioValor === "number" &&
      Number.isFinite(item.precioValor) &&
      item.precioValor > 0
        ? Math.max(1, Math.round(item.precioValor))
        : undefined;

    if (!medida || !sku || seenSkus.has(sku)) continue;

    seenSkus.add(sku);
    result.push({ medida, sku, stock, precioValor });

    if (result.length >= 50) break;
  }

  return result;
}

function sumVariantStock(variantes: ProductoVariante[]) {
  return variantes.reduce((total, variante) => total + variante.stock, 0);
}

function normalizeTechnicalSpecs(specs: unknown): ProductoEspecificacion[] {
  if (!Array.isArray(specs)) return [];

  return specs
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const etiqueta =
        "etiqueta" in item && typeof item.etiqueta === "string" ? item.etiqueta.trim() : "";
      const valor = "valor" in item && typeof item.valor === "string" ? item.valor.trim() : "";

      if (!etiqueta || !valor) return null;
      return { etiqueta, valor };
    })
    .filter((item): item is ProductoEspecificacion => Boolean(item));
}

function createSkuFromName(name: string) {
  return (
    slugify(name)
      .replace(/-/g, "")
      .toUpperCase()
      .slice(0, 10) || `SKU${Date.now()}`
  );
}

function normalizeStockAvailability(
  availability: string,
  stock: number,
  minimumStock: number,
  isService: boolean,
): Disponibilidad {
  if (isService) {
    return normalizeDisponibilidad(availability);
  }

  if (stock <= 0) {
    return "Agotado";
  }

  if (availability === "Agotado") {
    return stock <= minimumStock ? "Disponible por pedido" : "Entrega inmediata";
  }

  return normalizeDisponibilidad(availability);
}

function getInventoryState(stock: number, minimumStock: number) {
  if (stock <= 0) return "out-of-stock" as const;
  if (stock <= minimumStock) return "low-stock" as const;
  return "in-stock" as const;
}

function normalizeProductImage(value: string | null | undefined) {
  const image = (value || "").trim();

  if (
    image.startsWith("/") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return "";
}

function normalizeGalleryImages(images: Array<string | null | undefined>) {
  return images
    .map(normalizeProductImage)
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeTextList(values: Array<string | null | undefined>) {
  return values
    .map((value) => (value || "").trim())
    .filter(Boolean);
}

function normalizeCategoria(value: string): Categoria {
  return value.trim() || categorias[0];
}

// `Product.slug`, `Product.sku` and `ProductVariant.sku` are all `@unique`.
// Slug/product-SKU collisions are already avoided by the pre-insert
// collision-avoidance loops in createProduct/updateProduct, so at insert time
// a P2002 on "sku" almost always comes from a variant SKU (which is never
// pre-checked) — but we still read `meta.target` when Prisma provides it so
// the error isn't blindly mislabeled as "duplicate variant SKU" when it's
// actually the product's own slug or SKU racing a concurrent create.
function classifyProductUniqueConstraintError(error: unknown, hasVariants: boolean) {
  const target =
    error &&
    typeof error === "object" &&
    "meta" in error &&
    error.meta &&
    typeof error.meta === "object" &&
    "target" in error.meta
      ? (error as { meta: { target?: unknown } }).meta.target
      : undefined;
  const targetFields = Array.isArray(target)
    ? target
    : typeof target === "string"
      ? [target]
      : [];

  if (targetFields.includes("slug")) return "DUPLICATE_SLUG";
  if (targetFields.includes("sku") && !hasVariants) return "DUPLICATE_SKU";
  return "DUPLICATE_VARIANT_SKU";
}

// Internal bookkeeping markers (subcategoría / categoría menor / categorías
// adicionales) are smuggled inside the same `compatibility` string array the
// admin's free-text "Compatibilidad" field reads and writes. They're tagged
// with a leading NUL byte so they can never collide with real admin-entered
// text (which previously used a plain human-readable prefix like
// "Subcategoría: ..." — a legitimate compatibility entry starting with those
// exact words was silently dropped on save). Legacy plain-prefixed markers
// from products saved before this change are still recognized on read.
const INTERNAL_MARKER_PREFIX = "\u0000geu-internal:";
const LEGACY_SUBCATEGORY_PREFIX = "subcategoría:";
const LEGACY_MINOR_CATEGORY_PREFIX = "categoría menor:";
const LEGACY_ADDITIONAL_CATEGORIES_PREFIX = "categorías adicionales:";

function getSubcategoryMarker(value: string) {
  return `${INTERNAL_MARKER_PREFIX}subcategoria:${value.trim()}`;
}

function getMinorCategoryMarker(value: string) {
  return `${INTERNAL_MARKER_PREFIX}categoria-menor:${value.trim()}`;
}

function isInternalMarker(value: string) {
  const normalized = value.toLowerCase();
  return (
    value.startsWith(INTERNAL_MARKER_PREFIX) ||
    normalized.startsWith(LEGACY_SUBCATEGORY_PREFIX) ||
    normalized.startsWith(LEGACY_MINOR_CATEGORY_PREFIX) ||
    normalized.startsWith(LEGACY_ADDITIONAL_CATEGORIES_PREFIX)
  );
}

function extractSubcategory(values: Array<string | null | undefined>) {
  const list = normalizeTextList(values);

  const sentinel = list.find((value) =>
    value.startsWith(`${INTERNAL_MARKER_PREFIX}subcategoria:`),
  );
  if (sentinel) {
    return sentinel.slice(`${INTERNAL_MARKER_PREFIX}subcategoria:`.length).trim();
  }

  return list
    .find((value) => value.toLowerCase().startsWith(LEGACY_SUBCATEGORY_PREFIX))
    ?.replace(/^subcategoría:\s*/i, "")
    .trim();
}

function extractMinorCategory(values: Array<string | null | undefined>) {
  const list = normalizeTextList(values);

  const sentinel = list.find((value) =>
    value.startsWith(`${INTERNAL_MARKER_PREFIX}categoria-menor:`),
  );
  if (sentinel) {
    return sentinel.slice(`${INTERNAL_MARKER_PREFIX}categoria-menor:`.length).trim();
  }

  return list
    .find((value) => value.toLowerCase().startsWith(LEGACY_MINOR_CATEGORY_PREFIX))
    ?.replace(/^categoría menor:\s*/i, "")
    .trim();
}

function getAdditionalCategoriesMarker(entries: ProductoCategoriaAdicional[]) {
  return `${INTERNAL_MARKER_PREFIX}categorias-adicionales:${JSON.stringify(entries)}`;
}

function extractAdditionalCategories(
  values: Array<string | null | undefined>,
): ProductoCategoriaAdicional[] {
  const list = normalizeTextList(values);
  const sentinelPrefix = `${INTERNAL_MARKER_PREFIX}categorias-adicionales:`;
  const sentinelMarker = list.find((value) => value.startsWith(sentinelPrefix));
  const legacyMarker = sentinelMarker
    ? undefined
    : list.find((value) => value.toLowerCase().startsWith(LEGACY_ADDITIONAL_CATEGORIES_PREFIX));
  if (!sentinelMarker && !legacyMarker) return [];

  const json = sentinelMarker
    ? sentinelMarker.slice(sentinelPrefix.length).trim()
    : legacyMarker!.slice(legacyMarker!.indexOf(":") + 1).trim();

  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];

    const result: ProductoCategoriaAdicional[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const categoria =
        "categoria" in item && typeof item.categoria === "string" ? item.categoria.trim() : "";
      if (!categoria) continue;

      const subcategoria =
        "subcategoria" in item && typeof item.subcategoria === "string"
          ? item.subcategoria.trim() || undefined
          : undefined;
      const categoriaMenor =
        "categoriaMenor" in item && typeof item.categoriaMenor === "string"
          ? item.categoriaMenor.trim() || undefined
          : undefined;

      result.push({ categoria, subcategoria, categoriaMenor });
    }

    return result;
  } catch {
    return [];
  }
}

function normalizeCompatibilityList(
  values: Array<string | null | undefined>,
  subcategoria?: string,
  categoriaMenor?: string,
  categoriasAdicionales?: ProductoCategoriaAdicional[],
) {
  const withoutMarkers = normalizeTextList(values).filter((value) => !isInternalMarker(value));
  const nextValues = [...withoutMarkers];

  if (subcategoria?.trim()) {
    nextValues.push(getSubcategoryMarker(subcategoria));
  }

  if (categoriaMenor?.trim()) {
    nextValues.push(getMinorCategoryMarker(categoriaMenor));
  }

  const validAdditionalCategories = (categoriasAdicionales || [])
    .map((entry) => ({
      categoria: entry.categoria?.trim() || "",
      subcategoria: entry.subcategoria?.trim() || undefined,
      categoriaMenor: entry.categoriaMenor?.trim() || undefined,
    }))
    .filter((entry) => entry.categoria);

  if (validAdditionalCategories.length > 0) {
    nextValues.push(getAdditionalCategoriesMarker(validAdditionalCategories));
  }

  return nextValues;
}

function normalizeDisponibilidad(value: string): Disponibilidad {
  return disponibilidades.includes(value as Disponibilidad)
    ? (value as Disponibilidad)
    : disponibilidades[0];
}

function toStoreProduct(product: ProductRecord): StoreProduct {
  const categoria = normalizeCategoria(product.category);
  const subcategoria = extractSubcategory(product.compatibility || []);
  const categoriaMenor = extractMinorCategory(product.compatibility || []);
  const isService = isServiceDivision(product.division);
  const disponibilidad = normalizeStockAvailability(
    product.availability,
    product.stock,
    product.minimumStock,
    isService,
  );
  const estadoInventario = getInventoryState(product.stock, product.minimumStock);

  return {
    slug: product.slug,
    sku: product.sku || undefined,
    oemReferencia: product.oemReference || undefined,
    referenciasAlternas: normalizeTextList(product.alternativeReferences || []),
    categoria,
    nombre: product.name,
    marca: product.brand,
    division: product.division,
    displayPriceOverride: product.displayPriceOverride || undefined,
    displaySecondaryLabel: product.displaySecondaryLabel || undefined,
    precio: product.displayPriceOverride || formatearMoneda(product.price),
    precioAnterior: product.displaySecondaryLabel || formatearMoneda(product.previousPrice),
    precioValor: product.price,
    stock: product.stock,
    stockMinimo: product.minimumStock,
    estadoInventario,
    puedeComprar: isService ? true : product.stock > 0,
    descuento: formatearDescuento(product.price, product.previousPrice),
    imagen: product.image,
    imagenesExtra: normalizeGalleryImages(product.galleryImages || []),
    disponibilidad,
    subcategoria,
    categoriaMenor,
    categoriasAdicionales: extractAdditionalCategories(product.compatibility || []),
    descripcion:
      product.description ||
      descripcionProducto({
        nombre: product.name,
        categoria,
        marca: product.brand,
      }),
    aplicacion:
      product.application?.trim() ||
      `Aplicación recomendada para la línea ${categoria}.`,
    compatibilidad: normalizeTextList(product.compatibility || []).filter(
      (value) => !isInternalMarker(value),
    ),
    garantia: product.warranty?.trim() || "1 año de garantía del fabricante",
    fichaTecnicaUrl: product.technicalSheetUrl || undefined,
    especificacionesTecnicas: normalizeTechnicalSpecs(product.technicalSpecs),
    variantes: (product.variants || []).map((variant) => ({
      medida: variant.label,
      sku: variant.sku,
      stock: variant.stock,
      precio:
        variant.price != null ? formatearMoneda(variant.price) : undefined,
      precioValor: variant.price != null ? variant.price : undefined,
    })),
    destacado: product.featured,
  };
}

function getFallbackProducts(): StoreProduct[] {
  return productosCatalogo.map((producto, index) => ({
    ...producto,
    division: producto.division ?? "Cauchos",
    sku: producto.sku || createSkuFromName(producto.nombre),
    stock: producto.stock ?? 12,
    stockMinimo: producto.stockMinimo ?? 3,
    estadoInventario:
      producto.stock !== undefined && (producto.stock ?? 0) <= 0
        ? "out-of-stock"
        : (producto.stock ?? 12) <= (producto.stockMinimo ?? 3)
          ? "low-stock"
          : "in-stock",
    puedeComprar: (producto.stock ?? 12) > 0,
    descripcion:
      producto.descripcion ||
      descripcionProducto({
        nombre: producto.nombre,
        categoria: producto.categoria,
        marca: producto.marca,
      }),
    oemReferencia:
      producto.oemReferencia ||
      (producto.sku ? `OEM-${producto.sku}` : undefined),
    referenciasAlternas: producto.referenciasAlternas || [],
    aplicacion:
      producto.aplicacion ||
      `Aplicación comercial para ${producto.categoria.toLowerCase()}.`,
    compatibilidad:
      producto.compatibilidad || [producto.marca, producto.categoria],
    garantia: producto.garantia || "1 año de garantía del fabricante",
    destacado: producto.destacado ?? index < 4,
  }));
}

export async function getProductDivision(slug: string): Promise<DivisionName | null> {
  if (!prisma) {
    return null;
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { division: true },
  });

  return product?.division ?? null;
}

export async function getProducts() {
  if (!prisma) {
    return getFallbackProducts();
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: { variants: true },
    });

    return products.map(toStoreProduct);
  } catch (error) {
    // Do NOT fall back to the static placeholder catalog here — those are
    // unrelated demo products (wrong prices/stock/images, some left over
    // from a different project) and silently swapping to them on a real DB
    // error would show customers fabricated pricing and availability. An
    // empty catalog is the honest degraded state; every caller already
    // handles zero products safely.
    console.error("getProducts: fallo la consulta a la base de datos", error);
    return [];
  }
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  const destacados = products.filter((product) => product.destacado);

  return (destacados.length > 0 ? destacados : products).slice(0, 4);
}

export async function createProduct(input: ProductMutationInput) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const nombre = input.nombre.trim();
  const marca = input.marca.trim();
  const baseSlug = slugify(nombre) || `producto-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const normalizedVariantes = normalizeVariantes(input.variantes);
  const hasVariants = normalizedVariantes.length > 0;
  const precioValor = Math.max(1, Math.round(input.precioValor));
  const precioAnteriorValor = Math.max(
    precioValor,
    Math.round(input.precioAnteriorValor || input.precioValor),
  );
  const stock = hasVariants ? sumVariantStock(normalizedVariantes) : Math.max(0, Math.round(input.stock));
  const stockMinimo = Math.max(0, Math.round(input.stockMinimo));
  const imagen = normalizeProductImage(input.imagen) || DIVISION_BRAND[input.division].logo;
  const imagenesExtra = normalizeGalleryImages(input.imagenesExtra || []);
  let sku: string | null = null;

  if (!hasVariants) {
    const baseSku = (input.sku?.trim() || createSkuFromName(nombre)).toUpperCase();
    sku = baseSku;
    let skuSuffix = 1;

    while (await prisma.product.findUnique({ where: { sku } })) {
      sku = `${baseSku}-${skuSuffix}`;
      skuSuffix += 1;
    }
  }

  let created;
  try {
    created = await prisma.product.create({
    data: {
      slug,
      sku,
      oemReference: input.oemReferencia?.trim() || null,
      alternativeReferences: {
        set: normalizeTextList(input.referenciasAlternas || []),
      },
      category: input.categoria,
      name: nombre,
      brand: marca,
      division: input.division,
      price: precioValor,
      previousPrice: precioAnteriorValor,
      displayPriceOverride: input.displayPriceOverride?.trim() || null,
      displaySecondaryLabel: input.displaySecondaryLabel?.trim() || null,
      stock,
      minimumStock: stockMinimo,
      image: imagen,
      galleryImages: {
        set: imagenesExtra,
      },
      availability: normalizeStockAvailability(input.disponibilidad, stock, stockMinimo, isServiceDivision(input.division)),
      description:
        input.descripcion?.trim() ||
        descripcionProducto({
          nombre,
          categoria: input.categoria,
          marca,
        }),
      application: input.aplicacion?.trim() || null,
      compatibility: {
        set: normalizeCompatibilityList(
          input.compatibilidad || [],
          input.subcategoria,
          input.categoriaMenor,
          input.categoriasAdicionales,
        ),
      },
      warranty: input.garantia?.trim() || "1 año de garantía del fabricante",
      technicalSheetUrl: input.fichaTecnicaUrl?.trim() || null,
      technicalSpecs: normalizeTechnicalSpecs(input.especificacionesTecnicas),
      featured: false,
      active: true,
      inventoryMovements: {
        create: {
          type: "CREATED",
          quantity: stock,
          stockAfter: stock,
          note: "Inventario inicial del producto",
        },
      },
      variants: hasVariants
        ? {
            create: normalizedVariantes.map((variante) => ({
              label: variante.medida,
              sku: variante.sku,
              stock: variante.stock,
              price: variante.precioValor ?? null,
            })),
          }
        : undefined,
    },
    include: { variants: true },
  });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error(classifyProductUniqueConstraintError(error, hasVariants));
    }
    throw error;
  }

  return toStoreProduct(created);
}

export async function updateProduct(slug: string, input: ProductMutationInput) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const existing = await prisma.product.findUnique({
    where: { slug },
    include: { variants: true },
  });

  if (!existing) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const nombre = input.nombre.trim();
  const marca = input.marca.trim();
  const precioValor = Math.max(1, Math.round(input.precioValor));
  const precioAnteriorValor = Math.max(
    precioValor,
    Math.round(input.precioAnteriorValor || input.precioValor),
  );
  const normalizedVariantes = normalizeVariantes(input.variantes);
  const hasVariants = normalizedVariantes.length > 0;
  const stock = hasVariants ? sumVariantStock(normalizedVariantes) : Math.max(0, Math.round(input.stock));
  const stockMinimo = Math.max(0, Math.round(input.stockMinimo));
  const imagen = normalizeProductImage(input.imagen) || existing.image;
  const imagenesExtra = normalizeGalleryImages(input.imagenesExtra || []);

  const nextSlugBase = slugify(nombre) || slug;
  let nextSlug = slug;

  if (nextSlugBase !== slug) {
    nextSlug = nextSlugBase;
    let suffix = 1;

    while (
      await prisma.product.findFirst({
        where: {
          slug: nextSlug,
          NOT: { id: existing.id },
        },
      })
    ) {
      nextSlug = `${nextSlugBase}-${suffix}`;
      suffix += 1;
    }
  }

  let nextSku: string | null = null;

  if (!hasVariants) {
    const nextSkuBase = (input.sku?.trim() || existing.sku || createSkuFromName(nombre)).toUpperCase();
    nextSku = nextSkuBase;

    if (nextSkuBase !== existing.sku) {
      let skuSuffix = 1;

      while (
        await prisma.product.findFirst({
          where: {
            sku: nextSku,
            NOT: { id: existing.id },
          },
        })
      ) {
        nextSku = `${nextSkuBase}-${skuSuffix}`;
        skuSuffix += 1;
      }
    }
  }

  const stockDelta = stock - existing.stock;

  // Reconcile variant rows by SKU (the admin form's row id is client-only,
  // not the DB row id) — rows removed from the submission get deleted, rows
  // matching an existing SKU get updated in place, and the rest are new.
  const incomingSkus = new Set(normalizedVariantes.map((variante) => variante.sku));
  const variantesToDelete = existing.variants.filter((variant) => !incomingSkus.has(variant.sku));
  const variantesToUpdate = normalizedVariantes.filter((variante) =>
    existing.variants.some((variant) => variant.sku === variante.sku),
  );
  const variantesToCreate = normalizedVariantes.filter(
    (variante) => !existing.variants.some((variant) => variant.sku === variante.sku),
  );

  let updated;

  try {
    updated = await prisma.$transaction(async (tx) => {
      if (variantesToDelete.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: variantesToDelete.map((variant) => variant.id) } },
        });
      }

      for (const variante of variantesToUpdate) {
        await tx.productVariant.update({
          where: { sku: variante.sku },
          data: {
            label: variante.medida,
            stock: variante.stock,
            price: variante.precioValor ?? null,
          },
        });
      }

      if (variantesToCreate.length > 0) {
        await tx.productVariant.createMany({
          data: variantesToCreate.map((variante) => ({
            productId: existing.id,
            label: variante.medida,
            sku: variante.sku,
            stock: variante.stock,
            price: variante.precioValor ?? null,
          })),
        });
      }

      return tx.product.update({
        where: { slug },
        data: {
          slug: nextSlug,
          sku: nextSku,
          oemReference: input.oemReferencia?.trim() || null,
          alternativeReferences: {
            set: normalizeTextList(input.referenciasAlternas || []),
          },
          category: input.categoria,
          name: nombre,
          brand: marca,
          price: precioValor,
          previousPrice: precioAnteriorValor,
          displayPriceOverride: input.displayPriceOverride?.trim() || null,
          displaySecondaryLabel: input.displaySecondaryLabel?.trim() || null,
          stock,
          minimumStock: stockMinimo,
          image: imagen,
          galleryImages: {
            set: imagenesExtra,
          },
          availability: normalizeStockAvailability(input.disponibilidad, stock, stockMinimo, isServiceDivision(input.division)),
          description:
            input.descripcion?.trim() ||
            descripcionProducto({
              nombre,
              categoria: input.categoria,
              marca,
            }),
          application: input.aplicacion?.trim() || null,
          compatibility: {
            set: normalizeCompatibilityList(
              input.compatibilidad || [],
              input.subcategoria,
              input.categoriaMenor,
              input.categoriasAdicionales,
            ),
          },
          warranty: input.garantia?.trim() || "1 año de garantía del fabricante",
          technicalSheetUrl: input.fichaTecnicaUrl?.trim() || existing.technicalSheetUrl || null,
          technicalSpecs: normalizeTechnicalSpecs(input.especificacionesTecnicas),
          inventoryMovements:
            stockDelta !== 0
              ? {
                  create: {
                    type: "ADJUSTMENT",
                    quantity: stockDelta,
                    stockAfter: stock,
                    note: "Ajuste manual desde el panel admin",
                  },
                }
              : undefined,
        },
        include: { variants: true },
      });
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error(classifyProductUniqueConstraintError(error, hasVariants));
    }
    throw error;
  }

  return toStoreProduct(updated);
}

export async function deleteProduct(slug: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  await prisma.product.delete({
    where: { slug },
  });
}

export async function adjustProductInventory(
  slug: string,
  quantity: number,
  note?: string,
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const normalizedQuantity = Math.trunc(quantity);

  if (normalizedQuantity === 0) {
    throw new Error("INVALID_QUANTITY");
  }

  const nextStock = product.stock + normalizedQuantity;

  if (nextStock < 0) {
    throw new Error("INSUFFICIENT_STOCK");
  }

  const updated = await prisma.product.update({
    where: { slug },
    data: {
      stock: nextStock,
      availability:
        nextStock <= 0
          ? "Agotado"
          : nextStock <= product.minimumStock
            ? "Disponible por pedido"
            : "Entrega inmediata",
      inventoryMovements: {
        create: {
          type: "ADJUSTMENT",
          quantity: normalizedQuantity,
          stockAfter: nextStock,
          note: note?.trim() || "Ajuste rápido desde inventario",
        },
      },
    },
  });

  return toStoreProduct(updated);
}

export async function getRecentInventoryMovements(limit = 16) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const movements = await prisma.inventoryMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      product: {
        select: {
          slug: true,
          name: true,
          sku: true,
        },
      },
    },
  });

  return movements.map(
    (movement): InventoryMovementSummary => ({
      id: movement.id,
      productSlug: movement.product.slug,
      productName: movement.product.name,
      productSku: movement.product.sku,
      type: movement.type,
      quantity: movement.quantity,
      stockAfter: movement.stockAfter,
      note: movement.note,
      createdAt: movement.createdAt,
    }),
  );
}
