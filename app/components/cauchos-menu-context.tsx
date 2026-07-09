"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type CauchosMenuContextValue = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const CauchosMenuContext = createContext<CauchosMenuContextValue | null>(null);

export function CauchosMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CauchosMenuContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen((value) => !value),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CauchosMenuContext.Provider>
  );
}

export function useCauchosMenu() {
  const context = useContext(CauchosMenuContext);
  if (!context) {
    throw new Error("useCauchosMenu must be used within a CauchosMenuProvider");
  }
  return context;
}
