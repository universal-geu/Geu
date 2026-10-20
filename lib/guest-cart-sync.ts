// Client-side: right after signing in or registering, moves the guest cart
// (kept in localStorage) onto the new session's server cart, so pages that
// read the cart from the DB — like /checkout — see it immediately.
const GUEST_CART_STORAGE_KEY = "geu-cart";
const GUEST_CART_SYNC_KEY = "geu-cart-synced-user";

export async function syncGuestCartAfterLogin(userId: string) {
  if (typeof window === "undefined") return;

  const storedCart = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!storedCart) {
    window.sessionStorage.setItem(`${GUEST_CART_SYNC_KEY}:${userId}`, "done");
    return;
  }

  try {
    const items = JSON.parse(storedCart);

    if (!Array.isArray(items) || items.length === 0) {
      window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      window.sessionStorage.setItem(`${GUEST_CART_SYNC_KEY}:${userId}`, "done");
      return;
    }

    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      return;
    }

    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    window.sessionStorage.setItem(`${GUEST_CART_SYNC_KEY}:${userId}`, "done");
  } catch {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  }
}
