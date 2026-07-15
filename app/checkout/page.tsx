import { redirect } from "next/navigation";
import CheckoutForm from "./checkout-form";
import { getSessionFromCookies } from "@/lib/auth";
import { getCartItemsForUser } from "@/lib/cart";
import { getUserById } from "@/lib/users";

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

  const subtotal = cartItems.reduce(
    (total, item) => total + parsePriceValue(item.precio) * item.cantidad,
    0,
  );

  return <CheckoutForm user={user} items={cartItems} subtotal={subtotal} />;
}
