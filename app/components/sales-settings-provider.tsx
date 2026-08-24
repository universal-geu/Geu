"use client";

import { createContext, useContext } from "react";
import type { CauchosSalesMode } from "@/lib/site-settings";
import type { DivisionName } from "@/lib/divisions";

type SalesSettings = {
  cauchosSalesMode: CauchosSalesMode;
  whatsappNumbers: Record<DivisionName, string | null>;
};

const EMPTY_NUMBERS = {} as Record<DivisionName, string | null>;

const SalesSettingsContext = createContext<SalesSettings>({
  cauchosSalesMode: "precios",
  whatsappNumbers: EMPTY_NUMBERS,
});

export function SalesSettingsProvider({
  cauchosSalesMode,
  whatsappNumbers,
  children,
}: SalesSettings & { children: React.ReactNode }) {
  return (
    <SalesSettingsContext.Provider value={{ cauchosSalesMode, whatsappNumbers }}>
      {children}
    </SalesSettingsContext.Provider>
  );
}

export function useSalesSettings() {
  return useContext(SalesSettingsContext);
}
