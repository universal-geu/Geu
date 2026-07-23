import { getWhatsAppNumber } from "@/lib/site-settings";

export async function GET() {
  const whatsappNumber = await getWhatsAppNumber();
  return Response.json({ whatsappNumber });
}
