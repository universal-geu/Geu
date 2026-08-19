import { requireAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdminUser();
    if (!prisma) return Response.json({ history: {} });

    const rows = await prisma.siteImageHistory.findMany({ orderBy: { createdAt: "desc" } });
    const history: Record<string, { url: string; createdAt: string }[]> = {};
    for (const row of rows) {
      const list = history[row.key] ?? (history[row.key] = []);
      if (list.length < 3) list.push({ url: row.url, createdAt: row.createdAt.toISOString() });
    }

    return Response.json({ history });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return Response.json({ error: msg }, { status: msg === "UNAUTHORIZED" || msg === "FORBIDDEN" ? 401 : 500 });
  }
}
