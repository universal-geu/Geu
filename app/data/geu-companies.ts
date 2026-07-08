export const geuCompanies = [
  {
    name: "Universal de Cauchos",
    shortName: "Cauchos",
    slug: "cauchos",
    href: "/cauchos",
    eyebrow: "Universal de",
    title: "Cauchos",
    description: "Soluciones en caucho para multiples industrias.",
    longDescription:
      "Unidad especializada en materiales, piezas y soluciones de caucho para aplicaciones industriales, comerciales y tecnicas.",
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
      "Unidad de importacion, abastecimiento y gestion comercial para conectar productos, proveedores y mercados.",
    accent: "#ff1818",
    sector: "Comercio internacional",
    focus: ["Importaciones", "Logistica", "Proveedores", "Abastecimiento"],
  },
  {
    name: "GEU Innovation",
    shortName: "Innovation",
    slug: "innovation",
    href: "/innovation",
    eyebrow: "GEU",
    title: "Innovation",
    description: "Desarrollamos soluciones innovadoras para transformar ideas en valor.",
    longDescription:
      "Unidad enfocada en ideacion, desarrollo tecnologico y soluciones nuevas para impulsar proyectos del grupo.",
    accent: "#16f6f2",
    sector: "Innovacion y tecnologia",
    focus: ["Prototipos", "Automatizacion", "Desarrollo", "Transformacion"],
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
      "Unidad orientada a energia sostenible, soluciones solares y proyectos de eficiencia para empresas y comunidades.",
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
    description: "Soluciones plasticas para aplicaciones industriales y comerciales.",
    longDescription:
      "Unidad de plasticos tecnicos y soluciones transformadas para uso industrial, comercial y de manufactura.",
    accent: "#a3a3a4",
    sector: "Plasticos tecnicos",
    focus: ["Perfiles", "Piezas", "Materia prima", "Aplicaciones industriales"],
  },
] as const;

export type GeuCompany = (typeof geuCompanies)[number];
