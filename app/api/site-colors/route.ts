import { getSiteColors } from "@/lib/site-colors";

export async function GET() {
  const colors = await getSiteColors();
  return Response.json({ colors });
}
