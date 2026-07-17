import { getSessionFromCookies } from "@/lib/auth";
import { getQuotesForUser } from "@/lib/quotes";

export async function GET() {
  try {
    const session = await getSessionFromCookies();

    if (!session) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const quotes = await getQuotesForUser(session.userId);

    return Response.json({ quotes });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ quotes: [] });
    }

    return Response.json({ error: "No fue posible cargar tus solicitudes." }, { status: 500 });
  }
}
