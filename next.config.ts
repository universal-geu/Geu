import type { NextConfig } from "next";

// Cada unidad tiene su propio dominio: en él, "/" muestra la página de la
// unidad, y desde cualquier otro dominio de producción sus rutas redirigen
// allá. localhost y los Preview de Vercel no coinciden con estos hosts, así
// que siguen funcionando con /import, /plastic, etc.
const DIVISION_DOMAINS = [
  { basePath: "/import", domain: "geuimport.com" },
  { basePath: "/plastic", domain: "geuplastic.com" },
  { basePath: "/energy", domain: "geuenergy.com" },
  { basePath: "/structure", domain: "geustructure.com" },
] as const;

const PRODUCTION_DOMAINS = ["geu-universal.com", ...DIVISION_DOMAINS.map((d) => d.domain)];

const hostPattern = (domains: readonly string[]) =>
  `(www\\.)?(${domains.map((d) => d.replace(/\./g, "\\.")).join("|")})`;

const divisionDomainRedirects = DIVISION_DOMAINS.flatMap(({ basePath, domain }) => {
  const otherHosts = [{ type: "host" as const, value: hostPattern(PRODUCTION_DOMAINS.filter((d) => d !== domain)) }];
  return [
    { source: basePath, has: otherHosts, destination: `https://www.${domain}/`, permanent: false },
    { source: `${basePath}/:path*`, has: otherHosts, destination: `https://www.${domain}${basePath}/:path*`, permanent: false },
    { source: basePath, has: [{ type: "host" as const, value: hostPattern([domain]) }], destination: "/", permanent: false },
  ];
});

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: DIVISION_DOMAINS.map(({ basePath, domain }) => ({
        source: "/",
        has: [{ type: "host" as const, value: hostPattern([domain]) }],
        destination: basePath,
      })),
    };
  },
  async redirects() {
    return [
      // "Ver todo GEU": en el dominio de una unidad "/" es esa unidad, así que
      // el home del grupo se enlaza con /grupo-geu y aquí se resuelve al dominio principal.
      {
        source: "/grupo-geu",
        has: [{ type: "host" as const, value: hostPattern(DIVISION_DOMAINS.map((d) => d.domain)) }],
        destination: "https://www.geu-universal.com/",
        permanent: false,
      },
      { source: "/grupo-geu", destination: "/", permanent: false },
      ...divisionDomainRedirects,
      // GEU Structure cambió de /innovation a /structure
      { source: "/innovation", destination: "/structure", permanent: true },
      { source: "/innovation/:path*", destination: "/structure/:path*", permanent: true },
      // Se eliminó la página Nosotros de GEU Innovation
      { source: "/autoservicio-inteligente/nosotros", destination: "/autoservicio-inteligente", permanent: true },
    ];
  },
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
