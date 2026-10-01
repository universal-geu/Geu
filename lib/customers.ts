import { prisma } from "@/lib/prisma";
import type { DivisionName } from "@/lib/divisions";
import type { ShippingStatus } from "@/lib/orders";

// "Purchase status" shown per customer in the admin Clientes view, derived
// from the customer's orders and cart (there's no stored status column).
export type CustomerPurchaseStatus =
  | "RECURRENT" // 2+ paid orders
  | "BUYER" // exactly 1 paid order
  | "PAYMENT_PENDING" // has orders but none paid yet (pending or failed)
  | "CART" // items left in the cart, never checked out
  | "NO_PURCHASES";

export type AdminCustomerOrder = {
  id: string;
  orderNumber: number;
  createdAt: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  shippingStatus: ShippingStatus;
  total: number;
  totalItems: number;
  items: Array<{ id: string; name: string; quantity: number; lineTotal: number }>;
};

export type AdminCustomer = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  company: string | null;
  department: string | null;
  city: string | null;
  active: boolean;
  createdAt: string;
  status: CustomerPurchaseStatus;
  paidOrdersCount: number;
  totalSpent: number;
  lastPurchaseAt: string | null;
  cartItemsCount: number;
  orders: AdminCustomerOrder[];
};

// Customers aren't tied to a unit (one account buys in every storefront),
// so every admin sees the full list — but orders, totals and status only
// count the orders that involve the admin's unit, mirroring getAllOrders.
export async function getAdminCustomers(division?: DivisionName): Promise<AdminCustomer[]> {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const users = await prisma.user.findMany({
    // Hide the synthetic load-test accounts (test-user-N@test.geu.local) so
    // they don't bury the real customers.
    where: { role: "CUSTOMER", NOT: { email: { endsWith: "@test.geu.local" } } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      company: true,
      department: true,
      city: true,
      active: true,
      createdAt: true,
      _count: { select: { cartItems: true } },
      orders: {
        where: division
          ? { items: { some: { OR: [{ division }, { ownerDivision: division }] } } }
          : undefined,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          createdAt: true,
          paymentStatus: true,
          shippingStatus: true,
          subtotal: true,
          shippingCost: true,
          totalItems: true,
          items: {
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, quantity: true, lineTotal: true },
          },
        },
      },
    },
  });

  return users.map((user) => {
    const paidOrders = user.orders.filter((order) => order.paymentStatus === "PAID");
    const cartItemsCount = user._count.cartItems;

    const status: CustomerPurchaseStatus =
      paidOrders.length >= 2
        ? "RECURRENT"
        : paidOrders.length === 1
          ? "BUYER"
          : user.orders.length > 0
            ? "PAYMENT_PENDING"
            : cartItemsCount > 0
              ? "CART"
              : "NO_PURCHASES";

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      department: user.department,
      city: user.city,
      active: user.active,
      createdAt: user.createdAt.toISOString(),
      status,
      paidOrdersCount: paidOrders.length,
      totalSpent: paidOrders.reduce((sum, order) => sum + order.subtotal + order.shippingCost, 0),
      lastPurchaseAt: paidOrders[0]?.createdAt.toISOString() ?? null,
      cartItemsCount,
      orders: user.orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        total: order.subtotal + order.shippingCost,
        totalItems: order.totalItems,
        items: order.items,
      })),
    };
  });
}
