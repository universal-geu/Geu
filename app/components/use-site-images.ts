"use client";

import { useEffect, useState } from "react";
import type { SiteImages } from "@/lib/image-slots";

export function useSiteImages(): SiteImages {
  const [siteImages, setSiteImages] = useState<SiteImages>({});

  useEffect(() => {
    let cancelled = false;

    fetch("/api/site-images")
      .then((response) => response.json())
      .then((data: { images?: SiteImages }) => {
        if (!cancelled && data.images) setSiteImages(data.images);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return siteImages;
}
