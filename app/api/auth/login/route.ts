import { authenticateUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      adminPin?: string;
    };

    const email = body.email?.trim() || "";
    const password = body.password || "";
    const adminPin = body.adminPin?.trim() || "";

    if (!email || !password) {
      return Response.json(
        { error: "Ingresa tu correo y contraseña." },
        { status: 400 },
      );
    }

    const rateLimitKey = `login:${getClientIp(request)}:${email.toLowerCase()}`;
    const rateLimit = checkRateLimit(rateLimitKey, { limit: 10, windowMs: 5 * 60 * 1000 });

    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Intenta de nuevo en unos minutos." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    // En producción el PIN solo existe en la variable ADMIN_EXTRA_PIN; sin ella
    // nadie puede entrar al panel. En local se acepta 1234 para desarrollo.
    const expectedAdminPin =
      process.env.ADMIN_EXTRA_PIN?.trim() || (process.env.NODE_ENV === "production" ? "" : "1234");
    const user = await authenticateUser(email, password);

    if (user.role === "ADMIN" && !adminPin) {
      return Response.json(
        {
          requiresAdminPin: true,
          user: {
            id: user.id,
            role: user.role,
          },
          message: "Confirma el PIN adicional para entrar al panel.",
        },
        { status: 202 },
      );
    }

    if (user.role === "ADMIN" && adminPin !== expectedAdminPin) {
      return Response.json(
        { error: "El PIN de administrador es incorrecto." },
        { status: 403 },
      );
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      division: user.division ?? undefined,
    });

    return Response.json({
      user,
      message: "Inicio de sesión correcto.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "INVALID_CREDENTIALS"
        ? "Correo o contraseña incorrectos."
        : error instanceof Error && error.message === "ACCOUNT_DISABLED"
          ? "Esta cuenta fue desactivada. Contacta al administrador de tu división."
          : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
            ? "La base de datos no está configurada todavía."
            : "No fue posible iniciar sesión.";

    const status = error instanceof Error && error.message === "ACCOUNT_DISABLED" ? 403 : 500;

    return Response.json({ error: message }, { status });
  }
}
