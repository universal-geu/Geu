import { requireAdminUser } from "@/lib/admin";
import { getSalesReportOverview, type SalesReportOverview } from "@/lib/orders";

export async function GET() {
  try {
    await requireAdminUser();
    const overview = await getSalesReportOverview();

    return Response.json({ overview });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ overview: null satisfies SalesReportOverview | null });
    }

    const status = error instanceof Error && error.message === "UNAUTHORIZED" ? 401 : 500;
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : "No fue posible cargar el resumen de unidades de negocio.";

    return Response.json({ error: message }, { status });
  }
}
