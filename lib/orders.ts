import { prisma } from "@/lib/prisma";
import type { DivisionName } from "@/lib/divisions";
import { DIVISION_ADMIN_EMAILS, DIVISION_BRAND } from "@/lib/divisions";
import { emailLayout, sendEmail } from "@/lib/email";
import { formatOrderCode } from "@/lib/format-order";
import { calculateShippingCost } from "@/lib/shipping";

export { calculateShippingCost };

export type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2?: string;
  notes?: string;
};

export type ShippingStatus =
  | "PENDING"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type SalesReportProduct = {
  productId: string;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  orderCount: number;
  stock: number | null;
};

export type SalesReportCategory = {
  category: string;
  quantitySold: number;
  revenue: number;
};

export type SalesReport = {
  generatedAt: string;
  totals: {
    orders: number;
    paidOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    productsSold: number;
    grossRevenue: number;
    paidRevenue: number;
    averageOrderValue: number;
  };
  topProduct: SalesReportProduct | null;
  topProducts: SalesReportProduct[];
  categories: SalesReportCategory[];
  recentOrders: Array<{
    id: string;
    customerName: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    paymentStatus: "PENDING" | "PAID" | "FAILED";
    totalItems: number;
    subtotal: number;
    createdAt: Date;
  }>;
};

function parsePriceValue(price: string) {
  const numeric = Number(price.replace(/[^\d]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

export async function createOrderFromCart(userId: string, input: CheckoutInput) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const customerName = input.customerName.trim();
  const customerEmail = input.customerEmail.trim().toLowerCase();
  const customerPhone = input.customerPhone.trim();
  const company = input.company?.trim() || null;
  const department = input.department.trim();
  const city = input.city.trim();
  const addressLine1 = input.addressLine1.trim();
  const addressLine2 = input.addressLine2?.trim() || null;
  const notes = input.notes?.trim() || null;

  if (
    !customerName ||
    !customerEmail ||
    !customerPhone ||
    !department ||
    !city ||
    !addressLine1
  ) {
    throw new Error("INVALID_CHECKOUT");
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (cartItems.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const subtotal = cartItems.reduce(
    (total, item) => total + parsePriceValue(item.price) * item.quantity,
    0,
  );
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const shippingCost = calculateShippingCost(city);

  const order = await prisma.$transaction(async (tx) => {
    const productSlugs = cartItems.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: {
        slug: {
          in: productSlugs,
        },
      },
      select: {
        id: true,
        slug: true,
        stock: true,
        minimumStock: true,
        division: true,
      },
    });

    for (const item of cartItems) {
      const product = products.find((entry) => entry.slug === item.productId);

      if (!product || product.stock < item.quantity) {
        throw new Error("INSUFFICIENT_STOCK");
      }
    }

    const orderDivision: DivisionName = products[0]?.division ?? "Cauchos";

    const createdOrder = await tx.order.create({
      data: {
        userId,
        division: orderDivision,
        customerName,
        customerEmail,
        customerPhone,
        company,
        department,
        city,
        addressLine1,
        addressLine2,
        notes,
        subtotal,
        shippingCost,
        totalItems,
        items: {
          create: cartItems.map((item) => {
            const unitPrice = parsePriceValue(item.price);

            return {
              productId: item.productId,
              name: item.name,
              image: item.image,
              unitPrice,
              quantity: item.quantity,
              lineTotal: unitPrice * item.quantity,
            };
          }),
        },
      },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    for (const item of cartItems) {
      const product = products.find((entry) => entry.slug === item.productId);

      if (!product) {
        continue;
      }

      const nextStock = product.stock - item.quantity;

      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: nextStock,
          availability:
            nextStock <= 0
              ? "Agotado"
              : nextStock <= product.minimumStock
                ? "Disponible por pedido"
                : "Entrega inmediata",
          inventoryMovements: {
            create: {
              type: "ORDER_DEDUCTION",
              quantity: -item.quantity,
              stockAfter: nextStock,
              note: `Descuento automático por pedido ${createdOrder.id}`,
            },
          },
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { userId },
    });

    return createdOrder;
  });

  void sendOrderConfirmationEmails(order);

  return order;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

async function sendOrderConfirmationEmails(order: {
  id: string;
  division: DivisionName;
  customerName: string;
  customerEmail: string;
  subtotal: number;
  shippingCost: number;
  totalItems: number;
  items: Array<{ name: string; quantity: number; lineTotal: number }>;
}) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; color: #16384f; font-size: 14px;">${item.name} × ${item.quantity}</td>
          <td style="padding: 8px 0; text-align: right; color: #16384f; font-size: 14px; font-weight: 700;">${formatCurrency(item.lineTotal)}</td>
        </tr>`,
    )
    .join("");
  const grandTotal = order.subtotal + order.shippingCost;

  await sendEmail({
    to: order.customerEmail,
    subject: `Pedido ${formatOrderCode(order.id)} recibido`,
    html: emailLayout(
      "¡Gracias por tu pedido!",
      `<p style="color:#6e7379;font-size:14px;line-height:22px;">
        Hola ${order.customerName}, recibimos tu pedido <strong>${formatOrderCode(order.id)}</strong> y ya quedó guardado en tu cuenta.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">${itemsHtml}</table>
      <p style="margin-top:16px;font-size:14px;color:#6e7379;">Subtotal: ${formatCurrency(order.subtotal)}</p>
      <p style="margin-top:4px;font-size:14px;color:#6e7379;">Envío: ${formatCurrency(order.shippingCost)}</p>
      <p style="margin-top:8px;font-size:16px;font-weight:900;color:#16384f;">Total: ${formatCurrency(grandTotal)}</p>`,
      order.division,
    ),
  });

  await sendEmail({
    to: DIVISION_ADMIN_EMAILS[order.division],
    subject: `Nuevo pedido ${formatOrderCode(order.id)}`,
    html: emailLayout(
      "Nuevo pedido recibido",
      `<p style="color:#6e7379;font-size:14px;line-height:22px;">
        ${order.customerName} (${order.customerEmail}) hizo un pedido de ${order.totalItems} producto${order.totalItems === 1 ? "" : "s"} por ${formatCurrency(grandTotal)} (incluye envío de ${formatCurrency(order.shippingCost)}).
      </p>`,
      order.division,
    ),
  });
}

export async function getOrderDivision(orderId: string): Promise<DivisionName | null> {
  if (!prisma) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { division: true },
  });

  return order?.division ?? null;
}

export async function getOrdersForUser(userId: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  return await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getAllOrders(division?: DivisionName) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  return await prisma.order.findMany({
    where: division ? { division } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getSalesReport(division?: DivisionName): Promise<SalesReport> {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.product.findMany({
      select: {
        slug: true,
        category: true,
        stock: true,
        division: true,
      },
    }),
  ]);

  const productLookup = new Map(
    products.map((product) => [
      product.slug,
      {
        category: product.category,
        stock: product.stock,
        division: product.division,
      },
    ]),
  );
  const matchesDivision = (productSlug: string) =>
    !division || productLookup.get(productSlug)?.division === division;

  const productSales = new Map<string, SalesReportProduct>();
  const categorySales = new Map<string, SalesReportCategory>();
  const allActiveOrders = orders.filter((order) => order.status !== "CANCELLED");
  const activeOrders = allActiveOrders.filter((order) =>
    order.items.some((item) => matchesDivision(item.productId)),
  );
  const paidOrders = activeOrders.filter((order) => order.paymentStatus === "PAID");

  let grossRevenue = 0;
  let paidRevenue = 0;
  let productsSold = 0;

  for (const order of activeOrders) {
    const matchingItems = order.items.filter((item) => matchesDivision(item.productId));
    const orderRevenue = matchingItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const orderQuantity = matchingItems.reduce((sum, item) => sum + item.quantity, 0);

    grossRevenue += orderRevenue;
    productsSold += orderQuantity;
    if (order.paymentStatus === "PAID") {
      paidRevenue += orderRevenue;
    }

    for (const item of matchingItems) {
      const productMeta = productLookup.get(item.productId);
      const category = productMeta?.category || "Sin categoría";
      const currentProduct = productSales.get(item.productId) || {
        productId: item.productId,
        name: item.name,
        category,
        quantitySold: 0,
        revenue: 0,
        orderCount: 0,
        stock: productMeta?.stock ?? null,
      };

      currentProduct.quantitySold += item.quantity;
      currentProduct.revenue += item.lineTotal;
      currentProduct.orderCount += 1;
      productSales.set(item.productId, currentProduct);

      const currentCategory = categorySales.get(category) || {
        category,
        quantitySold: 0,
        revenue: 0,
      };
      currentCategory.quantitySold += item.quantity;
      currentCategory.revenue += item.lineTotal;
      categorySales.set(category, currentCategory);
    }
  }

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue)
    .slice(0, 5);
  const categories = Array.from(categorySales.values())
    .sort((a, b) => b.quantitySold - a.quantitySold || b.revenue - a.revenue)
    .slice(0, 6);
  const scopedOrders = division
    ? orders.filter((order) => order.items.some((item) => matchesDivision(item.productId)))
    : orders;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      orders: activeOrders.length,
      paidOrders: paidOrders.length,
      pendingOrders: activeOrders.filter((order) => order.paymentStatus === "PENDING")
        .length,
      cancelledOrders: orders.length - allActiveOrders.length,
      productsSold,
      grossRevenue,
      paidRevenue,
      averageOrderValue:
        activeOrders.length > 0 ? Math.round(grossRevenue / activeOrders.length) : 0,
    },
    topProduct: topProducts[0] || null,
    topProducts,
    categories,
    recentOrders: scopedOrders.slice(0, 5).map((order) => ({
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalItems: order.totalItems,
      subtotal: order.subtotal,
      createdAt: order.createdAt,
    })),
  };
}

export type DashboardMetrics = {
  todayRevenue: number;
  todayOrders: number;
  weekRevenue: number;
  weekOrders: number;
  monthRevenue: number;
  monthOrders: number;
  newCustomersThisMonth: number;
  customersThisMonth: number;
  topCategory: { category: string; quantitySold: number } | null;
};

export async function getDashboardMetrics(division?: DivisionName): Promise<DashboardMetrics> {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { items: true },
    }),
    prisma.product.findMany({
      select: { slug: true, division: true, category: true },
    }),
  ]);

  const productLookup = new Map(products.map((p) => [p.slug, p]));
  const matchesDivision = (productSlug: string) =>
    !division || productLookup.get(productSlug)?.division === division;

  let todayRevenue = 0;
  let weekRevenue = 0;
  let monthRevenue = 0;
  const todayOrderIds = new Set<string>();
  const weekOrderIds = new Set<string>();
  const monthOrderIds = new Set<string>();
  const monthCustomers = new Set<string>();
  const customerFirstOrder = new Map<string, Date>();
  const categoryQuantity = new Map<string, number>();

  for (const order of orders) {
    const matchingItems = order.items.filter((item) => matchesDivision(item.productId));
    if (matchingItems.length === 0) continue;

    const orderRevenue = matchingItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const email = order.customerEmail;
    const existingFirst = customerFirstOrder.get(email);
    if (!existingFirst || order.createdAt < existingFirst) {
      customerFirstOrder.set(email, order.createdAt);
    }

    if (order.createdAt >= startOfToday) {
      todayRevenue += orderRevenue;
      todayOrderIds.add(order.id);
    }
    if (order.createdAt >= startOfWeek) {
      weekRevenue += orderRevenue;
      weekOrderIds.add(order.id);
    }
    if (order.createdAt >= startOfMonth) {
      monthRevenue += orderRevenue;
      monthOrderIds.add(order.id);
      monthCustomers.add(email);

      for (const item of matchingItems) {
        const category = productLookup.get(item.productId)?.category || "Sin categoría";
        categoryQuantity.set(category, (categoryQuantity.get(category) || 0) + item.quantity);
      }
    }
  }

  const newCustomersThisMonth = Array.from(monthCustomers).filter((email) => {
    const firstOrderDate = customerFirstOrder.get(email);
    return firstOrderDate && firstOrderDate >= startOfMonth;
  }).length;

  const topCategoryEntry = Array.from(categoryQuantity.entries()).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return {
    todayRevenue,
    todayOrders: todayOrderIds.size,
    weekRevenue,
    weekOrders: weekOrderIds.size,
    monthRevenue,
    monthOrders: monthOrderIds.size,
    newCustomersThisMonth,
    customersThisMonth: monthCustomers.size,
    topCategory: topCategoryEntry
      ? { category: topCategoryEntry[0], quantitySold: topCategoryEntry[1] }
      : null,
  };
}

export async function updateOrderShipping(
  orderId: string,
  input: {
    shippingStatus: ShippingStatus;
    paymentStatus?: "PENDING" | "PAID" | "FAILED";
    carrier?: string;
    trackingNumber?: string;
    adminNotes?: string;
  },
  adminDivision?: DivisionName,
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const shippingStatus = input.shippingStatus;
  const paymentStatus = input.paymentStatus;
  const carrier = input.carrier?.trim() || null;
  const trackingNumber = input.trackingNumber?.trim() || null;
  const adminNotes = input.adminNotes?.trim() || null;

  if (!["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(shippingStatus)) {
    throw new Error("INVALID_SHIPPING_STATUS");
  }

  if (
    paymentStatus &&
    !["PENDING", "PAID", "FAILED"].includes(paymentStatus)
  ) {
    throw new Error("INVALID_PAYMENT_STATUS");
  }

  const currentOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      shippingStatus: true,
      customerName: true,
      customerEmail: true,
      division: true,
    },
  });

  if (!currentOrder) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (adminDivision && currentOrder.division !== adminDivision) {
    throw new Error("FORBIDDEN");
  }

  const nextPaymentStatus = paymentStatus || currentOrder.paymentStatus;
  const nextOrderStatus =
    shippingStatus === "CANCELLED"
      ? "CANCELLED"
      : nextPaymentStatus === "PAID"
        ? "PAID"
        : "PENDING";

  const shippedAt =
    shippingStatus === "SHIPPED" || shippingStatus === "DELIVERED"
      ? new Date()
      : null;
  const deliveredAt = shippingStatus === "DELIVERED" ? new Date() : null;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      shippingStatus,
      paymentStatus: nextPaymentStatus,
      status: nextOrderStatus,
      carrier,
      trackingNumber,
      adminNotes,
      shippedAt,
      deliveredAt,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (currentOrder.shippingStatus !== shippingStatus) {
    void sendShippingStatusEmail({
      orderId: updatedOrder.id,
      division: currentOrder.division,
      customerName: currentOrder.customerName,
      customerEmail: currentOrder.customerEmail,
      shippingStatus,
      carrier,
      trackingNumber,
    });
  }

  return updatedOrder;
}

const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  PENDING: "Pendiente de preparación",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

async function sendShippingStatusEmail({
  orderId,
  division,
  customerName,
  customerEmail,
  shippingStatus,
  carrier,
  trackingNumber,
}: {
  orderId: string;
  division: DivisionName;
  customerName: string;
  customerEmail: string;
  shippingStatus: ShippingStatus;
  carrier: string | null;
  trackingNumber: string | null;
}) {
  const label = SHIPPING_STATUS_LABELS[shippingStatus];
  const trackingHtml =
    shippingStatus === "SHIPPED" && (carrier || trackingNumber)
      ? `<p style="color:#6e7379;font-size:14px;line-height:22px;">
          ${carrier ? `Transportadora: <strong>${carrier}</strong>. ` : ""}
          ${trackingNumber ? `Número de guía: <strong>${trackingNumber}</strong>.` : ""}
        </p>`
      : "";

  await sendEmail({
    to: customerEmail,
    subject: `Tu pedido ${formatOrderCode(orderId)} cambió a: ${label}`,
    html: emailLayout(
      `Actualización de tu pedido`,
      `<p style="color:#6e7379;font-size:14px;line-height:22px;">
        Hola ${customerName}, tu pedido <strong>${formatOrderCode(orderId)}</strong> cambió de estado a
        <strong style="color:${DIVISION_BRAND[division].accent};">${label}</strong>.
      </p>
      ${trackingHtml}`,
      division,
    ),
  });
}

export async function confirmSimulatedOrderPayment(
  orderId: string,
  userId: string,
  paymentCode: string,
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const expectedPaymentCode =
    process.env.SIMULATED_PAYMENT_CODE?.trim() || "1234";

  if (paymentCode.trim() !== expectedPaymentCode) {
    throw new Error("INVALID_PAYMENT_CODE");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: "PAID",
      status: "PAID",
      shippingStatus:
        order.shippingStatus === "PENDING" ? "PREPARING" : order.shippingStatus,
      adminNotes:
        order.adminNotes ||
        "Pago demo confirmado con código interno de validación.",
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
