import { COLOR_SLOTS, resolveColor, type SiteColors } from "@/lib/color-slots";
import type { DivisionName } from "@/lib/divisions";

/**
 * The site's brand colors are baked into ~250 hardcoded Tailwind arbitrary-value
 * classes (`bg-[#075ed8]`, `hover:text-[#e31313]`, etc.) across ~30 files rather
 * than a single CSS variable, so making them admin-editable without touching
 * every one of those call sites means overriding Tailwind's own generated rules
 * at runtime: for every distinct utility pattern that references a division's
 * default hex, emit a `!important` rule (scoped to that division's pages via
 * CauchosHeader) mapping the OLD hex's exact escaped selector to the NEW color.
 *
 * If a color hasn't been customized, this generates nothing — zero risk to the
 * current look of the site.
 */

function escapeTailwindClass(raw: string): string {
  return raw.replace(/[#[\].\/:]/g, (ch) => `\\${ch}`);
}

const SOLID_PREFIXES: { prefix: string; property: string }[] = [
  { prefix: "text-", property: "color" },
  { prefix: "bg-", property: "background-color" },
  { prefix: "border-", property: "border-color" },
  { prefix: "border-t-", property: "border-top-color" },
  { prefix: "decoration-", property: "text-decoration-color" },
];

// Exact opacity fractions/decimals found in use across the codebase for these colors.
const OPACITY_FRACTIONS = [15, 18, 25, 35, 40, 50, 70];
const OPACITY_DECIMALS = [0.06, 0.07];

function hexWithAlpha(hex: string, percent: number): string {
  const alpha = Math.round((percent / 100) * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${alpha}`;
}

function colorMix(hex: string, percent: number): string {
  return `color-mix(in srgb, ${hex} ${percent}%, transparent)`;
}

function rule(selector: string, property: string, value: string): string {
  return `${selector} { ${property}: ${value} !important; }`;
}

function generateForHex(oldHex: string, newColor: string): string {
  const rules: string[] = [];

  for (const { prefix, property } of SOLID_PREFIXES) {
    const base = escapeTailwindClass(`${prefix}[${oldHex}]`);
    rules.push(rule(`.${base}`, property, newColor));
    rules.push(rule(`.hover\\:${base}:hover`, property, newColor));
    rules.push(rule(`.focus\\:${base}:focus`, property, newColor));
    rules.push(
      rule(`.group-hover\\:${base}:is(:where(.group):hover *)`, property, newColor),
    );
  }

  const withAlphaFallback = (selector: string, property: string, pct: number) =>
    `${selector} { ${property}: ${hexWithAlpha(newColor, pct)} !important; ${property}: ${colorMix(newColor, pct)} !important; }`;

  for (const pct of OPACITY_FRACTIONS) {
    const base = escapeTailwindClass(`border-[${oldHex}]/${pct}`);
    rules.push(withAlphaFallback(`.${base}`, "border-color", pct));
    rules.push(withAlphaFallback(`.hover\\:${base}:hover`, "border-color", pct));
  }

  for (const dec of OPACITY_DECIMALS) {
    const pct = Math.round(dec * 100);
    const base = escapeTailwindClass(`bg-[${oldHex}]/[${dec}]`);
    rules.push(withAlphaFallback(`.${base}`, "background-color", pct));
  }

  return rules.join("\n");
}

export function buildDivisionColorOverrideCss(
  division: DivisionName,
  siteColors: SiteColors,
): string {
  const slots = COLOR_SLOTS.filter((s) => s.division === division);
  let css = "";
  for (const slot of slots) {
    const value = resolveColor(slot.key, siteColors, slot.defaultValue);
    if (value !== slot.defaultValue) {
      css += generateForHex(slot.defaultValue, value) + "\n";
    }
  }
  return css;
}
