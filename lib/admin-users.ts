import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DIVISION_ADMIN_EMAILS, type DivisionName } from "@/lib/divisions";
import { grantsAnyAdminTool, sanitizeAdminPermissions } from "@/lib/admin-permissions";

// Team users are ADMIN accounts of one division with a non-empty permission
// list. The division root accounts (DIVISION_ADMIN_EMAILS, empty permissions)
// are not team users and can't be listed or edited from here.
const ROOT_ADMIN_EMAILS = Object.values(DIVISION_ADMIN_EMAILS).map((email) => email.toLowerCase());

export const MIN_ADMIN_PASSWORD_LENGTH = 8;

// Team users keep their area (Diseño, Ventas...) in User.company, which only
// customers use otherwise; the panel shows it as "Panel de <área>".

const TEAM_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  company: true,
  permissions: true,
  active: true,
  createdAt: true,
} as const;

export type AdminTeamUser = {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  permissions: string[];
  active: boolean;
  createdAt: Date;
};

function getPrisma() {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }
  return prisma;
}

function teamUserWhere(division: DivisionName) {
  return {
    role: "ADMIN" as const,
    division,
    email: { notIn: ROOT_ADMIN_EMAILS },
  };
}

export async function getAdminTeamUsers(division: DivisionName): Promise<AdminTeamUser[]> {
  return await getPrisma().user.findMany({
    where: teamUserWhere(division),
    select: TEAM_USER_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export async function createAdminTeamUser(
  division: DivisionName,
  input: { fullName?: string; email?: string; area?: string; password?: string; permissions?: unknown },
) {
  const db = getPrisma();
  const fullName = input.fullName?.trim() || "";
  const email = input.email?.trim().toLowerCase() || "";
  const password = input.password || "";
  const permissions = sanitizeAdminPermissions(division, input.permissions);

  if (!fullName || !email || !email.includes("@")) throw new Error("INVALID_INPUT");
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) throw new Error("WEAK_PASSWORD");
  if (!grantsAnyAdminTool(permissions)) throw new Error("NO_PERMISSIONS");
  if (ROOT_ADMIN_EMAILS.includes(email)) throw new Error("EMAIL_ALREADY_EXISTS");

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

  return await db.user.create({
    data: {
      fullName,
      email,
      company: input.area?.trim() || null,
      passwordHash: await hash(password, 10),
      role: "ADMIN",
      division,
      permissions,
      active: true,
    },
    select: TEAM_USER_SELECT,
  });
}

async function findTeamUser(division: DivisionName, id: string) {
  const user = await getPrisma().user.findFirst({
    where: { ...teamUserWhere(division), id },
    select: { id: true },
  });
  if (!user) throw new Error("NOT_FOUND");
  return user;
}

export async function updateAdminTeamUser(
  division: DivisionName,
  id: string,
  input: { fullName?: string; area?: string; password?: string; permissions?: unknown; active?: unknown },
) {
  await findTeamUser(division, id);

  const data: {
    fullName?: string;
    company?: string | null;
    passwordHash?: string;
    permissions?: string[];
    active?: boolean;
  } = {};

  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim();
    if (!fullName) throw new Error("INVALID_INPUT");
    data.fullName = fullName;
  }

  if (typeof input.area === "string") {
    data.company = input.area.trim() || null;
  }

  if (input.password) {
    if (input.password.length < MIN_ADMIN_PASSWORD_LENGTH) throw new Error("WEAK_PASSWORD");
    data.passwordHash = await hash(input.password, 10);
  }

  if (input.permissions !== undefined) {
    const permissions = sanitizeAdminPermissions(division, input.permissions);
    if (!grantsAnyAdminTool(permissions)) throw new Error("NO_PERMISSIONS");
    data.permissions = permissions;
  }

  if (typeof input.active === "boolean") {
    data.active = input.active;
  }

  return await getPrisma().user.update({ where: { id }, data, select: TEAM_USER_SELECT });
}

// Deleting a user cascades to its orders, so a team user with orders or
// quotes is only deactivated to keep that history.
export async function deleteAdminTeamUser(division: DivisionName, id: string) {
  await findTeamUser(division, id);
  const db = getPrisma();
  const [orders, quotes] = await Promise.all([
    db.order.count({ where: { userId: id } }),
    db.quote.count({ where: { userId: id } }),
  ]);

  if (orders > 0 || quotes > 0) {
    await db.user.update({ where: { id }, data: { active: false } });
    return { deleted: false };
  }

  await db.user.delete({ where: { id } });
  return { deleted: true };
}
