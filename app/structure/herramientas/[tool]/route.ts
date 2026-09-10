import { readFile } from "node:fs/promises";
import path from "node:path";

// Herramientas HTML autónomas de GEU Structure. Cada una es un documento
// completo (CSS/JS inline, sin dependencias), servido tal cual con una barra
// "volver" inyectada. Viven en public/ para que Vercel las incluya en el deploy.
const TOOLS: Record<string, string> = {
  "asesor-tecnico": "asesor-tecnico.html",
  "asesor-tecnico-carrito": "asesor-tecnico-carrito.html",
  "configurador-m24": "configurador-m24.html",
  "simulador-inversion": "simulador-inversion.html",
  "como-funciona": "como-funciona.html",
};

const BACK_BAR =
  '<a href="/structure" style="display:flex;align-items:center;gap:8px;' +
  "background:#050505;color:#fff;font:600 12px/1 ui-sans-serif,system-ui,Arial;" +
  "text-decoration:none;padding:12px 18px;letter-spacing:.04em;" +
  'text-transform:uppercase;border-bottom:2px solid #0498b4">&larr;&nbsp;GEU Structure</a>';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tool: string }> },
) {
  const { tool } = await params;
  const file = TOOLS[tool];
  if (!file) {
    return new Response("Herramienta no encontrada", { status: 404 });
  }

  let html: string;
  try {
    html = await readFile(
      path.join(process.cwd(), "public", "structure-tools", file),
      "utf8",
    );
  } catch {
    return new Response("Herramienta no disponible", { status: 500 });
  }

  html = html.replace(/<body[^>]*>/i, (match) => `${match}\n${BACK_BAR}`);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
