import { prisma } from "@/lib/prisma";

export const WHATSAPP_NUMBER_KEY = "whatsapp-number";
export const CAUCHOS_SALES_MODE_KEY = "cauchos-sales-mode";

export type CauchosSalesMode = "precios" | "whatsapp";

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

export async function getCauchosSalesMode(): Promise<CauchosSalesMode> {
  const value = await getSiteSetting(CAUCHOS_SALES_MODE_KEY);
  return value === "whatsapp" ? "whatsapp" : "precios";
}
