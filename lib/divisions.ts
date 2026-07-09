export const DIVISIONS = ["Cauchos", "Import", "Innovation", "Energy", "Plastic"] as const;

export type DivisionName = (typeof DIVISIONS)[number];

const SERVICE_DIVISIONS: readonly DivisionName[] = ["Innovation", "Energy", "Plastic"];

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
