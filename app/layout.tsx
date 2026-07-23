import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/cart-provider";
import { ProductsProvider } from "./components/products-provider";
import HeaderShell from "./components/header-shell";
import SupportChat from "./components/support-chat";
import WhatsAppFloatButton from "./components/whatsapp-float-button";
import { getProducts } from "@/lib/products";
import { getDevAdminUserById, getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getCartItemsForUser } from "@/lib/cart";
import { getWhatsAppNumber } from "@/lib/site-settings";

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
    "Consorcio empresarial GEU: Universal de Cauchos, GEU Import, GEU Innovation, GEU Energy y GEU Plastic.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialProducts = await getProducts();
  const whatsappNumber = await getWhatsAppNumber();
  const session = await getSessionFromCookies();
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
          <CartProvider
            key={cartProviderKey}
            initialItems={initialCartItems}
            currentUserId={currentUser?.id ?? null}
          >
            <HeaderShell
              currentUser={
                currentUser
                  ? { fullName: currentUser.fullName, role: currentUser.role }
                  : null
              }
            />
            {children}
            <SupportChat />
            <WhatsAppFloatButton whatsappNumber={whatsappNumber} />
          </CartProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
