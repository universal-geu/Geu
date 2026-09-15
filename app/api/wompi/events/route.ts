import { revalidatePath } from "next/cache";
import {
  normalizeWompiTransaction,
  verifyWompiEventChecksum,
  type WompiEventPayload,
} from "@/lib/wompi";
import { applyWompiTransactionByReference } from "@/lib/orders";

// Wompi's events webhook. Public by design (Wompi calls it directly, with
// no session) — the checksum below is the only thing standing between this
// endpoint and a forged "your order was paid" call, so it's checked before
// anything else touches the database.
export async function POST(request: Request) {
  let payload: WompiEventPayload;

  try {
    payload = (await request.json()) as WompiEventPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!verifyWompiEventChecksum(payload)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const transactionData = payload.data?.transaction as Record<string, unknown> | undefined;

  if (!transactionData) {
    return Response.json({ received: true });
  }

  try {
    const order = await applyWompiTransactionByReference(
      normalizeWompiTransaction(transactionData),
    );

    if (order) {
      revalidatePath("/mi-cuenta");
      revalidatePath("/admin");
    }
  } catch (error) {
    // Log and still ack — Wompi retries on non-2xx, which would just repeat
    // a permanently-failing case (e.g. the DB being unreachable) forever.
    console.error("Wompi webhook processing failed", error);
  }

  return Response.json({ received: true });
}
