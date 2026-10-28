import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { DIVISION_ADMIN_EMAILS, DIVISIONS, type DivisionName } from "@/lib/divisions";
import { grantsAnyAdminTool, sanitizeAdminPermissions } from "@/lib/admin-permissions";

// Team users are ADMIN accounts with a non-empty permission list, all managed
// from the GEU panel. Their User.division is the unit they belong to ("home");
// "unit:"/"home:off" tokens set which units they can actually enter. The
// division root accounts (DIVISION_ADMIN_EMAILS, empty permissions) are not
// team users and can't be listed or edited from here.
const ROOT_ADMIN_EMAILS = Object.values(DIVISION_ADMIN_EMAILS).map((email) => email.toLowerCase());

export const MIN_ADMIN_PASSWORD_LENGTH = 8;

// Team users keep their area (Diseño, Ventas...) in User.company, which only
// customers use otherwise; the panel shows it as "Panel de <área>".

const TEAM_USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  company: true,
  division: true,
  permissions: true,
  active: true,
  createdAt: true,
} as const;

export type AdminTeamUser = {
  id: string;
  fullName: string;
  email: string;
  company: string | null;
  division: DivisionName | null;
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

const TEAM_USER_WHERE = {
  role: "ADMIN" as const,
  email: { notIn: ROOT_ADMIN_EMAILS },
};

export async function getAdminTeamUsers(): Promise<AdminTeamUser[]> {
  return await getPrisma().user.findMany({
    where: TEAM_USER_WHERE,
    select: TEAM_USER_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

// A new user belongs to the first unit it was given (in DIVISIONS order).
export async function createAdminTeamUser(input: {
  fullName?: string;
  email?: string;
  area?: string;
  password?: string;
  division?: string;
  permissions?: unknown;
}) {
  const db = getPrisma();
  const division = DIVISIONS.find((item) => item === input.division);
  if (!division) throw new Error("INVALID_INPUT");
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

async function findTeamUser(id: string) {
  const user = await getPrisma().user.findFirst({
    where: { ...TEAM_USER_WHERE, id },
    select: { id: true, division: true },
  });
  if (!user || !user.division) throw new Error("NOT_FOUND");
  return { id: user.id, division: user.division as DivisionName };
}

export async function updateAdminTeamUser(
  id: string,
  input: { fullName?: string; area?: string; password?: string; permissions?: unknown; active?: unknown },
) {
  const { division } = await findTeamUser(id);

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
export async function deleteAdminTeamUser(id: string) {
  await findTeamUser(id);
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
