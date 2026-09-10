import Image from "next/image";
import { resolveImage, type SiteImages } from "@/lib/site-images";

type Props = {
  imageKey: string;
  /** Optional mobile-only counterpart shown below `md`. Falls back to the
   * desktop image's defaultSrc via resolveImage if nothing was uploaded. */
  mobileImageKey?: string;
  alt: string;
  siteImages: SiteImages;
  className?: string;
  width?: number;
  height?: number;
  mobileWidth?: number;
  mobileHeight?: number;
};

// Full-width promo banner that swaps to a dedicated mobile crop below `md`,
// mirroring the hero pattern in app/cauchos/page.tsx and BrandClosingBanner.
export function ResponsiveBanner({
  imageKey,
  mobileImageKey,
  alt,
  siteImages,
  className = "",
  width = 2048,
  height = 768,
  mobileWidth = 1080,
  mobileHeight = 1350,
}: Props) {
  return (
    <>
      {mobileImageKey && (
        <Image
          src={resolveImage(mobileImageKey, siteImages)}
          alt={alt}
          width={mobileWidth}
          height={mobileHeight}
          className={`block h-auto w-full md:hidden ${className}`}
        />
      )}
      <Image
        src={resolveImage(imageKey, siteImages)}
        alt={alt}
        width={width}
        height={height}
        className={`h-auto w-full ${mobileImageKey ? "hidden md:block" : ""} ${className}`}
      />
    </>
  );
}
