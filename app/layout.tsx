import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { CartProvider } from "./components/cart-provider";
import { ProductsProvider } from "./components/products-provider";
import { CategoriesProvider } from "./components/categories-provider";
import { SalesSettingsProvider } from "./components/sales-settings-provider";
import HeaderShell from "./components/header-shell";
import CartDrawer from "./components/cart-drawer";
import WhatsAppFloatButton from "./components/whatsapp-float-button";
import { getProducts } from "@/lib/products";
import { getAllCategories } from "@/lib/categories";
import { getDevAdminUserById, getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getCartItemsForUser } from "@/lib/cart";
import { getAllWhatsAppNumbers, getAllSalesModes } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GEU | Grupo Empresarial Universal",
  description:
    "Consorcio empresarial GEU: Universal de Cauchos, GEU Import, GEU Structure, GEU Energy y GEU Plastic.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // These six reads don't depend on one another, so running them
  // sequentially just adds up every one of their round trips to a remote DB.
  // Promise.all collapses that to the duration of the slowest one — this
  // runs on every request (force-dynamic, no shared layout across brands),
  // so it was on the critical path of every single page load.
  const [initialProducts, initialCategories, whatsappNumbers, salesModes, requestHeaders, session] =
    await Promise.all([
      getProducts(),
      getAllCategories(),
      getAllWhatsAppNumbers(),
      getAllSalesModes(),
      headers(),
      getSessionFromCookies(),
    ]);
  const host = requestHeaders.get("host");
  const siteOrigin = host ? `${host.startsWith("localhost") ? "http" : "https"}://${host}` : "";
  let currentUser = null;
  let initialCartItems: Awaited<ReturnType<typeof getCartItemsForUser>> = [];

  if (session) {
    try {
      currentUser = await getUserById(session.userId);
    } catch (error) {
      if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
        currentUser = getDevAdminUserById(session.userId) ?? null;
      } else {
        throw error;
      }
    }
  }

  if (currentUser) {
    try {
      initialCartItems = await getCartItemsForUser(currentUser.id);
    } catch (error) {
      if (
        !(error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED")
      ) {
        throw error;
      }
    }
  }
  const cartProviderKey = `${currentUser?.id ?? "guest"}:${initialCartItems
    .map((item) => `${item.id}:${item.cantidad}`)
    .join("|")}`;

  return (
    <html
      lang="es"
      className={`${orbitron.variable} ${rajdhani.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ProductsProvider initialProducts={initialProducts}>
          <CategoriesProvider initialCategories={initialCategories}>
            <SalesSettingsProvider salesModes={salesModes} whatsappNumbers={whatsappNumbers} siteOrigin={siteOrigin}>
              <CartProvider
                key={cartProviderKey}
                initialItems={initialCartItems}
                currentUserId={currentUser?.id ?? null}
              >
                <HeaderShell />
                {children}
                <CartDrawer />
                <WhatsAppFloatButton whatsappNumbers={whatsappNumbers} />
              </CartProvider>
            </SalesSettingsProvider>
          </CategoriesProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
