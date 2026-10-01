import { requireAdminUser } from "@/lib/admin";
import { parseDateRangeParams } from "@/lib/date-range";
import { getDashboardMetrics, getSalesReport, type DashboardMetrics, type SalesReport } from "@/lib/orders";

function createEmptyMetrics(from: Date, to: Date): DashboardMetrics {
  return {
    from: from.toISOString(),
    to: to.toISOString(),
    revenue: 0,
    orders: 0,
    unitsSold: 0,
    averageTicket: 0,
    newCustomers: 0,
    customers: 0,
    topProduct: null,
    topCategory: null,
  };
}

function createEmptyReport(): SalesReport {
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      orders: 0,
      paidOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      productsSold: 0,
      grossRevenue: 0,
      paidRevenue: 0,
      averageOrderValue: 0,
      totalProducts: 0,
    },
    topProduct: null,
    topProducts: [],
    categories: [],
    priceRanges: [],
    recentOrders: [],
  };
}

function getRange(request: Request) {
  const range = parseDateRangeParams(request);
  if (range) return range;

  // Default to the current month.
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 1),
  };
}

export async function GET(request: Request) {
  const { from, to } = getRange(request);

  try {
    const admin = await requireAdminUser("dashboard");
    const [metrics, report] = await Promise.all([
      getDashboardMetrics(admin.division, from, to),
      getSalesReport(admin.division),
    ]);

    return Response.json({ metrics, report });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ metrics: createEmptyMetrics(from, to), report: createEmptyReport() });
    }

    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : 500;

    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "No tienes permisos para ver el panel."
          : "No fue posible cargar el panel.";

    return Response.json({ error: message }, { status });
  }
}
