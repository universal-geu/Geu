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
const DIVISION_TOOL_RESTRICTIONS: Partial<Record<DivisionName, readonly AdminToolKey[]>> = {
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
