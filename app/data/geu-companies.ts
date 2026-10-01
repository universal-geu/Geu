export const geuCompanies = [
  {
    name: "Universal de Cauchos",
    shortName: "Cauchos",
    slug: "cauchos",
    href: "/cauchos",
    eyebrow: "Universal de",
    title: "Cauchos",
    description: "Soluciones en caucho para múltiples industrias.",
    longDescription:
      "Unidad especializada en materiales, piezas y soluciones de caucho para aplicaciones industriales, comerciales y técnicas.",
    accent: "#138dff",
    sector: "Caucho industrial",
    focus: ["Laminas", "Mangueras", "Sellos", "Desarrollo a medida"],
  },
  {
    name: "GEU Import",
    shortName: "Import",
    slug: "import",
    href: "/import",
    eyebrow: "GEU",
    title: "Import",
    description: "Comercio internacional con alcance global.",
    longDescription:
      "Unidad de importación, abastecimiento y gestión comercial para conectar productos, proveedores y mercados.",
    accent: "#ff1818",
    sector: "Comercio internacional",
    focus: ["Importaciones", "Logística", "Proveedores", "Abastecimiento"],
  },
  {
    name: "GEU Structure",
    shortName: "Structure",
    slug: "innovation",
    href: "/structure",
    eyebrow: "GEU",
    title: "Structure",
    description: "Estructuras metálicas galvanizadas para proyectos fotovoltaicos.",
    longDescription:
      "Unidad de soluciones estructurales para plantas solares: ingeniería, fabricación de perfilería en acero, galvanizado por inmersión en caliente y servicios de campo, del terreno al montaje.",
    accent: "#0498b4",
    sector: "Estructuras para energía solar",
    focus: ["Ingeniería estructural", "Fabricación en acero", "Galvanizado", "Montaje en campo"],
  },
  {
    name: "GEU Energy",
    shortName: "Energy",
    slug: "energy",
    href: "/energy",
    eyebrow: "GEU",
    title: "Energy",
    description: "Energia sostenible para un futuro mejor.",
    longDescription:
      "Unidad orientada a energía sostenible, soluciones solares y proyectos de eficiencia para empresas y comunidades.",
    accent: "#fff100",
    sector: "Energia sostenible",
    focus: ["Solar", "Eficiencia", "Proyectos", "Sostenibilidad"],
  },
  {
    name: "GEU Plastic",
    shortName: "Plastic",
    slug: "plastic",
    href: "/plastic",
    eyebrow: "GEU",
    title: "Plastic",
    description: "Soluciones plásticas para aplicaciones industriales y comerciales.",
    longDescription:
      "Unidad de plásticos técnicos y soluciones transformadas para uso industrial, comercial y de manufactura.",
    accent: "#a3a3a4",
    sector: "Plásticos técnicos",
    focus: ["Perfiles", "Piezas", "Materia prima", "Aplicaciones industriales"],
  },
] as const;

export type GeuCompany = (typeof geuCompanies)[number];
