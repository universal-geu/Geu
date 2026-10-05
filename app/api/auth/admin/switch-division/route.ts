import { requireAdminUser } from "@/lib/admin";
import { setSessionCookie } from "@/lib/auth";
import { DIVISIONS, DIVISION_ADMIN_EMAILS, type DivisionName } from "@/lib/divisions";
import { getUserByEmail } from "@/lib/users";

// "Cambiar de unidad" del panel: un administrador con acceso completo (sin
// permisos restringidos) pasa al panel de otra unidad usando la sesión que ya
// tiene, sin volver a escribir contraseña ni PIN. Antes esto reenviaba una
// contraseña compartida desde el navegador.
export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();

    if ("permissions" in admin && admin.permissions.length > 0) {
      return Response.json(
        { error: "Tu usuario solo tiene acceso a su propia unidad." },
        { status: 403 },
      );
    }

    const body = (await request.json()) as { division?: string };
    const division = DIVISIONS.find((item) => item === body.division) as DivisionName | undefined;

    if (!division) {
      return Response.json({ error: "Unidad no válida." }, { status: 400 });
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
