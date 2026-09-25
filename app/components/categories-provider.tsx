"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DivisionName } from "@/lib/divisions";
import type { CategoryRecord } from "@/lib/categories";

type CategoriesContextValue = {
  categories: CategoryRecord[];
  getCategoriesForDivision: (division: DivisionName) => CategoryRecord[];
  getCategoryNamesForDivision: (division: DivisionName) => string[];
  createCategory: (
    division: DivisionName,
    name: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  renameCategory: (
    id: string,
    name: string,
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  removeCategory: (id: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  reorderCategories: (
    division: DivisionName,
    orderedIds: string[],
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
  refreshCategories: () => Promise<void>;
};

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({
  children,
  initialCategories,
}: {
  children: ReactNode;
  initialCategories: CategoryRecord[];
}) {
  const [categories, setCategories] = useState<CategoryRecord[]>(initialCategories);

  const byDivision = useMemo(() => {
    const map = new Map<DivisionName, CategoryRecord[]>();
    for (const category of categories) {
      const list = map.get(category.division) ?? [];
      list.push(category);
      map.set(category.division, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.order - b.order);
    }
    return map;
  }, [categories]);

  const value: CategoriesContextValue = {
    categories,
    getCategoriesForDivision: (division) => byDivision.get(division) ?? [],
    getCategoryNamesForDivision: (division) => (byDivision.get(division) ?? []).map((c) => c.name),
    createCategory: async (division, name) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const payload = (await response.json()) as { error?: string; category?: CategoryRecord };
      if (!response.ok || !payload.category) {
        return { ok: false, message: payload.error || "No fue posible crear la categoría." };
      }

      setCategories((current) => [...current, payload.category!]);
      return { ok: true };
    },
    renameCategory: async (id, name) => {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const payload = (await response.json()) as { error?: string; category?: CategoryRecord };
      if (!response.ok || !payload.category) {
        return { ok: false, message: payload.error || "No fue posible renombrar la categoría." };
      }

      setCategories((current) => current.map((c) => (c.id === id ? payload.category! : c)));
      return { ok: true };
    },
    removeCategory: async (id) => {
      const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return { ok: false, message: payload.error || "No fue posible eliminar la categoría." };
      }

      setCategories((current) => current.filter((c) => c.id !== id));
      return { ok: true };
    },
    reorderCategories: async (division, orderedIds) => {
      const response = await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        return { ok: false, message: payload.error || "No fue posible actualizar el orden." };
      }

      setCategories((current) => {
        const others = current.filter((c) => c.division !== division);
        const reordered = orderedIds
          .map((id, index) => {
            const category = current.find((c) => c.id === id);
            return category ? { ...category, order: index } : null;
          })
          .filter((c): c is CategoryRecord => c !== null);
        return [...others, ...reordered];
      });

      return { ok: true };
    },
    refreshCategories: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) return;

      const payload = (await response.json()) as { categories?: CategoryRecord[] };
      if (payload.categories) {
        setCategories(payload.categories);
      }
    },
  };

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within CategoriesProvider");
  }

  return context;
}
