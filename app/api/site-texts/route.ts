import { getSiteTexts } from "@/lib/site-texts";

export async function GET() {
  const texts = await getSiteTexts();
  return Response.json({ texts });
}
