import { cookies } from "next/headers";
import { requireAdminUser } from "@/lib/admin";
import { LIVE_TEXT_EDIT_COOKIE } from "@/lib/live-text-markers";

// Turns "Editar textos en tiempo real" on (POST) or off (DELETE) for this
// browser. The cookie only flags the mode; getSiteTexts still checks the
// admin session before marking anything editable.
export async function POST() {
  try {
    await requireAdminUser("settings");
    const cookieStore = await cookies();
    cookieStore.set(LIVE_TEXT_EDIT_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json(
      { error: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? "No tienes permisos para editar textos." : msg },
      { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 },
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(LIVE_TEXT_EDIT_COOKIE);
  return Response.json({ ok: true });
}
