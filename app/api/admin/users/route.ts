import { requireUserManager } from "@/lib/admin";
import { createAdminTeamUser, getAdminTeamUsers } from "@/lib/admin-users";
import { adminUsersErrorResponse } from "./errors";

export async function GET() {
  try {
    await requireUserManager();
    const users = await getAdminTeamUsers();
    return Response.json({ users });
  } catch (error) {
    return adminUsersErrorResponse(error, "No fue posible cargar los usuarios.");
  }
}

export async function POST(request: Request) {
  try {
    await requireUserManager();
    const body = (await request.json()) as {
      fullName?: string;
      email?: string;
      area?: string;
      password?: string;
      division?: string;
      permissions?: unknown;
    };
    const user = await createAdminTeamUser(body);
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    return adminUsersErrorResponse(error, "No fue posible crear el usuario.");
  }
}
