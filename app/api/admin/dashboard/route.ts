import { requireAdminUser } from "@/lib/admin";
import { getDashboardMetrics, getSalesReport, type DashboardMetrics, type SalesReport } from "@/lib/orders";

function createEmptyMetrics(): DashboardMetrics {
  return {
    todayRevenue: 0,
    todayOrders: 0,
    weekRevenue: 0,
    weekOrders: 0,
    monthRevenue: 0,
    monthOrders: 0,
    newCustomersThisMonth: 0,
    customersThisMonth: 0,
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
    },
    topProduct: null,
    topProducts: [],
    categories: [],
    recentOrders: [],
  };
}

export async function GET() {
  try {
    const admin = await requireAdminUser("dashboard");
    const [metrics, report] = await Promise.all([
      getDashboardMetrics(admin.division),
      getSalesReport(admin.division),
    ]);

    return Response.json({ metrics, report });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ metrics: createEmptyMetrics(), report: createEmptyReport() });
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
