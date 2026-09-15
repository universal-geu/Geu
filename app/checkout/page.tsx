import { redirect } from "next/navigation";
import CheckoutForm from "./checkout-form";
import GuestCheckout from "./guest-checkout";
import { getSessionFromCookies } from "@/lib/auth";
import { getCartItemsForUser, parseCartItemId } from "@/lib/cart";
import { getUserById } from "@/lib/users";
import { getCauchosSalesMode } from "@/lib/site-settings";
import { getProductDivisionInfoBySlugs } from "@/lib/products";
import { getDivisionFromBrandParam } from "@/lib/divisions";
import { productSellsInDivision } from "@/lib/product-category-views";
import { isWompiConfigured } from "@/lib/wompi";

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
  const division = getDivisionFromBrandParam(brand);
  const cartRedirect = brand ? `/carrito?brand=${brand}` : "/carrito";
  const wompiEnabled = isWompiConfigured();

  const session = await getSessionFromCookies();

  // No session: let the shopper check out as a guest instead of forcing a
  // login. The guest's cart lives only in their browser's localStorage, so
  // it's read client-side there instead of from the DB.
  if (!session) {
    return <GuestCheckout division={division} brand={brand} wompiEnabled={wompiEnabled} />;
  }

  const user = await getUserById(session.userId);

  if (!user) {
    return <GuestCheckout division={division} brand={brand} wompiEnabled={wompiEnabled} />;
  }

  const cartItems = await getCartItemsForUser(user.id);

  if (cartItems.length === 0) {
    redirect(cartRedirect);
  }

  // Blocks checkout only for items that are Cauchos-only (not cross-listed
  // into the division being shopped via `?brand=`) — a product cross-listed
  // into this division is part of its real catalog and should check out
  // normally here. Checked against the cart's actual products (not just
  // trusting the query param) so a customer can't dodge the notice for a
  // truly Cauchos-only item just by changing `?brand=` in the URL.
  // `createOrderFromCart` re-enforces this server-side too.
  if ((await getCauchosSalesMode()) === "whatsapp") {
    const slugs = cartItems.map((item) => parseCartItemId(item.id).slug);
    const productDivisions = await getProductDivisionInfoBySlugs(slugs);

    const hasCauchosOnlyItem = productDivisions.some(
      (product) => product.division === "Cauchos" && !productSellsInDivision(product, division),
    );

    if (hasCauchosOnlyItem) {
      redirect(cartRedirect);
    }
  }

  const subtotal = cartItems.reduce(
    (total, item) => total + parsePriceValue(item.precio) * item.cantidad,
    0,
  );

  return (
    <CheckoutForm
      user={user}
      items={cartItems}
      subtotal={subtotal}
      division={division}
      brand={brand}
      wompiEnabled={wompiEnabled}
    />
  );
}
