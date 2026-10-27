import { requireUserManager } from "@/lib/admin";
import { createAdminTeamUser, getAdminTeamUsers } from "@/lib/admin-users";
import { adminUsersErrorResponse } from "./errors";

export async function GET() {
  try {
    const admin = await requireUserManager();
    const users = await getAdminTeamUsers(admin.division);
    return Response.json({ users });
  } catch (error) {
    return adminUsersErrorResponse(error, "No fue posible cargar los usuarios.");
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireUserManager();
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      password?: string;
      permissions?: unknown;
    };
    const user = await createAdminTeamUser(admin.division, body);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return adminUsersErrorResponse(error, "No fue posible crear el usuario.");
  }
}
