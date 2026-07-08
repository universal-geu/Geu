export type ImageSlot = {
  key: string;
  label: string;
  group: string;
  division: "Cauchos" | "Import" | "Innovation" | "Plastic" | "Energy";
  defaultSrc: string;
  dims: string;
};

export const IMAGE_SLOTS: ImageSlot[] = [
  { key: "banner-principal", label: "Banner principal", group: "Página de inicio", division: "Cauchos", defaultSrc: "/banner-geu-universal-de-cauchos.jpg", dims: "2048 × 768 px" },
  { key: "banner-marcas-promo", label: "Promociones y marcas", group: "Página de inicio", division: "Cauchos", defaultSrc: "/banner-universal-cauchos-new.jpg", dims: "2048 × 768 px" },
  { key: "oferta-cauchos-productos", label: "Oferta 1 · Productos de caucho", group: "Ofertas", division: "Cauchos", defaultSrc: "/offer-productos-caucho.png", dims: "1024 × 1792 px" },
  { key: "oferta-cauchos-industriales", label: "Oferta 2 · Cauchos industriales", group: "Ofertas", division: "Cauchos", defaultSrc: "/offer-cauchos-industriales.png", dims: "1024 × 1792 px" },
  { key: "oferta-mangueras-industriales", label: "Oferta 3 · Mangueras industriales", group: "Ofertas", division: "Cauchos", defaultSrc: "/offer-mangueras-industriales.png", dims: "1024 × 1792 px" },
  { key: "oferta-soportes-industriales", label: "Oferta 4 · Soportes industriales", group: "Ofertas", division: "Cauchos", defaultSrc: "/offer-soportes-industriales.png", dims: "1024 × 1792 px" },
  { key: "marca-destacada-perfiles", label: "Marca destacada 1 · Perfiles", group: "Marcas destacadas", division: "Cauchos", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "marca-destacada-mangueras", label: "Marca destacada 2 · Mangueras", group: "Marcas destacadas", division: "Cauchos", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "marca-destacada-laminas", label: "Marca destacada 3 · Láminas", group: "Marcas destacadas", division: "Cauchos", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "marca-destacada-soportes", label: "Marca destacada 4 · Soportes", group: "Marcas destacadas", division: "Cauchos", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "banner-categorias", label: "Banner de categorías", group: "Página de categorías", division: "Cauchos", defaultSrc: "/cauchos-category-banner.jpg", dims: "1920 × 217 px" },
  { key: "import-oferta-1", label: "Import · Oferta 1", group: "Import", division: "Import", defaultSrc: "/geu-import-main-banner.png", dims: "1024 × 1792 px" },
  { key: "import-oferta-2", label: "Import · Oferta 2", group: "Import", division: "Import", defaultSrc: "/home-import.png", dims: "1024 × 1792 px" },
  { key: "import-oferta-3", label: "Import · Oferta 3", group: "Import", division: "Import", defaultSrc: "/import-hero-banner.png", dims: "1024 × 1792 px" },
  { key: "import-oferta-4", label: "Import · Oferta 4", group: "Import", division: "Import", defaultSrc: "/import-hero-crop.png", dims: "1024 × 1792 px" },
  { key: "import-destacada-1", label: "Import · Destacada 1", group: "Import", division: "Import", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "import-destacada-2", label: "Import · Destacada 2", group: "Import", division: "Import", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "import-destacada-3", label: "Import · Destacada 3", group: "Import", division: "Import", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "import-destacada-4", label: "Import · Destacada 4", group: "Import", division: "Import", defaultSrc: "/featured-cauchos-temp.jpg", dims: "900 × 250 px" },
  { key: "import-cierre", label: "Import · Banner de cierre", group: "Import", division: "Import", defaultSrc: "/geu-import-main-banner.png", dims: "1920 × 217 px" },
  { key: "innovation-oferta-1", label: "Innovation · Oferta 1", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1024 × 1792 px" },
  { key: "innovation-oferta-2", label: "Innovation · Oferta 2", group: "Innovation", division: "Innovation", defaultSrc: "/home-innovation.png", dims: "1024 × 1792 px" },
  { key: "innovation-oferta-3", label: "Innovation · Oferta 3", group: "Innovation", division: "Innovation", defaultSrc: "/cauchos-industria-banner.png", dims: "1024 × 1792 px" },
  { key: "innovation-oferta-4", label: "Innovation · Oferta 4", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1024 × 1792 px" },
  { key: "innovation-destacada-1", label: "Innovation · Destacada 1", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1792 × 1024 px" },
  { key: "innovation-destacada-2", label: "Innovation · Destacada 2", group: "Innovation", division: "Innovation", defaultSrc: "/home-innovation.png", dims: "1792 × 1024 px" },
  { key: "innovation-destacada-3", label: "Innovation · Destacada 3", group: "Innovation", division: "Innovation", defaultSrc: "/cauchos-industria-banner.png", dims: "1792 × 1024 px" },
  { key: "innovation-destacada-4", label: "Innovation · Destacada 4", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1792 × 1024 px" },
  { key: "innovation-cierre", label: "Innovation · Banner de cierre", group: "Innovation", division: "Innovation", defaultSrc: "/home-innovation.png", dims: "1920 × 217 px" },
  { key: "plastic-oferta-1", label: "Plastic · Oferta 1", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1024 × 1792 px" },
  { key: "plastic-oferta-2", label: "Plastic · Oferta 2", group: "Plastic", division: "Plastic", defaultSrc: "/home-plastic.png", dims: "1024 × 1792 px" },
  { key: "plastic-oferta-3", label: "Plastic · Oferta 3", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1024 × 1792 px" },
  { key: "plastic-oferta-4", label: "Plastic · Oferta 4", group: "Plastic", division: "Plastic", defaultSrc: "/home-plastic.png", dims: "1024 × 1792 px" },
  { key: "plastic-destacada-1", label: "Plastic · Destacada 1", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1792 × 1024 px" },
  { key: "plastic-destacada-2", label: "Plastic · Destacada 2", group: "Plastic", division: "Plastic", defaultSrc: "/home-plastic.png", dims: "1792 × 1024 px" },
  { key: "plastic-destacada-3", label: "Plastic · Destacada 3", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1792 × 1024 px" },
  { key: "plastic-destacada-4", label: "Plastic · Destacada 4", group: "Plastic", division: "Plastic", defaultSrc: "/home-plastic.png", dims: "1792 × 1024 px" },
  { key: "plastic-cierre", label: "Plastic · Banner de cierre", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1920 × 217 px" },
  { key: "energy-oferta-1", label: "Energy · Oferta 1", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-hero-field.png", dims: "1024 × 1792 px" },
  { key: "energy-oferta-2", label: "Energy · Oferta 2", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-wind-field.png", dims: "1024 × 1792 px" },
  { key: "energy-oferta-3", label: "Energy · Oferta 3", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-engineering.png", dims: "1024 × 1792 px" },
  { key: "energy-oferta-4", label: "Energy · Oferta 4", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-impact.png", dims: "1024 × 1792 px" },
  { key: "energy-destacada-1", label: "Energy · Destacada 1", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-hero-field.png", dims: "1792 × 1024 px" },
  { key: "energy-destacada-2", label: "Energy · Destacada 2", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-wind-field.png", dims: "1792 × 1024 px" },
  { key: "energy-destacada-3", label: "Energy · Destacada 3", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-engineering.png", dims: "1792 × 1024 px" },
  { key: "energy-destacada-4", label: "Energy · Destacada 4", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-impact.png", dims: "1792 × 1024 px" },
  { key: "energy-cierre", label: "Energy · Banner de cierre", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-gus-home.png", dims: "1920 × 217 px" },
];

export type SiteImages = Record<string, string>;

export function resolveImage(key: string, siteImages: SiteImages): string {
  return siteImages[key] ?? IMAGE_SLOTS.find((s) => s.key === key)?.defaultSrc ?? "";
}
