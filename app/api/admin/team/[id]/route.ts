import { requireAdminUser } from "@/lib/admin";
import { deleteAdminTeamAccount, getUserById, updateAdminTeamAccount } from "@/lib/users";
import { sanitizePermissions } from "@/lib/admin-permissions";
import { DIVISION_ADMIN_EMAILS } from "@/lib/divisions";

function errorResponse(error: unknown) {
  const message =
    error instanceof Error && error.message === "ACCOUNT_NOT_FOUND"
      ? "No encontramos esa cuenta en tu división."
      : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
        ? "La base de datos no está configurada todavía."
        : error instanceof Error && error.message === "PERMISSIONS_REQUIRED"
          ? "Selecciona al menos una herramienta para esta cuenta."
          : error instanceof Error &&
              (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
            ? "No autorizado."
            : "No fue posible actualizar la cuenta.";

  const status =
    error instanceof Error &&
    (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
      ? 401
      : error instanceof Error && error.message === "ACCOUNT_NOT_FOUND"
        ? 404
        : error instanceof Error && error.message === "PERMISSIONS_REQUIRED"
          ? 400
          : 500;

  return Response.json({ error: message }, { status });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser("accounts");
    const { id } = await params;

    const body = (await request.json()) as {
      permissions?: unknown;
      active?: boolean;
      newPassword?: string;
    };

    if (id === admin.id && body.active === false) {
      return Response.json(
        { error: "No puedes desactivar tu propia cuenta." },
        { status: 400 },
      );
    }

    if (body.active === false) {
      const target = await getUserById(id);
      if (target && target.email === DIVISION_ADMIN_EMAILS[admin.division]) {
        return Response.json(
          { error: "No puedes desactivar la cuenta principal de la división." },
          { status: 400 },
        );
      }
    }

    const account = await updateAdminTeamAccount(id, admin.division, {
      permissions: body.permissions !== undefined ? sanitizePermissions(body.permissions) : undefined,
      active: body.active,
      newPassword: body.newPassword,
    });

    return Response.json({ account, message: "Cuenta actualizada correctamente." });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminUser("accounts");
    const { id } = await params;

    if (id === admin.id) {
      return Response.json(
        { error: "No puedes eliminar tu propia cuenta." },
        { status: 400 },
      );
    }

    const target = await getUserById(id);
    if (target && target.email === DIVISION_ADMIN_EMAILS[admin.division]) {
      return Response.json(
        { error: "No puedes eliminar la cuenta principal de la división." },
        { status: 400 },
      );
    }

    await deleteAdminTeamAccount(id, admin.division);

    return new Response(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
