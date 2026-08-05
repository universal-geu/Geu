import {
  formatearMoneda,
  getCategoriasForDivision,
  slugCategoria,
  type Categoria,
} from "@/app/data/catalog";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";
import { getProducts, type StoreProduct } from "@/lib/products";

function normalizeDivision(value: string | undefined): DivisionName {
  return DIVISIONS.includes(value as DivisionName) ? (value as DivisionName) : "Cauchos";
}

export type ChatSuggestion = {
  label: string;
  href: string;
};

export type CatalogSnapshot = {
  matchedProducts: StoreProduct[];
  matchedCategories: Categoria[];
  allCategories: Categoria[];
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreProduct(product: StoreProduct, queryTokens: string[]) {
  if (queryTokens.length === 0) return 0;

  const haystack = normalizeText(
    [
      product.nombre,
      product.marca,
      product.categoria,
      product.descripcion || "",
      product.sku || "",
      product.disponibilidad,
    ].join(" "),
  );

  return queryTokens.reduce((score, token) => {
    if (normalizeText(product.nombre).includes(token)) return score + 7;
    if (normalizeText(product.categoria).includes(token)) return score + 5;
    if (normalizeText(product.marca).includes(token)) return score + 4;
    if (haystack.includes(token)) return score + 2;
    return score;
  }, 0);
}

function getMatchedCategories(query: string, division: DivisionName) {
  const normalized = normalizeText(query);
  const queryTokens = new Set(tokenize(query));
  const categoriesForDivision = getCategoriasForDivision(division);

  return categoriesForDivision.filter((category) => {
    const categoryValue = normalizeText(category);
    if (normalized.includes(categoryValue)) return true;
    if (normalized.includes(slugCategoria(category))) return true;

    // Word-level match against the tokenized query, not a raw substring
    // check — otherwise a short connector word like "y" (present in several
    // category names) matches almost any query containing that letter.
    return categoryValue
      .split(" ")
      .filter((word) => word.length > 2)
      .some((word) => queryTokens.has(word));
  });
}

export async function getCatalogSnapshot(
  query: string,
  divisionInput?: string,
): Promise<CatalogSnapshot> {
  const division = normalizeDivision(divisionInput);
  const allProducts = await getProducts();
  const products = allProducts.filter((product) => (product.division ?? "Cauchos") === division);
  const queryTokens = tokenize(query);
  const matchedCategories = getMatchedCategories(query, division);

  const matchedProducts = products
    .map((product) => ({
      product,
      score:
        scoreProduct(product, queryTokens) +
        (matchedCategories.includes(product.categoria) ? 6 : 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((entry) => entry.product);

  return {
    matchedProducts,
    matchedCategories,
    allCategories: getCategoriasForDivision(division),
  };
}

export function buildCatalogContext(snapshot: CatalogSnapshot) {
  const productLines =
    snapshot.matchedProducts.length > 0
      ? snapshot.matchedProducts
          .map((product) => {
            return `- ${product.nombre} | categoria: ${product.categoria} | marca: ${product.marca} | precio: ${formatearMoneda(product.precioValor)} | disponibilidad: ${product.disponibilidad} | stock: ${product.stock ?? 0} | link: /producto/${product.slug}`;
          })
          .join("\n")
      : "- No hubo coincidencias directas en el catálogo para esta consulta.";

  return [
    `Categorias disponibles: ${snapshot.allCategories.join(", ")}.`,
    snapshot.matchedCategories.length > 0
      ? `Categorias relacionadas con la consulta: ${snapshot.matchedCategories.join(", ")}.`
      : "No hubo una categoría exacta identificada en la consulta.",
    "Productos más relevantes del catálogo:",
    productLines,
  ].join("\n");
}

function buildProductSuggestions(products: StoreProduct[]): ChatSuggestion[] {
  return products.slice(0, 3).map((product) => ({
    label: product.nombre,
    href: `/producto/${product.slug}`,
  }));
}

function buildCategorySuggestions(
  categoriesToSuggest: Categoria[],
  division: DivisionName,
): ChatSuggestion[] {
  return categoriesToSuggest.slice(0, 3).map((category) => ({
    label: category,
    href: `/categorias?categoria=${slugCategoria(category)}&division=${division}`,
  }));
}

export function buildLocalAssistantReply(
  query: string,
  snapshot: CatalogSnapshot,
  divisionInput?: string,
): {
  message: string;
  suggestions: ChatSuggestion[];
} {
  const division = normalizeDivision(divisionInput);
  const normalized = normalizeText(query);

  if (!normalized) {
    return {
      message:
        "Te ayudo a encontrar productos, categorías y disponibilidad. Puedes escribir algo como “busco cauchos”, “necesito motores” o “cómo funciona el envío”.",
      suggestions: buildCategorySuggestions(snapshot.allCategories, division),
    };
  }

  if (
    normalized.includes("envio") ||
    normalized.includes("domicilio") ||
    normalized.includes("transportadora")
  ) {
    return {
      message:
        "En GEU puedes ver el estado del despacho desde tu cuenta. Cuando el pedido avance, verás etapas como pedido confirmado, en preparación, enviado y recibido. Si quieres, también puedo ayudarte a encontrar primero el producto correcto.",
      suggestions: [
        { label: "Ver categorías", href: `/categorias?division=${division}` },
        { label: "Mi cuenta", href: "/mi-cuenta" },
      ],
    };
  }

  if (
    normalized.includes("pago") ||
    normalized.includes("wompi") ||
    normalized.includes("tarjeta")
  ) {
    return {
      message:
        "La tienda ya tiene flujo de checkout y un pago demo activo para mostrar la experiencia. Cuando conectes la pasarela real, el pedido podrá pasar de pago pendiente a pago confirmado automáticamente.",
      suggestions: [{ label: "Ir al carrito", href: "/carrito" }],
    };
  }

  if (
    normalized.includes("pedido") ||
    normalized.includes("orden") ||
    normalized.includes("seguimiento")
  ) {
    return {
      message:
        "Para revisar un pedido real, lo ideal es entrar a tu cuenta. Allí puedes ver el seguimiento, la transportadora, la guía y el avance del despacho.",
      suggestions: [{ label: "Mi cuenta", href: "/mi-cuenta" }],
    };
  }

  if (snapshot.matchedProducts.length > 0) {
    const lines = snapshot.matchedProducts
      .slice(0, 3)
      .map((product) => {
        return `• ${product.nombre} (${product.categoria}) por ${formatearMoneda(product.precioValor)}. Disponibilidad: ${product.disponibilidad}.`;
      })
      .join("\n");

    return {
      message: `Encontré estas opciones que te pueden servir:\n${lines}\n\nSi quieres, abre una de ellas y te ayudo a comparar cuál se parece más a lo que necesitas.`,
      suggestions: buildProductSuggestions(snapshot.matchedProducts),
    };
  }

  if (snapshot.matchedCategories.length > 0) {
    return {
      message: `No vi un producto exacto todavía, pero sí una línea relacionada con tu búsqueda: ${snapshot.matchedCategories.join(", ")}. Te la puedo abrir para que filtres más rápido.`,
      suggestions: buildCategorySuggestions(snapshot.matchedCategories, division),
    };
  }

  return {
    message: `Todavía no encontré una coincidencia clara en el catálogo. Puedes probar con el nombre del producto, la categoría o una descripción más concreta. Las líneas principales de GEU son: ${snapshot.allCategories.join(", ")}.`,
    suggestions: buildCategorySuggestions(snapshot.allCategories, division),
  };
}
