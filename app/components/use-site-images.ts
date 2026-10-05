"use client";

import { useEffect, useState } from "react";
import type { SiteImages } from "@/lib/image-slots";

type SiteImageData = { images: SiteImages; links: SiteImages };

export function useSiteImageData(): SiteImageData {
  const [data, setData] = useState<SiteImageData>({ images: {}, links: {} });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/site-images")
      .then((response) => response.json())
      .then((json: { images?: SiteImages; links?: SiteImages }) => {
        if (!cancelled && json.images) setData({ images: json.images, links: json.links ?? {} });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

export function useSiteImages(): SiteImages {
  return useSiteImageData().images;
}
