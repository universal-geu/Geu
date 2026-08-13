import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!prisma) return Response.json({ versions: [] });

    const versions = await prisma.siteContentVersion.findMany({
      where: { division: admin.division },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, createdAt: true, createdBy: true, label: true, snapshot: true },
    });

    const summarized = versions.map((v) => {
      const snapshot = v.snapshot as { images?: Record<string, unknown>; texts?: Record<string, unknown> };
      const changedCount =
        Object.keys(snapshot?.images ?? {}).length + Object.keys(snapshot?.texts ?? {}).length;
      return {
        id: v.id,
        createdAt: v.createdAt,
        createdBy: v.createdBy,
        label: v.label,
        changedCount,
      };
    });

    return Response.json({ versions: summarized });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
