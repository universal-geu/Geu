import { getSessionFromCookies } from "@/lib/auth";
import { createWompiCheckoutSignature } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    const body = (await request.json()) as { orderId?: string };

    if (!body.orderId) {
      return Response.json(
        { error: "Falta el identificador del pedido." },
        { status: 400 },
      );
    }

    const checkout = await createWompiCheckoutSignature(
      body.orderId,
      session?.userId ?? null,
    );

    return Response.json({ checkout });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "WOMPI_NOT_CONFIGURED"
        ? "Wompi no está configurado todavía."
        : error instanceof Error && error.message === "ORDER_NOT_FOUND"
          ? "No encontramos ese pedido."
          : error instanceof Error && error.message === "ORDER_ALREADY_PAID"
            ? "Este pedido ya fue pagado."
            : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
              ? "La base de datos no está configurada todavía."
              : "No fue posible iniciar el pago con Wompi.";

    const status =
      error instanceof Error && error.message === "WOMPI_NOT_CONFIGURED"
        ? 503
        : error instanceof Error && error.message === "ORDER_NOT_FOUND"
          ? 404
          : error instanceof Error && error.message === "ORDER_ALREADY_PAID"
            ? 409
            : 500;

    return Response.json({ error: message }, { status });
  }
}
