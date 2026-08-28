export const DIVISIONS = ["Cauchos", "Import", "Innovation", "Energy", "Plastic", "GEU"] as const;

export type DivisionName = (typeof DIVISIONS)[number];

const SERVICE_DIVISIONS: readonly DivisionName[] = ["Innovation", "GEU"];

export function isServiceDivision(division: DivisionName) {
  return SERVICE_DIVISIONS.includes(division);
}

export const DIVISION_ADMIN_EMAILS: Record<DivisionName, string> = {
  Cauchos: "admin@geu.com.co",
  Import: "admin.import@geu.com.co",
  Innovation: "admin.innovation@geu.com.co",
  Energy: "admin.energy@geu.com.co",
  Plastic: "admin.plastic@geu.com.co",
  GEU: "admin.geu@geu.com.co",
};

export const DIVISION_ADMIN_PASSWORD = "123456789";

export const DIVISION_ADMIN_PIN = "1234";

export const DIVISION_ADMIN_NAMES: Record<DivisionName, string> = {
  Cauchos: "Administrador GEU",
  Import: "Administrador GEU Import",
  Innovation: "Administrador GEU Structure",
  Energy: "Administrador GEU Energy",
  Plastic: "Administrador GEU Plastic",
  GEU: "Administrador GEU Corporativo",
};

export type DivisionBrand = {
  label: string;
  accent: string;
  accentHover: string;
  logo: string;
  logoAlt: string;
  basePath: string;
};

export const DIVISION_BRAND: Record<DivisionName, DivisionBrand> = {
  Cauchos: {
    label: "Universal de Cauchos",
    accent: "#075ed8",
    accentHover: "#064fb7",
    logo: "/logo-universal-cauchos.png",
    logoAlt: "GEU Universal de Cauchos",
    basePath: "/cauchos",
  },
  Import: {
    label: "GEU Import",
    accent: "#e31313",
    accentHover: "#ba1010",
    logo: "/logo-geu-import.png",
    logoAlt: "GEU Import",
    basePath: "/import",
  },
  Innovation: {
    label: "GEU Structure",
    accent: "#0498b4",
    accentHover: "#037c92",
    logo: "/logo-geu-innovation.png",
    logoAlt: "GEU Structure",
    basePath: "/innovation",
  },
  Energy: {
    label: "GEU Energy",
    accent: "#d4a900",
    accentHover: "#b38f00",
    logo: "/logo-geu-energy.png",
    logoAlt: "GEU Energy",
    basePath: "/energy",
  },
  Plastic: {
    label: "GEU Plastic",
    accent: "#6b7280",
    accentHover: "#565c64",
    logo: "/logo-geu-plastic.png",
    logoAlt: "GEU Plastic",
    basePath: "/plastic",
  },
  GEU: {
    label: "GEU",
    accent: "#075ed8",
    accentHover: "#064fb7",
    logo: "/home-geu-logo.png",
    logoAlt: "GEU Grupo Empresarial Universal",
    basePath: "/quienes-somos",
  },
};

export const CART_ACCENT: Record<DivisionName, "blue" | "red" | "gray" | "gold"> = {
  Cauchos: "blue",
  Import: "red",
  Innovation: "blue",
  Energy: "gold",
  Plastic: "gray",
  GEU: "blue",
};

export function getDivisionFromBrandParam(brand: string | null | undefined): DivisionName {
  switch ((brand || "").toLowerCase()) {
    case "import":
      return "Import";
    case "innovation":
      return "Innovation";
    case "energy":
      return "Energy";
    case "plastic":
      return "Plastic";
    case "geu":
      return "GEU";
    default:
      return "Cauchos";
  }
}
