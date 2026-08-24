import type { DivisionName } from "@/lib/divisions";

export const ADMIN_TOOL_KEYS = [
  "dashboard",
  "create",
  "edit",
  "inventory",
  "orders",
  "quotes",
  "reports",
  "images",
  "settings",
  "accounts",
] as const;

export type AdminToolKey = (typeof ADMIN_TOOL_KEYS)[number];

export const ADMIN_TOOL_LABELS: Record<AdminToolKey, string> = {
  dashboard: "Dashboard",
  create: "Crear",
  edit: "Editar",
  inventory: "Inventario",
  orders: "Pedidos",
  quotes: "Cotizaciones",
  reports: "Informes",
  images: "Imágenes",
  settings: "Configuración",
  accounts: "Cuentas",
};

export function isAdminToolKey(value: string): value is AdminToolKey {
  return (ADMIN_TOOL_KEYS as readonly string[]).includes(value);
}

// An empty permissions array means unrestricted (full) access — this keeps
// the seeded division root admins working without needing to backfill data.
export function hasAdminPermission(
  permissions: string[],
  tool: AdminToolKey,
): boolean {
  return permissions.length === 0 || permissions.includes(tool);
}

// Innovation has no products for sale, so its admin panel only needs image,
// text/WhatsApp, and team-account management — the rest (dashboard, product
// CRUD, orders, quotes, reports) has nothing to show.
export const DIVISION_TOOL_RESTRICTIONS: Partial<Record<DivisionName, readonly AdminToolKey[]>> = {
  Innovation: ["images", "settings", "accounts"],
};

export function isToolAllowedForDivision(
  division: DivisionName | null | undefined,
  tool: AdminToolKey,
): boolean {
  if (!division) return true;
  const allowed = DIVISION_TOOL_RESTRICTIONS[division];
  return !allowed || allowed.includes(tool);
}

export function sanitizePermissions(input: unknown): AdminToolKey[] {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(input.filter((item): item is string => typeof item === "string")),
  ).filter(isAdminToolKey);
}
