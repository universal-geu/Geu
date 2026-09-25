import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { getQuotesForUser } from "@/lib/quotes";
import { getUserById } from "@/lib/users";
import { getDivisionFromBrandParam, type DivisionName } from "@/lib/divisions";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import AccountProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

const ORDERS_BANNER_KEY: Partial<Record<DivisionName, string>> = {
  Cauchos: "mi-cuenta-banner",
  Import: "import-mi-cuenta-banner",
  Energy: "energy-mi-cuenta-banner",
  Plastic: "plastic-mi-cuenta-banner",
};

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.userId);

  if (!user) {
    redirect("/login");
  }

  const orders = await getOrdersForUser(session.userId);
  const rawQuotes = await getQuotesForUser(session.userId);
  const quotes = rawQuotes.map((quote) => ({ ...quote, details: normalizeQuoteDetails(quote.details) }));
  const { brand } = await searchParams;
  const division = brand ? getDivisionFromBrandParam(brand) : user.division ?? "Cauchos";

  const bannerKey = ORDERS_BANNER_KEY[division];
  const ordersBannerSrc = bannerKey ? resolveImage(bannerKey, await getSiteImages()) : null;

  return (
    <AccountProfileForm
      user={user}
      orders={orders}
      quotes={quotes}
      division={division}
      ordersBannerSrc={ordersBannerSrc}
    />
  );
}

function normalizeQuoteDetails(details: unknown): Record<string, string> | null {
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;

  return Object.fromEntries(
    Object.entries(details as Record<string, unknown>).map(([key, value]) => [key, String(value ?? "")]),
  );
}
