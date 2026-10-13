import { requireAdminUser } from "@/lib/admin";
import { getSessionFromCookies } from "@/lib/auth";
import { createQuote, getQuotesForDivision } from "@/lib/quotes";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function normalizeDivision(value: unknown): DivisionName {
  return DIVISIONS.includes(value as DivisionName) ? (value as DivisionName) : "Cauchos";
}

// The body comes straight from the client: keep only strings (trimmed and
// capped) so a malformed payload can't crash the save or the email.
function text(value: unknown, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function textList(value: unknown) {
  return Array.isArray(value) ? value.map((item) => text(item, 200)).filter(Boolean).slice(0, 30) : [];
}

function textRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 40)
      .map(([key, item]) => [key.slice(0, 120), text(item)] as const)
      .filter(([, item]) => item),
  );
}

export async function GET() {
  try {
    const admin = await requireAdminUser("quotes");
    const quotes = await getQuotesForDivision(admin.division);

    return Response.json({ quotes });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ quotes: [] });
    }

    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : 500;

    const message =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? "No autorizado."
        : error instanceof Error && error.message === "FORBIDDEN"
          ? "No tienes permisos para ver las cotizaciones."
          : "No fue posible cargar las cotizaciones.";

    return Response.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit(`quote:${getClientIp(request)}`, {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Demasiadas solicitudes desde esta conexión. Intenta de nuevo más tarde." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const body = (await request.json()) as {
      fullName?: string;
      company?: string;
      nit?: string;
      phone?: string;
      division?: string;
      requestType?: string;
      productDetails?: string;
      process?: unknown;
      conditions?: unknown;
      quantityAndDeadline?: string;
      details?: unknown;
    };

    const session = await getSessionFromCookies();

    const quote = await createQuote({
      userId: session?.userId,
      fullName: text(body.fullName, 200),
      company: text(body.company, 200),
      nit: text(body.nit, 50),
      phone: text(body.phone, 50),
      division: normalizeDivision(body.division),
      requestType: text(body.requestType, 200),
      productDetails: text(body.productDetails),
      process: textList(body.process),
      conditions: textList(body.conditions),
      quantityAndDeadline: text(body.quantityAndDeadline, 500),
      details: textRecord(body.details),
    });

    return Response.json({
      quote: { id: quote.id },
      message: "Solicitud enviada correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "INVALID_QUOTE"
        ? "Completa los datos principales de la solicitud."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : "No fue posible enviar la solicitud.";

    const status =
      error instanceof Error && error.message === "INVALID_QUOTE" ? 400 : 500;

    return Response.json({ error: message }, { status });
  }
}
