import { DEV_ADMIN_USER, getSessionFromCookies } from "@/lib/auth";
import { getUserById } from "@/lib/users";

export async function requireAdminUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  if (session.userId === DEV_ADMIN_USER.id && session.role === "ADMIN") {
    return DEV_ADMIN_USER;
  }

  const user = await getUserById(session.userId);

  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return user;
}
