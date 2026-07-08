"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type GeuThemeToggleProps = {
  accent?: string;
};

export default function GeuThemeToggle({ accent = "#ffffff" }: GeuThemeToggleProps) {
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === "undefined") return false;

    return window.localStorage.getItem("geu-theme") === "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("geu-light-mode", isLight);
  }, [isLight]);

  const toggleTheme = () => {
    const nextIsLight = !isLight;

    document.documentElement.classList.toggle("geu-light-mode", nextIsLight);
    window.localStorage.setItem("geu-theme", nextIsLight ? "light" : "dark");
    setIsLight(nextIsLight);
  };

  return (
    <button
      type="button"
      aria-label={isLight ? "Activar modo oscuro" : "Activar modo claro"}
      aria-pressed={isLight}
      className="geu-theme-toggle"
      onClick={toggleTheme}
      style={{ "--theme-accent": accent } as CSSProperties & Record<"--theme-accent", string>}
    >
      <span className="geu-theme-toggle__track">
        <span className="geu-theme-toggle__thumb">
          {isLight ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 14.8A8.2 8.2 0 0 1 9.2 3 7 7 0 1 0 21 14.8Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
            </svg>
          )}
        </span>
      </span>
      <span className="geu-theme-toggle__label">{isLight ? "Oscuro" : "Claro"}</span>
    </button>
  );
}
