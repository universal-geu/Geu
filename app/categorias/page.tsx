import { redirect } from "next/navigation";
import { DIVISION_BRAND, DIVISIONS, type DivisionName } from "@/lib/divisions";

const DIVISIONS_WITH_CATEGORY_ROUTE = new Set<DivisionName>(["Cauchos", "Import", "Plastic"]);

function normalizeDivision(value: string | undefined): DivisionName {
  return DIVISIONS.includes(value as DivisionName) ? (value as DivisionName) : "Cauchos";
}

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; division?: string }>;
}) {
  const params = await searchParams;
  const division = normalizeDivision(params.division);
  const basePath = DIVISION_BRAND[division].basePath;

  if (params.categoria && DIVISIONS_WITH_CATEGORY_ROUTE.has(division)) {
    redirect(`${basePath}/categoria/${params.categoria}`);
  }

  redirect(basePath);
}
