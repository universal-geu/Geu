import { NextResponse, type NextRequest } from "next/server";
import { CATALOG_OMITTED_HEADER } from "@/lib/catalog-omitted";

// GEU Structure no vende productos, pero el layout raíz manda el catálogo
// completo de todas las unidades (~3,7 MB) en cada página. Aquí se marcan
// las páginas de Structure para que el layout lo omita; el proxy corre antes
// de los rewrites por host, así que en geustructure.com llega "/" + el host.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";
  const isStructure =
    pathname === "/structure" ||
    pathname.startsWith("/structure/") ||
    (pathname === "/" && /(^|\.)geustructure\.com(:\d+)?$/i.test(host));

  const headers = new Headers(request.headers);
  headers.delete(CATALOG_OMITTED_HEADER);
  if (isStructure) headers.set(CATALOG_OMITTED_HEADER, "1");

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/", "/structure", "/structure/:path*"],
};
