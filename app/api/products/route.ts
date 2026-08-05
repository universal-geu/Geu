import { createProduct, getProducts } from "@/lib/products";
import { requireAdminUser } from "@/lib/admin";

export async function GET() {
  const products = await getProducts();
  return Response.json({ products });
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser("create");
    const body = await request.json();
    const product = await createProduct({ ...body, division: admin.division });

    return Response.json({ product }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? "No autorizado."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "Configura Supabase antes de crear productos desde el panel."
          : error instanceof Error && error.message === "DUPLICATE_SLUG"
            ? "Ya existe un producto con ese nombre/slug."
            : error instanceof Error && error.message === "DUPLICATE_SKU"
              ? "Ya existe un producto con ese SKU."
              : error instanceof Error && error.message === "DUPLICATE_VARIANT_SKU"
                ? "Ya existe una variante con ese SKU."
                : "No fue posible guardar el producto.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : 500;

    return Response.json({ error: message }, { status });
  }
}
