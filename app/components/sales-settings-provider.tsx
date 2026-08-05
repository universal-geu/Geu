"use client";

import { createContext, useContext } from "react";
import type { CauchosSalesMode } from "@/lib/site-settings";

type SalesSettings = {
  cauchosSalesMode: CauchosSalesMode;
  whatsappNumber: string | null;
};

const SalesSettingsContext = createContext<SalesSettings>({
  cauchosSalesMode: "precios",
  whatsappNumber: null,
});

export function SalesSettingsProvider({
  cauchosSalesMode,
  whatsappNumber,
  children,
}: SalesSettings & { children: React.ReactNode }) {
  return (
    <SalesSettingsContext.Provider value={{ cauchosSalesMode, whatsappNumber }}>
      {children}
    </SalesSettingsContext.Provider>
  );
}

export function useSalesSettings() {
  return useContext(SalesSettingsContext);
}
