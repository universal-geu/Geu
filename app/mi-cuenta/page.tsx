import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { getQuotesForUser } from "@/lib/quotes";
import { getUserById } from "@/lib/users";
import { getDivisionFromBrandParam } from "@/lib/divisions";
import AccountProfileForm from "./profile-form";

export const dynamic = "force-dynamic";

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
  const quotes = await getQuotesForUser(session.userId);
  const { brand } = await searchParams;
  const division = brand ? getDivisionFromBrandParam(brand) : user.division ?? "Cauchos";

  return <AccountProfileForm user={user} orders={orders} quotes={quotes} division={division} />;
}
