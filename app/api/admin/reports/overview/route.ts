import { requireMasterAdmin } from "@/lib/admin";
import { getSalesReportOverview, type SalesReportOverview } from "@/lib/orders";

export async function GET() {
  try {
    await requireMasterAdmin();
    const overview = await getSalesReportOverview();

    return Response.json({ overview });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ overview: null satisfies SalesReportOverview | null });
    }

    const code = error instanceof Error ? error.message : "";
    const status = code === "UNAUTHORIZED" ? 401 : code === "FORBIDDEN" ? 403 : 500;
    const message =
      code === "UNAUTHORIZED"
        ? "No autorizado."
        : code === "FORBIDDEN"
          ? "No tienes permisos para ver los informes generales."
          : "No fue posible cargar el resumen de unidades de negocio.";

    return Response.json({ error: message }, { status });
  }
}
