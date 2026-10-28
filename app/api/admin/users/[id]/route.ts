import { requireUserManager } from "@/lib/admin";
import { deleteAdminTeamUser, updateAdminTeamUser } from "@/lib/admin-users";
import { adminUsersErrorResponse } from "../errors";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireUserManager();
    const { id } = await params;
    const body = (await request.json()) as {
      fullName?: string;
      area?: string;
      password?: string;
      permissions?: unknown;
      active?: unknown;
    };
    const user = await updateAdminTeamUser(admin.division, id, body);
    return Response.json({ user });
  } catch (error) {
    return adminUsersErrorResponse(error, "No fue posible actualizar el usuario.");
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireUserManager();
    const { id } = await params;
    const result = await deleteAdminTeamUser(admin.division, id);
    return Response.json(result);
  } catch (error) {
    return adminUsersErrorResponse(error, "No fue posible eliminar el usuario.");
  }
}
