import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  DIVISIONS,
  DIVISION_ADMIN_EMAILS,
  DIVISION_ADMIN_NAMES,
  type DivisionName,
} from "@/lib/divisions";

const SESSION_COOKIE_NAME = "geu_session";
const encoder = new TextEncoder();

export type DevAdminUser = {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: null;
  department: null;
  city: null;
  addressLine1: null;
  addressLine2: null;
  role: "ADMIN";
  division: DivisionName;
  permissions: string[];
  active: true;
  createdAt: Date;
};

export const DEV_ADMIN_USERS: Record<DivisionName, DevAdminUser> = Object.fromEntries(
  DIVISIONS.map((division) => [
    division,
    {
      id: `dev-admin-${division.toLowerCase()}`,
      fullName: DIVISION_ADMIN_NAMES[division],
      company: "GEU",
      email: DIVISION_ADMIN_EMAILS[division],
      phone: null,
      department: null,
      city: null,
      addressLine1: null,
      addressLine2: null,
      role: "ADMIN" as const,
      division,
      permissions: [] as string[],
      active: true as const,
      createdAt: new Date(0),
    },
  ]),
) as Record<DivisionName, DevAdminUser>;

export function getDevAdminUserByEmail(email: string) {
  return Object.values(DEV_ADMIN_USERS).find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
}

export function getDevAdminUserById(id: string) {
  return Object.values(DEV_ADMIN_USERS).find((user) => user.id === id);
}

function getSessionSecret() {
  return process.env.APP_SESSION_SECRET || "geu-dev-session-secret-change-me";
}

function getSessionKey() {
  return encoder.encode(getSessionSecret());
}

export type SessionPayload = {
  userId: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  division?: DivisionName;
};

export async function createSessionToken(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionKey());
}

export async function readSessionToken(token: string) {
  const verified = await jwtVerify(token, getSessionKey());
  return verified.payload as SessionPayload;
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await readSessionToken(token);
  } catch {
    return null;
  }
}
