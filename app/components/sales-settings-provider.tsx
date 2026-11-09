"use client";

import { createContext, useContext } from "react";
import type { CauchosSalesMode } from "@/lib/site-settings";
import type { DivisionName } from "@/lib/divisions";

type SalesSettings = {
  salesModes: Record<DivisionName, CauchosSalesMode>;
  /** True for divisions in WhatsApp mode with prices turned off. */
  pricesHidden: Record<DivisionName, boolean>;
  whatsappNumbers: Record<DivisionName, string | null>;
  /** The site's own origin (e.g. "https://geu.com.co"), read from the request's Host header. */
  siteOrigin: string;
};

const EMPTY_NUMBERS = {} as Record<DivisionName, string | null>;
const EMPTY_MODES = {} as Record<DivisionName, CauchosSalesMode>;
const EMPTY_HIDDEN = {} as Record<DivisionName, boolean>;

const SalesSettingsContext = createContext<SalesSettings>({
  salesModes: EMPTY_MODES,
  pricesHidden: EMPTY_HIDDEN,
  whatsappNumbers: EMPTY_NUMBERS,
  siteOrigin: "",
});

export function SalesSettingsProvider({
  salesModes,
  pricesHidden,
  whatsappNumbers,
  siteOrigin,
  children,
}: SalesSettings & { children: React.ReactNode }) {
  return (
    <SalesSettingsContext.Provider value={{ salesModes, pricesHidden, whatsappNumbers, siteOrigin }}>
      {children}
    </SalesSettingsContext.Provider>
  );
}

export function useSalesSettings() {
  return useContext(SalesSettingsContext);
}
