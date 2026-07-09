import { requireAdminUser } from "@/lib/admin";
import { getSalesReport, type SalesReport } from "@/lib/orders";

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
    const admin = await requireAdminUser();
    const report = await getSalesReport(admin.division);

    return Response.json({ report });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ report: createEmptyReport() });
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
          ? "No tienes permisos para ver informes."
          : "No fue posible cargar los informes.";

    return Response.json({ error: message }, { status });
  }
}
