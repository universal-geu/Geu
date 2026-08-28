export function parsePrecio(precio: string) {
  const numeric = Number(precio.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

// Cart item ids for products with a variant are stored as `${slug}::${sku}`.
export function resolveProductSlug(itemId: string) {
  return itemId.split("::")[0];
}

export const CART_ACTION_BUTTON_CLASS = {
  blue: "border-[#075ed8] text-[#075ed8] hover:bg-[#075ed8]",
  red: "border-[#e31313] text-[#e31313] hover:bg-[#e31313]",
  gray: "border-[#6b7280] text-[#6b7280] hover:bg-[#6b7280]",
  gold: "border-[#b38f00] text-[#b38f00] hover:bg-[#d4a900]",
} as const;

export const CART_PRIMARY_BUTTON_CLASS = {
  blue: "border-[#075ed8] bg-[#075ed8] hover:bg-white hover:text-[#075ed8]",
  red: "border-[#e31313] bg-[#e31313] hover:bg-white hover:text-[#e31313]",
  gray: "border-[#6b7280] bg-[#6b7280] hover:bg-white hover:text-[#6b7280]",
  gold: "border-[#d4a900] bg-[#d4a900] hover:bg-white hover:text-[#b38f00]",
} as const;
