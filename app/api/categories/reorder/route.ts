import { requireAdminUser } from "@/lib/admin";
import { reorderCategories } from "@/lib/categories";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser("categories");
    const body = (await request.json()) as { orderedIds?: string[] };

    if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return Response.json({ error: "Falta el orden de las categorías." }, { status: 400 });
    }

    await reorderCategories(admin.division, body.orderedIds);

    return Response.json({ message: "Orden actualizado correctamente." });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "No tienes permisos para gestionar categorías."
          : "No fue posible actualizar el orden.";

    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : 500;

    return Response.json({ error: message }, { status });
  }
}
