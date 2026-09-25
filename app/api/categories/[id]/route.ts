import { requireAdminUser } from "@/lib/admin";
import { deleteCategory, getCategoryById, renameCategory } from "@/lib/categories";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser("categories");
    const { id } = await params;
    const body = (await request.json()) as { name?: string };

    const existing = await getCategoryById(id);
    if (!existing || existing.division !== admin.division) {
      return Response.json({ error: "No encontramos esa categoría." }, { status: 404 });
    }

    const category = await renameCategory(id, body.name ?? "");

    return Response.json({ category, message: "Categoría actualizada correctamente." });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "No tienes permisos para gestionar categorías."
          : error instanceof Error && error.message === "NAME_REQUIRED"
            ? "El nombre de la categoría es obligatorio."
            : error instanceof Error && error.message === "DUPLICATE_NAME"
              ? "Ya existe una categoría con ese nombre."
              : "No fue posible renombrar la categoría.";

    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : error instanceof Error && (error.message === "NAME_REQUIRED" || error.message === "DUPLICATE_NAME")
            ? 400
            : 500;

    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser("categories");
    const { id } = await params;

    const existing = await getCategoryById(id);
    if (!existing || existing.division !== admin.division) {
      return Response.json({ error: "No encontramos esa categoría." }, { status: 404 });
    }

    await deleteCategory(id);

    return Response.json({ message: "Categoría eliminada correctamente." });
  } catch (error) {
    const count = error instanceof Error ? (error as Error & { count?: number }).count : undefined;
    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "No tienes permisos para gestionar categorías."
          : error instanceof Error && error.message === "CATEGORY_IN_USE"
            ? `No puedes eliminarla: ${count ?? "varios"} producto(s) todavía usan esta categoría. Cámbialos de categoría primero.`
            : "No fue posible eliminar la categoría.";

    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : error instanceof Error && error.message === "CATEGORY_IN_USE"
            ? 409
            : 500;

    return Response.json({ error: message }, { status });
  }
}
