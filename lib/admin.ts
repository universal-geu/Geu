import { getDevAdminUserById, getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import type { DivisionName } from "@/lib/divisions";
import {
  hasAdminPermission,
  isToolAllowedForDivision,
  type AdminToolKey,
} from "@/lib/admin-permissions";

export async function requireAdminUser(permission?: AdminToolKey) {
  const session = await getSessionFromCookies();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const devAdmin = getDevAdminUserById(session.userId);
  if (devAdmin && session.role === "ADMIN") {
    if (permission && !isToolAllowedForDivision(devAdmin.division, permission)) {
      throw new Error("FORBIDDEN");
    }
    return devAdmin;
  }

  const user = await getUserById(session.userId);

  if (!user || user.role !== "ADMIN" || !user.division || !user.active) {
    throw new Error("FORBIDDEN");
  }

  if (
    permission &&
    (!isToolAllowedForDivision(user.division as DivisionName, permission) ||
      !hasAdminPermission(user.permissions, permission))
  ) {
    throw new Error("FORBIDDEN");
  }

  return { ...user, division: user.division as DivisionName };
}
