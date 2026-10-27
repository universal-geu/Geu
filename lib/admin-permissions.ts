import type { DivisionName } from "@/lib/divisions";

export const ADMIN_TOOL_KEYS = [
  "dashboard",
  "create",
  "edit",
  "inventory",
  "orders",
  "customers",
  "quotes",
  "categories",
  "reports",
  "images",
  "settings",
] as const;

export type AdminToolKey = (typeof ADMIN_TOOL_KEYS)[number];

export type AdminAccessLevel = "view" | "edit";

// Permission tokens stored in User.permissions:
//   "<tool>"       → ver y editar (also what older accounts have stored)
//   "<tool>:view"  → solo ver; the API rejects writes for that tool
//   "no:<extra>"   → hides one part of a view (amounts, charts...)
// An empty permissions array means unrestricted (full) access — this keeps
// the seeded division root admins working without needing to backfill data.
export function hasAdminPermission(
  permissions: string[],
  tool: AdminToolKey,
  level: AdminAccessLevel = "view",
): boolean {
  if (permissions.length === 0 || permissions.includes(tool)) return true;
  return level === "view" && permissions.includes(`${tool}:view`);
}

export function getAdminAccessLevel(
  permissions: string[],
  tool: AdminToolKey,
): AdminAccessLevel | null {
  if (hasAdminPermission(permissions, tool, "edit")) return "edit";
  return hasAdminPermission(permissions, tool, "view") ? "view" : null;
}

export const ADMIN_EXTRA_KEYS = [
  "dashboard.amounts",
  "reports.amounts",
  "reports.charts",
  "reports.recent",
] as const;

export type AdminExtraKey = (typeof ADMIN_EXTRA_KEYS)[number];

export function hasAdminExtra(permissions: string[], extra: AdminExtraKey): boolean {
  return !permissions.includes(`no:${extra}`);
}

// Innovation and GEU (the corporate/parent brand) have no products for
// sale, so their admin panels only need image, text/WhatsApp, and
// team-account management (plus quote requests for Innovation) — the rest
// (dashboard, product CRUD, orders, reports) has nothing to show.
const DIVISION_TOOL_RESTRICTIONS: Partial<Record<DivisionName, readonly AdminToolKey[]>> = {
  Innovation: ["images", "settings", "quotes"],
  GEU: ["images", "settings"],
};

export function isToolAllowedForDivision(
  division: DivisionName | null | undefined,
  tool: AdminToolKey,
): boolean {
  if (!division) return true;
  // Quotes come from Cauchos' evaluation form and from the GEU Structure
  // (Innovation) technical advisor; the other brands don't take requests.
  if (tool === "quotes" && division !== "Cauchos" && division !== "Innovation") return false;
  const allowed = DIVISION_TOOL_RESTRICTIONS[division];
  return !allowed || allowed.includes(tool);
}

type AdminToolOption = {
  label: string;
  description: string;
  // Levels offered in the user form. Tools with nothing to change are
  // view-only; "create" only makes sense with write access.
  levels: readonly AdminAccessLevel[];
  extras?: readonly { key: AdminExtraKey; label: string }[];
};

export const ADMIN_TOOL_OPTIONS: Record<AdminToolKey, AdminToolOption> = {
  dashboard: {
    label: "Dashboard",
    description: "Resumen de ventas, destacados y alertas.",
    levels: ["view"],
    extras: [{ key: "dashboard.amounts", label: "Ver montos en dinero" }],
  },
  create: {
    label: "Crear productos",
    description: "Publicar productos nuevos en el catálogo.",
    levels: ["edit"],
  },
  edit: {
    label: "Productos",
    description: "Consultar o modificar y eliminar productos existentes.",
    levels: ["view", "edit"],
  },
  inventory: {
    label: "Inventario",
    description: "Consultar existencias o ajustar el stock.",
    levels: ["view", "edit"],
  },
  orders: {
    label: "Pedidos",
    description: "Consultar pedidos o cambiar su estado y envío.",
    levels: ["view", "edit"],
  },
  customers: {
    label: "Clientes",
    description: "Cuentas de clientes y sus compras.",
    levels: ["view"],
  },
  quotes: {
    label: "Cotizaciones",
    description: "Consultar o responder y cambiar el estado de cotizaciones.",
    levels: ["view", "edit"],
  },
  categories: {
    label: "Categorías",
    description: "Consultar o crear, renombrar y ordenar categorías.",
    levels: ["view", "edit"],
  },
  reports: {
    label: "Informes",
    description: "Métricas de ventas por periodo.",
    levels: ["view"],
    extras: [
      { key: "reports.amounts", label: "Ver montos en dinero" },
      { key: "reports.charts", label: "Ver gráficas y rankings" },
      { key: "reports.recent", label: "Ver pedidos recientes" },
    ],
  },
  images: {
    label: "Imágenes",
    description: "Consultar o cambiar las imágenes del sitio.",
    levels: ["view", "edit"],
  },
  settings: {
    label: "Textos y ajustes",
    description: "Textos, colores, WhatsApp, modo de venta y mascota.",
    levels: ["view", "edit"],
  },
};

// Only accounts with unrestricted access (empty permissions) can create and
// manage team users — otherwise a team member could grant themselves more.
export function canManageAdminUsers(permissions: string[]): boolean {
  return permissions.length === 0;
}

// Normalizes what the user form sends: drops unknown tokens, tools the
// division doesn't have and levels the tool doesn't offer.
export function sanitizeAdminPermissions(
  division: DivisionName,
  permissions: unknown,
): string[] {
  if (!Array.isArray(permissions)) return [];
  const tools = ADMIN_TOOL_KEYS.filter((tool) => isToolAllowedForDivision(division, tool));
  const result: string[] = [];

  for (const tool of tools) {
    const { levels, extras = [] } = ADMIN_TOOL_OPTIONS[tool];
    const level = permissions.includes(tool)
      ? "edit"
      : permissions.includes(`${tool}:view`)
        ? "view"
        : null;
    // Never upgrade: an unsupported "edit" drops to "view", an unsupported
    // "view" (e.g. "create:view") grants nothing.
    const allowed = !level
      ? null
      : levels.includes(level)
        ? level
        : level === "edit" && levels.includes("view")
          ? "view"
          : null;
    if (!allowed) continue;
    result.push(allowed === "edit" ? tool : `${tool}:view`);
    for (const extra of extras) {
      if (permissions.includes(`no:${extra.key}`)) result.push(`no:${extra.key}`);
    }
  }

  return result;
}

// True when the list grants at least one tool (restriction tokens alone don't count).
export function grantsAnyAdminTool(permissions: string[]): boolean {
  return permissions.some((token) => !token.startsWith("no:"));
}
