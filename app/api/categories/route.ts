import { requireAdminUser } from "@/lib/admin";
import { createCategory, getAllCategories, getCategoriesForDivision } from "@/lib/categories";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";

function normalizeDivision(value: unknown): DivisionName | null {
  return DIVISIONS.includes(value as DivisionName) ? (value as DivisionName) : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = normalizeDivision(searchParams.get("division"));

  const categories = division ? await getCategoriesForDivision(division) : await getAllCategories();

  return Response.json({ categories });
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser("categories");
    const body = (await request.json()) as { name?: string; color?: string; icon?: string };

    const category = await createCategory({
      division: admin.division,
      name: body.name ?? "",
      color: body.color,
      icon: body.icon,
    });

    return Response.json({ category }, { status: 201 });
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
              : "No fue posible crear la categoría.";

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
