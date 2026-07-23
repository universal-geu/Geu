import { requireAdminUser } from "@/lib/admin";
import { createAdminTeamAccount, listAdminTeamAccounts } from "@/lib/users";
import { sanitizePermissions } from "@/lib/admin-permissions";

export async function GET() {
  try {
    const admin = await requireAdminUser("accounts");
    const accounts = await listAdminTeamAccounts(admin.division);

    return Response.json({ accounts });
  } catch (error) {
    if (error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED") {
      return Response.json({ accounts: [] });
    }

    const status =
      error instanceof Error && error.message === "UNAUTHORIZED"
        ? 401
        : error instanceof Error && error.message === "FORBIDDEN"
          ? 403
          : 500;

    return Response.json({ error: "No fue posible cargar las cuentas." }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser("accounts");

    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      permissions?: unknown;
    };

    if (!body.fullName?.trim() || !body.email?.trim() || !body.password?.trim()) {
      return Response.json(
        { error: "Nombre, correo y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    if (body.password.trim().length < 8) {
      return Response.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 },
      );
    }

    const account = await createAdminTeamAccount({
      fullName: body.fullName,
      email: body.email,
      password: body.password.trim(),
      division: admin.division,
      permissions: sanitizePermissions(body.permissions),
    });

    return Response.json(
      { account, message: "Cuenta creada correctamente." },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS"
        ? "Ese correo ya está registrado por otra cuenta."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : error instanceof Error && error.message === "PERMISSIONS_REQUIRED"
            ? "Selecciona al menos una herramienta para esta cuenta."
            : error instanceof Error && error.message === "INVALID_INPUT"
              ? "Revisa los datos de la cuenta."
              : error instanceof Error &&
                  (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
                ? "No autorizado."
                : "No fue posible crear la cuenta.";

    const status =
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
        ? 401
        : error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS"
          ? 409
          : error instanceof Error &&
              (error.message === "INVALID_INPUT" || error.message === "PERMISSIONS_REQUIRED")
            ? 400
            : 500;

    return Response.json({ error: message }, { status });
  }
}
