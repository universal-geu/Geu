import { requireAdminUser } from "@/lib/admin";
import { getSessionFromCookies } from "@/lib/auth";
import { createQuote, getQuotesForDivision } from "@/lib/quotes";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";

function normalizeDivision(value: unknown): DivisionName {
  return DIVISIONS.includes(value as DivisionName) ? (value as DivisionName) : "Cauchos";
}

export async function GET() {
  try {
    const admin = await requireAdminUser();
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
  try {
    const body = (await request.json()) as {
      fullName?: string;
      company?: string;
      nit?: string;
      phone?: string;
      division?: string;
      requestType?: string;
      productDetails?: string;
      process?: string[];
      conditions?: string[];
      quantityAndDeadline?: string;
      details?: Record<string, string>;
    };

    const session = await getSessionFromCookies();

    const quote = await createQuote({
      userId: session?.userId,
      fullName: body.fullName || "",
      company: body.company || "",
      nit: body.nit || "",
      phone: body.phone || "",
      division: normalizeDivision(body.division),
      requestType: body.requestType || "",
      productDetails: body.productDetails || "",
      process: body.process || [],
      conditions: body.conditions || [],
      quantityAndDeadline: body.quantityAndDeadline || "",
      details: body.details,
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
