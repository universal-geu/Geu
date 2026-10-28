import { requireAdminUser } from "@/lib/admin";
import { canEnterAdminDivision } from "@/lib/admin-permissions";
import { setSessionCookie } from "@/lib/auth";
import { DIVISIONS, DIVISION_ADMIN_EMAILS, type DivisionName } from "@/lib/divisions";
import { getUserByEmail } from "@/lib/users";

// "Cambiar de unidad" del panel: un administrador con acceso completo (sin
// permisos restringidos) pasa al panel de otra unidad usando la sesión que ya
// tiene, sin volver a escribir contraseña ni PIN. Antes esto reenviaba una
// contraseña compartida desde el navegador. Un usuario del equipo solo pasa a
// las unidades que se le asignaron en "Usuarios" y sigue siendo él mismo.
export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    const body = (await request.json()) as { division?: string };
    const division = DIVISIONS.find((item) => item === body.division) as DivisionName | undefined;

    if (!division) {
      return Response.json({ error: "Unidad no válida." }, { status: 400 });
    }

    if (admin.permissions.length > 0) {
      if (!canEnterAdminDivision(admin.homeDivision, admin.permissions, division)) {
        return Response.json(
          { error: "Tu usuario no tiene acceso a esa unidad." },
          { status: 403 },
        );
      }

      await setSessionCookie({
        userId: admin.id,
        email: admin.email,
        role: "ADMIN",
        division,
      });

      return Response.json({ user: { id: admin.id, fullName: admin.fullName, role: "ADMIN", division } });
    }

    const target = await getUserByEmail(DIVISION_ADMIN_EMAILS[division]);

    if (!target || !target.active || target.role !== "ADMIN" || target.division !== division) {
      return Response.json(
        { error: "No encontramos el administrador de esa unidad." },
        { status: 404 },
      );
    }

    await setSessionCookie({
      userId: target.id,
      email: target.email,
      role: target.role,
      division,
    });

    return Response.json({ user: target });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "UNAUTHORIZED" || message === "FORBIDDEN") {
      return Response.json({ error: "Inicia sesión como administrador." }, { status: 401 });
    }

    return Response.json({ error: "No fue posible cambiar de unidad." }, { status: 500 });
  }
}
