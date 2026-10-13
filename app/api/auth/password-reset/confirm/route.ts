import { setSessionCookie } from "@/lib/auth";
import type { DivisionName } from "@/lib/divisions";
import { resetPasswordWithToken } from "@/lib/password-reset";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      token?: string;
      password?: string;
      confirmPassword?: string;
    };

    const token = body.token || "";
    const password = body.password || "";

    if (!token) {
      return Response.json({ error: "El enlace no es válido." }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 },
      );
    }

    if (password !== body.confirmPassword) {
      return Response.json({ error: "Las contraseñas no coinciden." }, { status: 400 });
    }

    const user = await resetPasswordWithToken(token, password);

    // The link proved access to the inbox, so sign them straight in.
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      role: user.role,
      division: (user.division as DivisionName | null) ?? undefined,
    });

    return Response.json({ message: "Tu contraseña quedó actualizada." });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_RESET_TOKEN") {
      return Response.json(
        { error: "El enlace venció o ya se usó. Pide uno nuevo." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "No fue posible actualizar la contraseña." },
      { status: 500 },
    );
  }
}
