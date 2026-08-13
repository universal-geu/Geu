"use client";

import { useEffect, useState } from "react";
import type { SiteColors } from "@/lib/color-slots";

export function useSiteColors(): SiteColors {
  const [siteColors, setSiteColors] = useState<SiteColors>({});

  useEffect(() => {
    let cancelled = false;

    fetch("/api/site-colors")
      .then((response) => response.json())
      .then((data: { colors?: SiteColors }) => {
        if (!cancelled && data.colors) setSiteColors(data.colors);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return siteColors;
}
