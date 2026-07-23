const BOGOTA_SHIPPING_COST = 10000;
const NATIONAL_SHIPPING_COST = 15000;

export function calculateShippingCost(city: string) {
  const normalized = city
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized === "bogota" ? BOGOTA_SHIPPING_COST : NATIONAL_SHIPPING_COST;
}
