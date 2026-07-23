import { prisma } from "@/lib/prisma";

export const WHATSAPP_NUMBER_KEY = "whatsapp-number";

export async function getSiteSetting(key: string): Promise<string | null> {
  if (!prisma) return null;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value.trim() || null;
  } catch {
    return null;
  }
}

export async function getWhatsAppNumber(): Promise<string | null> {
  return getSiteSetting(WHATSAPP_NUMBER_KEY);
}
