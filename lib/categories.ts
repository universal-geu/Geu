import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { DivisionName } from "@/lib/divisions";
import {
  categoriasData,
  importCategoriasData,
  plasticCategoriasData,
  energyCategoriasData,
} from "@/app/data/catalog";

export type CategoryRecord = {
  id: string;
  division: DivisionName;
  name: string;
  color: string;
  icon: string;
  imageKey: string | null;
  order: number;
};

type CategoryRow = {
  id: string;
  division: string;
  name: string;
  color: string;
  icon: string;
  imageKey: string | null;
  order: number;
};

function toRecord(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    division: row.division as DivisionName,
    name: row.name,
    color: row.color,
    icon: row.icon,
    imageKey: row.imageKey,
    order: row.order,
  };
}

const SEED_BY_DIVISION: Partial<
  Record<DivisionName, readonly { nombre: string; color: string; icono: string; imageKey?: string }[]>
> = {
  Cauchos: categoriasData,
  Import: importCategoriasData,
  Plastic: plasticCategoriasData,
  Energy: energyCategoriasData,
};

function fallbackFor(division: DivisionName): CategoryRecord[] {
  const seed = SEED_BY_DIVISION[division] ?? [];
  return seed.map((item, index) => ({
    id: `fallback:${division}:${item.nombre}`,
    division,
    name: item.nombre,
    color: item.color,
    icon: item.icono,
    imageKey: item.imageKey ?? null,
    order: index,
  }));
}

// cache()'d per request — the root layout and every brand page read
// categories, and without this each one was a separate remote DB call.
export const getAllCategories = cache(async function getAllCategories(): Promise<CategoryRecord[]> {
  if (!prisma) {
    return (Object.keys(SEED_BY_DIVISION) as DivisionName[]).flatMap((division) => fallbackFor(division));
  }

  try {
    const rows = await prisma.category.findMany({ orderBy: [{ division: "asc" }, { order: "asc" }] });
    if (rows.length === 0) {
      return (Object.keys(SEED_BY_DIVISION) as DivisionName[]).flatMap((division) => fallbackFor(division));
    }
    return rows.map(toRecord);
  } catch (error) {
    console.error("getAllCategories: fallo la consulta a la base de datos", error);
    return (Object.keys(SEED_BY_DIVISION) as DivisionName[]).flatMap((division) => fallbackFor(division));
  }
});

export const getCategoriesForDivision = cache(async function getCategoriesForDivision(
  division: DivisionName,
): Promise<CategoryRecord[]> {
  if (!prisma) {
    return fallbackFor(division);
  }

  try {
    const rows = await prisma.category.findMany({
      where: { division },
      orderBy: { order: "asc" },
    });
    if (rows.length === 0) {
      return fallbackFor(division);
    }
    return rows.map(toRecord);
  } catch (error) {
    console.error("getCategoriesForDivision: fallo la consulta a la base de datos", error);
    return fallbackFor(division);
  }
});

export async function getCategoryById(id: string): Promise<CategoryRecord | null> {
  if (!prisma) return null;

  const row = await prisma.category.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function createCategory(input: {
  division: DivisionName;
  name: string;
  color?: string;
  icon?: string;
}): Promise<CategoryRecord> {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");

  const name = input.name.trim();
  if (!name) throw new Error("NAME_REQUIRED");

  const existing = await prisma.category.findUnique({
    where: { division_name: { division: input.division, name } },
  });
  if (existing) throw new Error("DUPLICATE_NAME");

  const maxOrder = await prisma.category.aggregate({
    where: { division: input.division },
    _max: { order: true },
  });

  const row = await prisma.category.create({
    data: {
      division: input.division,
      name,
      color: input.color?.trim() || "#1971c2",
      icon: input.icon?.trim() || "◆",
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  return toRecord(row);
}

export async function renameCategory(id: string, name: string): Promise<CategoryRecord> {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("NAME_REQUIRED");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("NOT_FOUND");

  if (trimmed === category.name) {
    return toRecord(category);
  }

  const duplicate = await prisma.category.findUnique({
    where: { division_name: { division: category.division, name: trimmed } },
  });
  if (duplicate) throw new Error("DUPLICATE_NAME");

  const [updated] = await prisma.$transaction([
    prisma.category.update({ where: { id }, data: { name: trimmed } }),
    prisma.product.updateMany({
      where: { category: category.name, division: category.division },
      data: { category: trimmed },
    }),
  ]);

  return toRecord(updated);
}

export async function deleteCategory(id: string): Promise<void> {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("NOT_FOUND");

  const productsUsingIt = await prisma.product.count({
    where: { category: category.name, division: category.division },
  });
  if (productsUsingIt > 0) {
    const error = new Error("CATEGORY_IN_USE") as Error & { count?: number };
    error.count = productsUsingIt;
    throw error;
  }

  await prisma.category.delete({ where: { id } });
}

export async function reorderCategories(division: DivisionName, orderedIds: string[]): Promise<void> {
  if (!prisma) throw new Error("DATABASE_NOT_CONFIGURED");

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma!.category.updateMany({
        where: { id, division },
        data: { order: index },
      }),
    ),
  );
}
