export const DIVISIONS = ["Cauchos", "Import", "Innovation", "Energy", "Plastic"] as const;

export type DivisionName = (typeof DIVISIONS)[number];

const SERVICE_DIVISIONS: readonly DivisionName[] = ["Innovation", "Energy"];

export function isServiceDivision(division: DivisionName) {
  return SERVICE_DIVISIONS.includes(division);
}

export const DIVISION_ADMIN_EMAILS: Record<DivisionName, string> = {
  Cauchos: "admin@geu.com.co",
  Import: "admin.import@geu.com.co",
  Innovation: "admin.innovation@geu.com.co",
  Energy: "admin.energy@geu.com.co",
  Plastic: "admin.plastic@geu.com.co",
};

export const DIVISION_ADMIN_PASSWORD = "123456789";

export const DIVISION_ADMIN_NAMES: Record<DivisionName, string> = {
  Cauchos: "Administrador GEU",
  Import: "Administrador GEU Import",
  Innovation: "Administrador GEU Innovation",
  Energy: "Administrador GEU Energy",
  Plastic: "Administrador GEU Plastic",
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
    label: "GEU Innovation",
    accent: "#0498b4",
    accentHover: "#037c92",
    logo: "/logo-geu-innovation.png",
    logoAlt: "GEU Innovation",
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
};

export const CART_ACCENT: Record<DivisionName, "blue" | "red" | "gray"> = {
  Cauchos: "blue",
  Import: "red",
  Innovation: "blue",
  Energy: "blue",
  Plastic: "gray",
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
    default:
      return "Cauchos";
  }
}
