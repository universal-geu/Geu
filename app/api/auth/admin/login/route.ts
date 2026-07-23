import { authenticateUser } from "@/lib/users";
import { getDevAdminUserByEmail, setSessionCookie } from "@/lib/auth";
import { DIVISION_ADMIN_PASSWORD } from "@/lib/divisions";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim() || "";
    const password = body.password || "";

    if (!email || !password) {
      return Response.json(
        { error: "Ingresa tu correo y contraseña." },
        { status: 400 },
      );
    }

    let user: Awaited<ReturnType<typeof authenticateUser>>;

    try {
      user = await authenticateUser(email, password);
    } catch (error) {
      const devAdmin = getDevAdminUserByEmail(email);

      if (
        error instanceof Error &&
        error.message === "DATABASE_NOT_CONFIGURED" &&
        devAdmin &&
        password === DIVISION_ADMIN_PASSWORD
      ) {
        user = devAdmin;
      } else {
        throw error;
      }
    }

    if (user.role !== "ADMIN") {
      return Response.json(
        { error: "Esta cuenta no tiene permisos de administrador." },
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
      message: "Acceso administrador correcto.",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message === "INVALID_CREDENTIALS"
        ? "Correo o contraseña incorrectos."
        : error instanceof Error && error.message === "ACCOUNT_DISABLED"
          ? "Esta cuenta fue desactivada. Contacta al administrador de tu división."
          : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
            ? "La base de datos no está configurada todavía."
            : "No fue posible iniciar sesión como administrador.";

    const status = error instanceof Error && error.message === "ACCOUNT_DISABLED" ? 403 : 500;

    return Response.json({ error: message }, { status });
  }
}
