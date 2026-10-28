import { getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import type { DivisionName } from "@/lib/divisions";
import type { DashboardMetrics, SalesReport } from "@/lib/orders";
import {
  canEnterAdminDivision,
  getAdminUnits,
  canManageAdminUsers,
  hasAdminExtra,
  hasAdminPermission,
  isToolAllowedForDivision,
  type AdminAccessLevel,
  type AdminToolKey,
} from "@/lib/admin-permissions";

// Pass level "edit" from handlers that change data; reads only need "view".
export async function requireAdminUser(permission?: AdminToolKey, level: AdminAccessLevel = "view") {
  const session = await getSessionFromCookies();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await getUserById(session.userId);

  if (!user || user.role !== "ADMIN" || !user.division || !user.active) {
    throw new Error("FORBIDDEN");
  }

  const homeDivision = user.division as DivisionName;
  const division = getActiveAdminDivision(homeDivision, user.permissions, session.division);

  if (
    permission &&
    (!isToolAllowedForDivision(division, permission) ||
      !hasAdminPermission(user.permissions, permission, level))
  ) {
    throw new Error("FORBIDDEN");
  }

  return { ...user, division, homeDivision };
}

// The unit a team user is working in: the one chosen with "Cambiar de unidad"
// (kept in the session) if it still has access to it, otherwise its own, or
// its first assigned unit when its own is turned off.
export function getActiveAdminDivision(
  home: DivisionName,
  permissions: string[],
  sessionDivision: DivisionName | undefined,
): DivisionName {
  return sessionDivision && canEnterAdminDivision(home, permissions, sessionDivision)
    ? sessionDivision
    : getAdminUnits(home, permissions)[0];
}

export async function requireUserManager() {
  const admin = await requireAdminUser();
  if (!canManageAdminUsers(admin.permissions)) {
    throw new Error("FORBIDDEN");
  }
  return admin;
}

// For endpoints shared by several tools (content drafts, upload signing):
// passes if the admin can use any one of them at the given level.
export async function requireAdminUserWithAny(tools: AdminToolKey[], level: AdminAccessLevel = "view") {
  const admin = await requireAdminUser();
  const allowed = tools.some(
    (tool) =>
      isToolAllowedForDivision(admin.division, tool) &&
      hasAdminPermission(admin.permissions, tool, level),
  );
  if (!allowed) {
    throw new Error("FORBIDDEN");
  }
  return admin;
}

// Strips what the admin's "no:<extra>" restrictions hide, so hidden amounts
// or rankings never leave the server.
export function redactSalesReport(
  report: SalesReport,
  permissions: string[],
  scope: "dashboard" | "reports",
): SalesReport {
  const showAmounts = hasAdminExtra(permissions, `${scope}.amounts`);
  const showCharts = scope === "dashboard" || hasAdminExtra(permissions, "reports.charts");
  const showRecent = scope === "dashboard" || hasAdminExtra(permissions, "reports.recent");
  const amount = (value: number) => (showAmounts ? value : 0);

  return {
    ...report,
    totals: {
      ...report.totals,
      grossRevenue: amount(report.totals.grossRevenue),
      paidRevenue: amount(report.totals.paidRevenue),
      averageOrderValue: amount(report.totals.averageOrderValue),
    },
    topProduct: report.topProduct && { ...report.topProduct, revenue: amount(report.topProduct.revenue) },
    topProducts: showCharts
      ? report.topProducts.map((product) => ({ ...product, revenue: amount(product.revenue) }))
      : [],
    categories: showCharts
      ? report.categories.map((category) => ({ ...category, revenue: amount(category.revenue) }))
      : [],
    priceRanges: showCharts ? report.priceRanges : [],
    recentOrders: showRecent
      ? report.recentOrders.map((order) => ({ ...order, subtotal: amount(order.subtotal) }))
      : [],
  };
}

export function redactDashboardMetrics(metrics: DashboardMetrics, permissions: string[]): DashboardMetrics {
  if (hasAdminExtra(permissions, "dashboard.amounts")) return metrics;
  return { ...metrics, revenue: 0, averageTicket: 0 };
}
