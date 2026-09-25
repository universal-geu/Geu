import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { DIVISIONS, type DivisionName } from "@/lib/divisions";

export const WHATSAPP_NUMBER_KEY = "whatsapp-number";
export const CAUCHOS_SALES_MODE_KEY = "cauchos-sales-mode";

export type CauchosSalesMode = "precios" | "whatsapp";

export function whatsappNumberKey(division: DivisionName): string {
  return `whatsapp-number-${division.toLowerCase()}`;
}

export const getSiteSetting = cache(async function getSiteSetting(key: string): Promise<string | null> {
  if (!prisma) return null;
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    return row?.value.trim() || null;
  } catch {
    return null;
  }
});

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
export const getAllWhatsAppNumbers = cache(async function getAllWhatsAppNumbers(): Promise<
  Record<DivisionName, string | null>
> {
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
});

// Cauchos keeps its original (pre-per-division) key so its already-configured
// mode isn't lost; every other division gets its own "sales-mode-<division>" key.
export function salesModeKey(division: DivisionName): string {
  return division === "Cauchos" ? CAUCHOS_SALES_MODE_KEY : `sales-mode-${division.toLowerCase()}`;
}

export const getSalesModeForDivision = cache(async function getSalesModeForDivision(
  division: DivisionName,
): Promise<CauchosSalesMode> {
  const value = await getSiteSetting(salesModeKey(division));
  return value === "whatsapp" ? "whatsapp" : "precios";
});

/** Every division's sales mode in one query — for the root layout. */
export const getAllSalesModes = cache(async function getAllSalesModes(): Promise<
  Record<DivisionName, CauchosSalesMode>
> {
  const empty = Object.fromEntries(DIVISIONS.map((division) => [division, "precios"])) as Record<
    DivisionName,
    CauchosSalesMode
  >;
  if (!prisma) return empty;

  try {
    const keys = DIVISIONS.map(salesModeKey);
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
    const byKey = new Map(rows.map((row) => [row.key, row.value.trim()]));

    return Object.fromEntries(
      DIVISIONS.map((division) => [
        division,
        byKey.get(salesModeKey(division)) === "whatsapp" ? "whatsapp" : "precios",
      ]),
    ) as Record<DivisionName, CauchosSalesMode>;
  } catch {
    return empty;
  }
});
