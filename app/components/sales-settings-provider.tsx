"use client";

import { createContext, useContext } from "react";
import type { CauchosSalesMode } from "@/lib/site-settings";
import type { DivisionName } from "@/lib/divisions";

type SalesSettings = {
  salesModes: Record<DivisionName, CauchosSalesMode>;
  whatsappNumbers: Record<DivisionName, string | null>;
  /** The site's own origin (e.g. "https://geu.com.co"), read from the request's Host header. */
  siteOrigin: string;
};

const EMPTY_NUMBERS = {} as Record<DivisionName, string | null>;
const EMPTY_MODES = {} as Record<DivisionName, CauchosSalesMode>;

const SalesSettingsContext = createContext<SalesSettings>({
  salesModes: EMPTY_MODES,
  whatsappNumbers: EMPTY_NUMBERS,
  siteOrigin: "",
});

export function SalesSettingsProvider({
  salesModes,
  whatsappNumbers,
  siteOrigin,
  children,
}: SalesSettings & { children: React.ReactNode }) {
  return (
    <SalesSettingsContext.Provider value={{ salesModes, whatsappNumbers, siteOrigin }}>
      {children}
    </SalesSettingsContext.Provider>
  );
}

export function useSalesSettings() {
  return useContext(SalesSettingsContext);
}
