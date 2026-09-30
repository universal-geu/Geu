import {
  adjustProductInventory,
  getProductDivision,
  updateProductMinimumStock,
} from "@/lib/products";
import { requireAdminUser } from "@/lib/admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await requireAdminUser("inventory");
    const { slug } = await context.params;
    const existingDivision = await getProductDivision(slug);

    if (existingDivision && existingDivision !== admin.division) {
      return Response.json({ error: "No autorizado." }, { status: 403 });
    }

    const body = (await request.json()) as {
      quantity?: number;
      note?: string;
      minimumStock?: number;
    };

    // Either field alone is a valid request (the inventory modal may change
    // just the minimum, just the stock, or both).
    const hasMinimum = body.minimumStock !== undefined && body.minimumStock !== null;
    const quantity = Number(body.quantity || 0);

    let product = hasMinimum
      ? await updateProductMinimumStock(slug, Number(body.minimumStock))
      : null;
    if (quantity !== 0 || !hasMinimum) {
      product = await adjustProductInventory(slug, quantity, body.note);
    }

    return Response.json({ product });
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : error instanceof Error && error.message === "PRODUCT_NOT_FOUND"
            ? "No encontramos ese producto."
            : error instanceof Error && error.message === "INVALID_QUANTITY"
              ? "Indica una cantidad distinta de cero."
              : error instanceof Error && error.message === "INSUFFICIENT_STOCK"
                ? "No puedes dejar el stock por debajo de cero."
                : "No fue posible ajustar el inventario.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : error instanceof Error &&
            (error.message === "INVALID_QUANTITY" ||
              error.message === "INSUFFICIENT_STOCK")
          ? 400
          : 500;

    return Response.json({ error: message }, { status });
  }
}
