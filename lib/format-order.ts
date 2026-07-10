export function formatOrderCode(orderId: string) {
  return `#${orderId.slice(-8).toUpperCase()}`;
}
