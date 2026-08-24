import { prisma } from "@/lib/prisma";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";

export const WHATSAPP_NUMBER_KEY = "whatsapp-number";
export const CAUCHOS_SALES_MODE_KEY = "cauchos-sales-mode";

export type CauchosSalesMode = "precios" | "whatsapp";

export function whatsappNumberKey(division: DivisionName): string {
  return `whatsapp-number-${division.toLowerCase()}`;
}

export async function getSiteSetting(key: string): Promise<string | null> {
  if (!prisma) return null;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value.trim() || null;
  } catch {
    return null;
  }
}

/** The shared/default number, used by any division that hasn't set its own. */
export async function getWhatsAppNumber(): Promise<string | null> {
  return getSiteSetting(WHATSAPP_NUMBER_KEY);
}

/** A single division's effective number — its own override, or the shared default. */
export async function getWhatsAppNumberForDivision(
  division: DivisionName,
): Promise<string | null> {
  const override = await getSiteSetting(whatsappNumberKey(division));
  if (override) return override;
  return getSiteSetting(WHATSAPP_NUMBER_KEY);
}

/** Every division's effective number in one query — for the root layout. */
export async function getAllWhatsAppNumbers(): Promise<Record<DivisionName, string | null>> {
  const empty = Object.fromEntries(DIVISIONS.map((division) => [division, null])) as Record<
    DivisionName,
    string | null
  >;
  if (!prisma) return empty;

  try {
    const keys = [WHATSAPP_NUMBER_KEY, ...DIVISIONS.map(whatsappNumberKey)];
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    const byKey = new Map(rows.map((row) => [row.key, row.value.trim() || null]));
    const defaultNumber = byKey.get(WHATSAPP_NUMBER_KEY) ?? null;

    return Object.fromEntries(
      DIVISIONS.map((division) => [
        division,
        byKey.get(whatsappNumberKey(division)) || defaultNumber,
      ]),
    ) as Record<DivisionName, string | null>;
  } catch {
    return empty;
  }
}

export async function getCauchosSalesMode(): Promise<CauchosSalesMode> {
  const value = await getSiteSetting(CAUCHOS_SALES_MODE_KEY);
  return value === "whatsapp" ? "whatsapp" : "precios";
}
