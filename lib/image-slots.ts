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
  { key: "categoria-alimentos", label: "Categoría · Alimentos, Farmacéuticos y cosméticos", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/alimentos.jpg", dims: "600 × 600 px" },
  { key: "categoria-agroindustria", label: "Categoría · Agroindustria", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/agroindustria.jpg", dims: "600 × 600 px" },
  { key: "categoria-petroleo", label: "Categoría · Petróleo, minería, gas, energías renovables y petroquímica", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/petroleo.jpg", dims: "600 × 600 px" },
  { key: "categoria-quimico", label: "Categoría · Químico, aseo y plásticos", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/quimico.jpg", dims: "600 × 600 px" },
  { key: "categoria-construccion", label: "Categoría · Construcción, infraestructura, obra civil, cemento y agregados", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/construccion.jpg", dims: "600 × 600 px" },
  { key: "categoria-transporte", label: "Categoría · Transporte, logística y puertos marítimos", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/transporte.jpg", dims: "600 × 600 px" },
  { key: "categoria-manufactura", label: "Categoría · Manufactura, metalmecánica, siderúrgica y textiles", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/manufactura.jpg", dims: "600 × 600 px" },
  { key: "categoria-ferreteria", label: "Categoría · Ferretería y otros", group: "Categorías", division: "Cauchos", defaultSrc: "/subcategorias/ferreteria.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-alimentos", label: "Subcategoría · Alimentos", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/alimentos.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-farmaceuticos", label: "Subcategoría · Farmacéuticos", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/farmaceuticos.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-cosmeticos", label: "Subcategoría · Cosméticos", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/cosmeticos.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-agroindustria", label: "Subcategoría · Agroindustria", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/agroindustria.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-petroleo", label: "Subcategoría · Petróleo", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/petroleo.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-mineria", label: "Subcategoría · Minería", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/mineria.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-gas", label: "Subcategoría · Gas", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/gas.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-energias-renovables", label: "Subcategoría · Energías renovables", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/energias-renovables.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-petroquimica", label: "Subcategoría · Petroquímica", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/petroquimica.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-quimico", label: "Subcategoría · Químico", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/quimico.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-aseo", label: "Subcategoría · Aseo", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/aseo.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-plasticos", label: "Subcategoría · Plásticos", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/plasticos.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-construccion", label: "Subcategoría · Construcción", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/construccion.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-infraestructura", label: "Subcategoría · Infraestructura", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/infraestructura.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-obra-civil", label: "Subcategoría · Obra civil", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/obra-civil.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-cemento", label: "Subcategoría · Cemento", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/cemento.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-agregados", label: "Subcategoría · Agregados", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/agregados.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-transporte", label: "Subcategoría · Transporte", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/transporte.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-logistica", label: "Subcategoría · Logística", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/logistica.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-puertos-maritimos", label: "Subcategoría · Puertos marítimos", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/puertos-maritimos.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-manufactura", label: "Subcategoría · Manufactura", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/manufactura.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-metalmecanica", label: "Subcategoría · Metalmecánica", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/metalmecanica.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-siderurgica", label: "Subcategoría · Siderúrgica", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/siderurgica.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-textiles", label: "Subcategoría · Textiles", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/textiles.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-ferreteria", label: "Subcategoría · Ferretería", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/ferreteria.jpg", dims: "600 × 600 px" },
  { key: "subcategoria-otros", label: "Subcategoría · Otros", group: "Subcategorías (menú)", division: "Cauchos", defaultSrc: "/subcategorias/otros.jpg", dims: "600 × 600 px" },
  { key: "import-principal", label: "Import · Banner principal", group: "Import", division: "Import", defaultSrc: "/geu-import-main-banner.png", dims: "1632 × 612 px" },
  { key: "import-oferta-1", label: "Import · Oferta 1", group: "Import", division: "Import", defaultSrc: "/geu-import-main-banner.png", dims: "1024 × 1792 px" },
  { key: "import-oferta-2", label: "Import · Oferta 2", group: "Import", division: "Import", defaultSrc: "/home-import.png", dims: "1024 × 1792 px" },
  { key: "import-oferta-3", label: "Import · Oferta 3", group: "Import", division: "Import", defaultSrc: "/import-hero-banner.png", dims: "1024 × 1792 px" },
  { key: "import-oferta-4", label: "Import · Oferta 4", group: "Import", division: "Import", defaultSrc: "/import-hero-crop.png", dims: "1024 × 1792 px" },
  { key: "import-destacada-1", label: "Import · Destacada 1", group: "Import", division: "Import", defaultSrc: "/import-destacada-1.jpg", dims: "900 × 250 px" },
  { key: "import-destacada-2", label: "Import · Destacada 2", group: "Import", division: "Import", defaultSrc: "/import-destacada-2.jpg", dims: "900 × 250 px" },
  { key: "import-destacada-3", label: "Import · Destacada 3", group: "Import", division: "Import", defaultSrc: "/import-destacada-3.jpg", dims: "900 × 250 px" },
  { key: "import-destacada-4", label: "Import · Destacada 4", group: "Import", division: "Import", defaultSrc: "/import-destacada-4.jpg", dims: "900 × 250 px" },
  { key: "import-cierre", label: "Import · Banner de cierre", group: "Import", division: "Import", defaultSrc: "/geu-import-main-banner.png", dims: "1920 × 217 px" },
  { key: "innovation-principal", label: "Innovation · Imagen de portada del video", group: "Innovation", division: "Innovation", defaultSrc: "/geu-innovation-hero.png", dims: "1920 × 1080 px" },
  { key: "innovation-oferta-1", label: "Innovation · Oferta 1", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1024 × 1792 px" },
  { key: "innovation-oferta-2", label: "Innovation · Oferta 2", group: "Innovation", division: "Innovation", defaultSrc: "/home-innovation.png", dims: "1024 × 1792 px" },
  { key: "innovation-oferta-3", label: "Innovation · Oferta 3", group: "Innovation", division: "Innovation", defaultSrc: "/cauchos-industria-banner.png", dims: "1024 × 1792 px" },
  { key: "innovation-oferta-4", label: "Innovation · Oferta 4", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1024 × 1792 px" },
  { key: "innovation-destacada-1", label: "Innovation · Destacada 1", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1792 × 1024 px" },
  { key: "innovation-destacada-2", label: "Innovation · Destacada 2", group: "Innovation", division: "Innovation", defaultSrc: "/home-innovation.png", dims: "1792 × 1024 px" },
  { key: "innovation-destacada-3", label: "Innovation · Destacada 3", group: "Innovation", division: "Innovation", defaultSrc: "/cauchos-industria-banner.png", dims: "1792 × 1024 px" },
  { key: "innovation-destacada-4", label: "Innovation · Destacada 4", group: "Innovation", division: "Innovation", defaultSrc: "/innovation-hero-banner.png", dims: "1792 × 1024 px" },
  { key: "innovation-cierre", label: "Innovation · Banner de cierre", group: "Innovation", division: "Innovation", defaultSrc: "/home-innovation.png", dims: "1920 × 217 px" },
  { key: "plastic-principal", label: "Plastic · Banner principal", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1632 × 612 px" },
  { key: "plastic-oferta-1", label: "Plastic · Oferta 1", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-oferta-1.jpg", dims: "1024 × 1792 px" },
  { key: "plastic-oferta-2", label: "Plastic · Oferta 2", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-oferta-2.jpg", dims: "1024 × 1792 px" },
  { key: "plastic-oferta-3", label: "Plastic · Oferta 3", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-oferta-3.jpg", dims: "1024 × 1792 px" },
  { key: "plastic-oferta-4", label: "Plastic · Oferta 4", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-oferta-4.jpg", dims: "1024 × 1792 px" },
  { key: "plastic-destacada-1", label: "Plastic · Destacada 1", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-destacada-1.jpg", dims: "1792 × 1024 px" },
  { key: "plastic-destacada-2", label: "Plastic · Destacada 2", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-destacada-2.jpg", dims: "1792 × 1024 px" },
  { key: "plastic-destacada-3", label: "Plastic · Destacada 3", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-destacada-3.jpg", dims: "1792 × 1024 px" },
  { key: "plastic-destacada-4", label: "Plastic · Destacada 4", group: "Plastic", division: "Plastic", defaultSrc: "/plastic-destacada-4.jpg", dims: "1792 × 1024 px" },
  { key: "plastic-cierre", label: "Plastic · Banner de cierre", group: "Plastic", division: "Plastic", defaultSrc: "/geu-plastic-main-banner.png", dims: "1920 × 217 px" },
  { key: "energy-principal", label: "Energy · Imagen de portada del video", group: "Energy", division: "Energy", defaultSrc: "/geu-energy-hero-field.png", dims: "1920 × 1080 px" },
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

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov"];

export function isVideoUrl(url: string): boolean {
  const path = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext));
}
