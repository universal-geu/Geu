"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type CauchosMenuContextValue = {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};

const CauchosMenuContext = createContext<CauchosMenuContextValue | null>(null);

export function CauchosMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Guards against the menu staying visibly open after a client-side route
  // change — if React reuses this provider's instance across navigations
  // (same component shape at the same tree position), `isOpen` would
  // otherwise carry over into the new page instead of resetting. Adjusting
  // state during render (the React-recommended pattern) instead of in an
  // effect avoids an extra render pass with the stale open menu painted.
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setIsOpen(false);
  }

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
