"use client";

import { useEffect } from "react";
import { useCart } from "../../components/cart-provider";

// The order that brought the shopper here was created from a snapshot of
// their cart (the server's own cart for a logged-in user, or the `items`
// sent along with the guest checkout request) — clear the local cart here,
// once the whole flow (including the demo payment step) is done, so the
// header badge and cart page stop showing items that were just paid for.
export default function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // Intentionally run only once on mount — `clearCart`'s identity churns
    // with the cart's own state, which would otherwise re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
