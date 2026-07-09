"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { cauchosCategoriasNombres, slugify } from "../data/catalog";
import { useProducts } from "./products-provider";
import { useCauchosMenu } from "./cauchos-menu-context";

const fallbackDepartments = [...cauchosCategoriasNombres];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanCategory(value: string) {
  return value.replace(/^Línea\s+/i, "").trim();
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function SealIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.2" />
    </svg>
  );
}

function HoseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M4 6c3 0 3 4 6 4s3-4 6-4 3 4 6 4" />
      <path d="M4 16c3 0 3 4 6 4s3-4 6-4 3 4 6 4" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
      <circle cx="12" cy="12" r="4.2" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2 2.6-2.6Z" />
    </svg>
  );
}

const DEPARTMENT_ICONS: Record<string, () => React.JSX.Element> = {
  "Laminas y rollos": LayersIcon,
  "Sellos y empaques": SealIcon,
  Mangueras: HoseIcon,
  "Piezas tecnicas": GearIcon,
  "Fabricacion especial": ToolIcon,
};

export default function CauchosCategorySidebarMenu({ basePath = "" }: { basePath?: string }) {
  const { products } = useProducts();
  const { isOpen, close } = useCauchosMenu();
  const cauchosBasePath = basePath || "/cauchos";
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const menuData = useMemo(() => {
    const cauchosProducts = products.filter((product) => {
      const searchable = normalize(`${product.categoria} ${product.marca}`);

      return (
        (cauchosCategoriasNombres as readonly string[]).includes(product.categoria) ||
        searchable.includes("caucho") ||
        searchable.includes("universal de cauchos")
      );
    });
    const departmentMap = new Map<string, Map<string, typeof cauchosProducts>>();

    cauchosProducts.forEach((product) => {
      const department = cleanCategory(product.categoria) || "Productos de caucho";
      const subcategory = product.subcategoria?.trim() || "Productos";
      const subcategoryMap = departmentMap.get(department) || new Map();
      const existing = subcategoryMap.get(subcategory) || [];

      subcategoryMap.set(subcategory, [...existing, product]);
      departmentMap.set(department, subcategoryMap);
    });

    const departments = Array.from(departmentMap.entries()).map(([title, subcategoryMap]) => ({
      title,
      subcategories: Array.from(subcategoryMap.entries()).map(([name, items]) => ({
        name,
        items: items.slice(0, 8),
      })),
    }));

    if (departments.length > 0) {
      return departments;
    }

    return fallbackDepartments.map((title) => ({ title, subcategories: [] }));
  }, [products]);

  const active = menuData.find((department) => department.title === activeDept) ?? null;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute inset-x-0 top-full z-40 border-t border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
      <div
        className="fixed inset-0 -z-10"
        aria-hidden="true"
        onClick={close}
      />
      <div className="relative" onMouseLeave={() => setActiveDept(null)}>
        <nav
          className="w-[260px] shrink-0 border-r border-slate-200 py-4"
          style={{ marginLeft: "max(0px, calc(50% - 750px))" }}
        >
          <p className="px-5 pb-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Categorías
          </p>
          <ul>
            {menuData.map((department) => {
              const Icon = DEPARTMENT_ICONS[department.title] ?? GearIcon;
              const isActive = activeDept === department.title;

              return (
                <li key={department.title}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveDept(department.title)}
                    onClick={() => setActiveDept(isActive ? null : department.title)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-sm font-bold transition-colors duration-150 ${
                      isActive ? "bg-[#eef5ff] text-[#075ed8]" : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon />
                      {department.title}
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {active && active.subcategories.length > 0 && (
          <div
            className="absolute top-0 z-50 max-h-[560px] overflow-y-auto border-l border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
            style={{ left: "max(260px, calc(50% - 750px + 260px))", right: 0 }}
          >
            <div className="mb-8 flex gap-6 overflow-x-auto pb-2">
              {active.subcategories.slice(0, 10).map((subcategory) => {
                const firstProduct = subcategory.items[0];

                return (
                  <Link
                    key={subcategory.name}
                    href={`${cauchosBasePath}/categoria/${slugify(subcategory.name)}`}
                    className="flex shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <span className="relative block h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      {firstProduct && (
                        <Image
                          src={firstProduct.imagen}
                          alt={subcategory.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </span>
                    <span className="max-w-[84px] text-xs font-bold leading-tight text-slate-800">
                      {subcategory.name}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-x-10 gap-y-8 border-t border-slate-100 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {active.subcategories.map((subcategory) => {
                const minorItems = Array.from(
                  new Map(
                    subcategory.items.map((product) => [
                      product.categoriaMenor || product.nombre,
                      product,
                    ]),
                  ).values(),
                );

                return (
                  <div key={subcategory.name}>
                    <Link
                      href={`${cauchosBasePath}/categoria/${slugify(subcategory.name)}`}
                      className="text-[13px] font-black tracking-[0.02em] hover:underline"
                      style={{ color: "#075ed8" }}
                    >
                      {subcategory.name} &gt;
                    </Link>
                    <div className="mt-3 grid gap-2 text-[13px] text-slate-900">
                      {minorItems.map((product) => (
                        <Link
                          key={`${product.slug}-${product.categoriaMenor || product.nombre}`}
                          href={`${cauchosBasePath}/categoria/${slugify(subcategory.name)}/${slugify(product.categoriaMenor || product.nombre)}`}
                          className="leading-5 hover:text-[#075ed8] hover:underline"
                        >
                          {product.categoriaMenor || product.nombre}
                        </Link>
                      ))}
                      <Link
                        href={`${cauchosBasePath}/categoria/${slugify(subcategory.name)}`}
                        className="mt-1 text-[13px] font-semibold hover:underline"
                        style={{ color: "#075ed8" }}
                      >
                        Ver más &gt;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
