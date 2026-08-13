export function formatOrderCode(orderNumber: number) {
  return `#${String(orderNumber).padStart(4, "0")}`;
}
