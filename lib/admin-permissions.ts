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

export const ADMIN_TOOL_LABELS: Record<AdminToolKey, string> = {
  dashboard: "Dashboard",
  create: "Crear",
  edit: "Editar",
  inventory: "Inventario",
  orders: "Pedidos",
  customers: "Clientes",
  quotes: "Cotizaciones",
  categories: "Categorías",
  reports: "Informes",
  images: "Imágenes",
  settings: "Configuración",
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

// Innovation and GEU (the corporate/parent brand) have no products for
// sale, so their admin panels only need image, text/WhatsApp, and
// team-account management — the rest (dashboard, product CRUD, orders,
// quotes, reports) has nothing to show.
export const DIVISION_TOOL_RESTRICTIONS: Partial<Record<DivisionName, readonly AdminToolKey[]>> = {
  Innovation: ["images", "settings"],
  GEU: ["images", "settings"],
};

export function isToolAllowedForDivision(
  division: DivisionName | null | undefined,
  tool: AdminToolKey,
): boolean {
  if (!division) return true;
  // Quotes only make sense for Cauchos (Universal de Cauchos) — the other
  // brands don't take quote requests, so hide the tool everywhere else.
  if (tool === "quotes" && division !== "Cauchos") return false;
  const allowed = DIVISION_TOOL_RESTRICTIONS[division];
  return !allowed || allowed.includes(tool);
}

export function sanitizePermissions(input: unknown): AdminToolKey[] {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(input.filter((item): item is string => typeof item === "string")),
  ).filter(isAdminToolKey);
}
