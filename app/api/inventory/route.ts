import { getRecentInventoryMovements } from "@/lib/products";
import { requireAdminUser } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdminUser("inventory");
    const movements = await getRecentInventoryMovements();

    return Response.json({ movements });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ movements: [] });
    }

    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : "No fue posible cargar los movimientos de inventario.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : 500;

    return Response.json({ error: message }, { status });
  }
}
