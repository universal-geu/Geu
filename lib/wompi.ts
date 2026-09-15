import { createHash } from "crypto";

// Everything Wompi-specific and stateless lives here: reading the payment
// keys is present, the productive vs. sandbox environment for the ID the
// public key contains, the integrity signature the widget requires, the
// checksum that authenticates an events webhook call, and fetching a
// transaction back from Wompi's API. Order/DB-aware logic (looking up an
// order, deciding what to update) lives in lib/orders.ts instead.

export type WompiTransactionStatus =
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR"
  | "PENDING";

export type WompiTransaction = {
  id: string;
  status: WompiTransactionStatus;
  reference: string;
  amountInCents: number;
  currency: string;
};

// Real payments only turn on once both keys are set — until then, checkout
// keeps using the existing "pago demo" code flow untouched.
export function isWompiConfigured() {
  return Boolean(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_INTEGRITY_SECRET);
}

export function getWompiPublicKey() {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  if (!publicKey) {
    throw new Error("WOMPI_NOT_CONFIGURED");
  }
  return publicKey;
}

// Wompi encodes the environment in the public key's prefix
// (pub_test_... vs pub_prod_...) rather than a separate setting.
function getWompiApiBaseUrl(publicKey: string) {
  return publicKey.startsWith("pub_prod_")
    ? "https://production.wompi.co/v1"
    : "https://sandbox.wompi.co/v1";
}

// The signature Wompi's checkout widget requires to trust the amount/
// reference/currency weren't tampered with client-side. Formula per
// Wompi's docs: sha256(reference + amountInCents + currency + secret).
export function computeIntegritySignature({
  reference,
  amountInCents,
  currency,
}: {
  reference: string;
  amountInCents: number;
  currency: string;
}) {
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!integritySecret) {
    throw new Error("WOMPI_NOT_CONFIGURED");
  }

  return createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${integritySecret}`)
    .digest("hex");
}

function getNestedValue(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined,
      source,
    );
}

export type WompiEventPayload = {
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
};

// Authenticates an incoming events webhook call — never trust a payload
// from this endpoint without this check, since anyone can POST to it.
// Formula per Wompi's docs: sha256(concat(properties values in order) +
// timestamp + events secret).
export function verifyWompiEventChecksum(payload: WompiEventPayload) {
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) return false;

  const { properties, checksum } = payload.signature || {};
  if (!Array.isArray(properties) || !checksum) return false;

  const concatenatedValues = properties
    .map((path) => {
      const value = getNestedValue(payload.data, path);
      return value == null ? "" : String(value);
    })
    .join("");

  const expected = createHash("sha256")
    .update(`${concatenatedValues}${payload.timestamp}${eventsSecret}`)
    .digest("hex");

  return expected.toLowerCase() === checksum.toLowerCase();
}

// A webhook event's `data.transaction` and the GET /transactions/{id}
// response share this same shape.
export function normalizeWompiTransaction(raw: Record<string, unknown>): WompiTransaction {
  return {
    id: String(raw.id),
    status: raw.status as WompiTransactionStatus,
    reference: String(raw.reference),
    amountInCents: Number(raw.amount_in_cents),
    currency: String(raw.currency),
  };
}

// Always re-fetches the transaction from Wompi's API rather than trusting a
// client-supplied status — this is what makes the widget callback path safe
// to act on (the callback itself is not authenticated).
export async function fetchWompiTransaction(transactionId: string): Promise<WompiTransaction> {
  const publicKey = getWompiPublicKey();
  const baseUrl = getWompiApiBaseUrl(publicKey);

  const response = await fetch(`${baseUrl}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${publicKey}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("WOMPI_TRANSACTION_NOT_FOUND");
  }

  const payload = (await response.json()) as { data?: Record<string, unknown> };
  if (!payload.data) {
    throw new Error("WOMPI_TRANSACTION_NOT_FOUND");
  }

  return normalizeWompiTransaction(payload.data);
}
