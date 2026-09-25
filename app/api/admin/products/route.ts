import { getProductsFull } from "@/lib/products";
import { requireAdminUser } from "@/lib/admin";

// The admin edit form needs every field (specs, gallery, variants) that the
// public /api/products deliberately leaves out to keep the storefront's
// payload light — this route is where the admin panel gets that full data,
// fetched once when it mounts rather than on every storefront page load.
export async function GET() {
  try {
    await requireAdminUser();
    const products = await getProductsFull();
    return Response.json({ products });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ products: [] });
    }

    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : "No fue posible cargar el catálogo completo.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : 500;

    return Response.json({ error: message }, { status });
  }
}
