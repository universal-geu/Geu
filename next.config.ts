import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vercel's metered Image Optimization quota has been running out
    // mid-month, breaking every image requested after the limit hits
    // (HTTP 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED). Serve images
    // unoptimized so they always load, at the cost of automatic
    // resizing/compression.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
