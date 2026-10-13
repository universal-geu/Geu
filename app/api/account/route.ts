import { getSessionFromCookies, setSessionCookie } from "@/lib/auth";
import { getUserById, updateUserProfile } from "@/lib/users";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const session = await getSessionFromCookies();

    if (!session) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const user = await getUserById(session.userId);

    if (!user) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    return Response.json({ user });
  } catch {
    return Response.json(
      { error: "No fue posible cargar la cuenta." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionFromCookies();

    if (!session) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    // Caps guessing the current password from an open session.
    const rateLimit = checkRateLimit(`account-update:${session.userId}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return Response.json(
        { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = (await request.json()) as {
      fullName?: string;
      company?: string;
      email?: string;
      phone?: string;
      department?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      newPassword?: string;
      confirmPassword?: string;
      currentPassword?: string;
    };

    if (!body.fullName?.trim() || !body.email?.trim()) {
      return Response.json(
        { error: "Nombre completo y correo son obligatorios." },
        { status: 400 },
      );
    }

    if (body.newPassword) {
      if (body.newPassword.length < 8) {
        return Response.json(
          { error: "La nueva contraseña debe tener al menos 8 caracteres." },
          { status: 400 },
        );
      }

      if (body.newPassword !== body.confirmPassword) {
        return Response.json(
          { error: "Las nuevas contraseñas no coinciden." },
          { status: 400 },
        );
      }
    }

    const user = await updateUserProfile(session.userId, {
      fullName: body.fullName,
      company: body.company,
      email: body.email,
      phone: body.phone,
      department: body.department,
      city: body.city,
      addressLine1: body.addressLine1,
      addressLine2: body.addressLine2,
      newPassword: body.newPassword || undefined,
      currentPassword: body.currentPassword || undefined,
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      division: user.division ?? undefined,
    });

    return Response.json({
      user,
      message: "Cuenta actualizada correctamente.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS"
        ? "Ese correo ya está registrado por otra cuenta."
        : error instanceof Error && error.message === "CURRENT_PASSWORD_REQUIRED"
          ? "Escribe tu contraseña actual para cambiar la contraseña o el correo."
        : error instanceof Error && error.message === "INVALID_CURRENT_PASSWORD"
          ? "La contraseña actual no es correcta."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : "No fue posible actualizar la cuenta.";

    const status =
      error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS"
        ? 409
        : error instanceof Error && error.message === "CURRENT_PASSWORD_REQUIRED"
          ? 400
          : error instanceof Error && error.message === "INVALID_CURRENT_PASSWORD"
            ? 403
            : 500;

    return Response.json({ error: message }, { status });
  }
}
