import { revalidatePath } from "next/cache";
import { getSessionFromCookies } from "@/lib/auth";
import { confirmWompiPayment } from "@/lib/orders";

// Called from the checkout widget's result callback. That callback is not
// itself authenticated — this route re-fetches the transaction from Wompi's
// API (see confirmWompiPayment -> fetchWompiTransaction) before trusting
// anything, so a tampered client-side callback can't fake a payment.
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    const body = (await request.json()) as {
      orderId?: string;
      transactionId?: string;
    };

    if (!body.orderId || !body.transactionId) {
      return Response.json(
        { error: "Faltan datos para confirmar el pago." },
        { status: 400 },
      );
    }

    const order = await confirmWompiPayment(
      body.orderId,
      session?.userId ?? null,
      body.transactionId,
    );

    revalidatePath("/mi-cuenta");
    revalidatePath("/admin");

    return Response.json({
      order: {
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
      },
      message: "Pago confirmado correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "ORDER_NOT_FOUND"
        ? "No encontramos ese pedido."
        : error instanceof Error && error.message === "REFERENCE_MISMATCH"
          ? "La transacción no corresponde a este pedido."
          : error instanceof Error && error.message === "AMOUNT_MISMATCH"
            ? "El monto pagado no coincide con el del pedido."
            : error instanceof Error && error.message === "PAYMENT_DECLINED"
              ? "El pago fue rechazado. Intenta con otro medio de pago."
              : error instanceof Error && error.message === "PAYMENT_PENDING"
                ? "El pago quedó pendiente de confirmación por parte de Wompi."
                : error instanceof Error && error.message === "WOMPI_TRANSACTION_NOT_FOUND"
                  ? "No fue posible verificar la transacción con Wompi."
                  : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
                    ? "La base de datos no está configurada todavía."
                    : "No fue posible confirmar el pago.";

    const status =
      error instanceof Error && error.message === "ORDER_NOT_FOUND"
        ? 404
        : error instanceof Error &&
            (error.message === "REFERENCE_MISMATCH" || error.message === "AMOUNT_MISMATCH")
          ? 409
          : error instanceof Error && error.message === "PAYMENT_DECLINED"
            ? 402
            : error instanceof Error && error.message === "PAYMENT_PENDING"
              ? 202
              : 500;

    return Response.json({ error: message }, { status });
  }
}
