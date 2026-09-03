import { NextResponse } from "next/server";

const ACCESS_COOKIE = "geu_preview_access";
const ACCESS_CODE = process.env.GEU_ACCESS_CODE ?? "987654";

export async function POST(request: Request) {
  let code = "";

  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (code !== ACCESS_CODE) {
    return NextResponse.json({ error: "Código incorrecto." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
