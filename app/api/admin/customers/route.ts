import { requireAdminUser } from "@/lib/admin";
import { getAdminCustomers } from "@/lib/customers";

export async function GET() {
  try {
    const admin = await requireAdminUser("customers");
    const customers = await getAdminCustomers(admin.division);

    return Response.json({ customers });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ customers: [] });
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
          ? "No tienes permisos para ver clientes."
          : "No fue posible cargar los clientes.";

    return Response.json({ error: message }, { status });
  }
}
