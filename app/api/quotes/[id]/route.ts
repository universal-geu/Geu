import { requireAdminUser } from "@/lib/admin";
import { updateQuoteStatus } from "@/lib/quotes";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();

    const { id } = await params;
    const body = (await request.json()) as {
      status?: "NEW" | "CONTACTED" | "CLOSED";
    };

    if (!id || !body.status) {
      return Response.json({ error: "Cotización y estado son obligatorios." }, { status: 400 });
    }

    const quote = await updateQuoteStatus(id, body.status);

    return Response.json({ quote, message: "Cotización actualizada correctamente." });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : error instanceof Error && error.message === "QUOTE_NOT_FOUND"
            ? 404
            : 500;

    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "No tienes permisos para actualizar cotizaciones."
          : error instanceof Error && error.message === "QUOTE_NOT_FOUND"
            ? "No encontramos esa cotización."
            : "No fue posible actualizar la cotización.";

    return Response.json({ error: message }, { status });
  }
}
