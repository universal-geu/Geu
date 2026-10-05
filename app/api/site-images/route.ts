import { getSiteImageLinks, getSiteImages } from "@/lib/site-images";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const [images, links] = await Promise.all([getSiteImages(), getSiteImageLinks()]);
  return Response.json(
    { images, links },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } },
  );
}
