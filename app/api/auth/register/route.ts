import { registerUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/auth";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";

function normalizeDivision(value: unknown): DivisionName | undefined {
  return DIVISIONS.includes(value as DivisionName) ? (value as DivisionName) : undefined;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName?: string;
      company?: string;
      email?: string;
      phone?: string;
      department?: string;
      city?: string;
      addressLine1?: string;
      addressLine2?: string;
      password?: string;
      confirmPassword?: string;
      division?: string;
    };

    const fullName = body.fullName?.trim() || "";
    const email = body.email?.trim() || "";
    const department = body.department?.trim() || "";
    const city = body.city?.trim() || "";
    const addressLine1 = body.addressLine1?.trim() || "";
    const password = body.password || "";
    const confirmPassword = body.confirmPassword || "";

    if (!fullName || !email || !department || !city || !addressLine1 || !password || !confirmPassword) {
      return Response.json(
        { error: "Completa todos los campos obligatorios." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return Response.json(
        { error: "Las contraseñas no coinciden." },
        { status: 400 },
      );
    }

    const division = normalizeDivision(body.division);

    const user = await registerUser({
      fullName,
      company: body.company,
      email,
      phone: body.phone,
      department,
      city,
      addressLine1,
      addressLine2: body.addressLine2,
      password,
      division,
    });

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      division,
    });

    return Response.json(
      {
        user,
        message: "Cuenta creada correctamente.",
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS"
        ? "Ya existe una cuenta registrada con ese correo."
        : error instanceof Error && error.message === "DATABASE_NOT_CONFIGURED"
          ? "La base de datos no está configurada todavía."
          : "No fue posible crear la cuenta.";

    return Response.json({ error: message }, { status: 500 });
  }
}
