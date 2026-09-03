import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_COOKIE = "geu_preview_access";

// Rutas que siempre deben estar disponibles (la propia puerta de acceso).
const ALWAYS_ALLOWED = new Set<string>(["/proximamente", "/api/acceso"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ALWAYS_ALLOWED.has(pathname)) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === "granted";
  if (hasAccess) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/proximamente";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Ejecuta el proxy en todo salvo los assets internos de Next y los archivos
  // con extensión (imágenes, videos, modelos 3D, etc.).
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.[\\w]+$).*)"],
};
