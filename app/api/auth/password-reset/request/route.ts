import { requestPasswordReset } from "@/lib/password-reset";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Always answers the same way, whether or not the email has an account, so
// this can't be used to find out who is registered.
const GENERIC_MESSAGE =
  "Si ese correo tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Revisa tu bandeja de entrada y el spam.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() || "";

    if (!email) {
      return Response.json({ error: "Ingresa tu correo." }, { status: 400 });
    }

    const byIp = checkRateLimit(`password-reset:${getClientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 });
    const byEmail = checkRateLimit(`password-reset:${email}`, { limit: 3, windowMs: 60 * 60 * 1000 });
    if (!byIp.allowed || !byEmail.allowed) {
      return Response.json(
        { error: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
        { status: 429 },
      );
    }

    await requestPasswordReset(email);

    return Response.json({ message: GENERIC_MESSAGE });
  } catch {
    return Response.json(
      { error: "No fue posible enviar el enlace. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
