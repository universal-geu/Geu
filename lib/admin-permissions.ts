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

export function sanitizePermissions(input: unknown): AdminToolKey[] {
  if (!Array.isArray(input)) return [];

  return Array.from(
    new Set(input.filter((item): item is string => typeof item === "string")),
  ).filter(isAdminToolKey);
}
