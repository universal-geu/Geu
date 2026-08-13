import { DIVISION_BRAND, DIVISIONS, type DivisionName } from "@/lib/divisions";

export type ColorSlot = {
  key: string;
  label: string;
  division: DivisionName;
  role: "accent" | "accentHover";
  defaultValue: string;
};

export type SiteColors = Record<string, string>;

export function resolveColor(key: string, siteColors: SiteColors, fallback: string): string {
  return siteColors[key]?.trim() || fallback;
}

export const COLOR_SLOTS: ColorSlot[] = DIVISIONS.flatMap((division) => [
  {
    key: `color-${division.toLowerCase()}-accent`,
    label: `${DIVISION_BRAND[division].label} · Color principal`,
    division,
    role: "accent" as const,
    defaultValue: DIVISION_BRAND[division].accent,
  },
  {
    key: `color-${division.toLowerCase()}-accent-hover`,
    label: `${DIVISION_BRAND[division].label} · Color principal (hover)`,
    division,
    role: "accentHover" as const,
    defaultValue: DIVISION_BRAND[division].accentHover,
  },
]);
