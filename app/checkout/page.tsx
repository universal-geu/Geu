import { redirect } from "next/navigation";
import CheckoutForm from "./checkout-form";
import { getSessionFromCookies } from "@/lib/auth";
import { getCartItemsForUser, parseCartItemId } from "@/lib/cart";
import { getUserById } from "@/lib/users";
import { getCauchosSalesMode } from "@/lib/site-settings";
import { getProductDivisionsBySlugs } from "@/lib/products";

function parsePriceValue(price: string) {
  const numeric = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const loginRedirect = brand ? `/login?next=/checkout&brand=${brand}` : "/login?next=/checkout";
  const cartRedirect = brand ? `/carrito?brand=${brand}` : "/carrito";

  const session = await getSessionFromCookies();

  if (!session) {
    redirect(loginRedirect);
  }

  const user = await getUserById(session.userId);

  if (!user) {
    redirect(loginRedirect);
  }

  const cartItems = await getCartItemsForUser(user.id);

  if (cartItems.length === 0) {
    redirect(cartRedirect);
  }

  // Checked against the cart's actual products (not the `?brand=` query
  // param) so a customer can't reach checkout for Cauchos items just by
  // navigating with a different brand in the URL while WhatsApp-only mode
  // is active. `createOrderFromCart` re-enforces this server-side too.
  if ((await getCauchosSalesMode()) === "whatsapp") {
    const slugs = cartItems.map((item) => parseCartItemId(item.id).slug);
    const divisions = await getProductDivisionsBySlugs(slugs);

    if (divisions.includes("Cauchos")) {
      redirect(cartRedirect);
    }
  }

  const subtotal = cartItems.reduce(
    (total, item) => total + parsePriceValue(item.precio) * item.cantidad,
    0,
  );

  return <CheckoutForm user={user} items={cartItems} subtotal={subtotal} />;
}
