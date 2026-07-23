import { authenticateUser } from "@/lib/users";
import { getDevAdminUserByEmail, setSessionCookie } from "@/lib/auth";
import { DIVISION_ADMIN_PASSWORD } from "@/lib/divisions";

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

    const expectedAdminPin = process.env.ADMIN_EXTRA_PIN?.trim() || "1234";
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
