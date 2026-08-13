import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser();
    if (!prisma) return Response.json({ error: "BD no disponible." }, { status: 503 });

    const body = (await request.json()) as { key?: string };
    if (!body.key) return Response.json({ error: "key es requerido." }, { status: 400 });

    const draft = await prisma.siteContentDraft.findUnique({ where: { key: body.key } });
    if (!draft) return Response.json({ ok: true });
    if (draft.division !== admin.division && draft.division !== "Global") {
      return Response.json({ error: "No autorizado para esta división." }, { status: 403 });
    }

    await prisma.siteContentDraft.delete({ where: { key: body.key } });
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
