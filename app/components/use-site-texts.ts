"use client";

import { useEffect, useState } from "react";
import type { SiteTexts } from "@/lib/text-slots";

export function useSiteTexts(): SiteTexts {
  const [siteTexts, setSiteTexts] = useState<SiteTexts>({});

  useEffect(() => {
    let cancelled = false;

    fetch("/api/site-texts")
      .then((response) => response.json())
      .then((data: { texts?: SiteTexts }) => {
        if (!cancelled && data.texts) setSiteTexts(data.texts);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return siteTexts;
}
