// Split-shipping destinations as stored on Order.shippingDestinations.
// Safe to import from client components (no server-only dependencies), so
// checkout, admin and mi-cuenta all share this one shape.

export type ShippingDestinationItem = {
  // Same id the cart uses: product slug, or "slug::variantSku".
  cartItemId: string;
  name: string;
  quantity: number;
};

export type ShippingDestination = {
  label: string;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  shippingCost: number;
  items: ShippingDestinationItem[];
};

// What checkout submits for each destination; names and fees are filled in
// server-side from the real cart, never trusted from the client.
export type ShippingDestinationInput = {
  label?: string;
  department?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  items?: Array<{ cartItemId?: string; quantity?: number }>;
};

// Json columns come back as `unknown` — read defensively so a malformed or
// legacy value renders as "no destinations" instead of crashing a page.
export function readShippingDestinations(value: unknown): ShippingDestination[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const raw = entry as Record<string, unknown>;
    const items = Array.isArray(raw.items)
      ? raw.items.flatMap((item) => {
          if (!item || typeof item !== "object") return [];
          const rawItem = item as Record<string, unknown>;
          const quantity = Number(rawItem.quantity);
          if (!quantity) return [];
          return [
            {
              cartItemId: String(rawItem.cartItemId ?? ""),
              name: String(rawItem.name ?? ""),
              quantity,
            },
          ];
        })
      : [];

    return [
      {
        label: String(raw.label ?? ""),
        department: String(raw.department ?? ""),
        city: String(raw.city ?? ""),
        addressLine1: String(raw.addressLine1 ?? ""),
        addressLine2: raw.addressLine2 ? String(raw.addressLine2) : null,
        shippingCost: Number(raw.shippingCost) || 0,
        items,
      },
    ];
  });
}

export function formatShippingDestinationAddress(destination: ShippingDestination) {
  return [
    `${destination.department}, ${destination.city}`,
    destination.addressLine1,
    destination.addressLine2,
  ]
    .filter(Boolean)
    .join(" · ");
}
