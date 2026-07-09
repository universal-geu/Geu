"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { categorias, slugify } from "../data/catalog";
import { useProducts } from "./products-provider";
import { useCauchosMenu } from "./cauchos-menu-context";

const fallbackDepartments = [...categorias];

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3h11v10a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V3Z" />
      <path d="M16 6h2a3 3 0 0 1 0 6h-2" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 9-6 15-15 15C5 10 11 4 20 4Z" />
      <path d="M5 19 15 9" />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-4 5-7 8.5-7 12a7 7 0 0 0 14 0c0-3.5-3-7-7-12Z" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V9l7-5 7 5v12" />
      <path d="M9 21v-6h4v6" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
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
  "Alimentos, Farmacéuticos y cosméticos": CupIcon,
  Agroindustria: LeafIcon,
  "Petróleo, minería, gas, energías renovables y petroquímica": DropletIcon,
  "Químico, aseo y plásticos": FlaskIcon,
  "Construcción, infraestructura, obra civil, cemento y agregados": BuildingIcon,
  "Transporte, logística y puertos marítimos": TruckIcon,
  "Manufactura, metalmecánica, siderúrgica y textiles": GearIcon,
  "Ferretería y otros": ToolIcon,
};

export default function CauchosCategorySidebarMenu({ basePath = "" }: { basePath?: string }) {
  const { products } = useProducts();
  const { isOpen, close } = useCauchosMenu();
  const cauchosBasePath = basePath || "/cauchos";
  const [activeDept, setActiveDept] = useState<string | null>(null);

  const menuData = useMemo(() => {
    const cauchosProducts = products.filter((product) => product.division === "Cauchos");
    const departmentMap = new Map<string, Map<string, typeof cauchosProducts>>();

    cauchosProducts.forEach((product) => {
      const department = product.categoria.trim() || "Productos de caucho";
      const subcategory = product.subcategoria?.trim() || "Productos";
      const subcategoryMap = departmentMap.get(department) || new Map();
      const existing = subcategoryMap.get(subcategory) || [];

      subcategoryMap.set(subcategory, [...existing, product]);
      departmentMap.set(department, subcategoryMap);
    });

    const toDepartment = (title: string, subcategoryMap?: Map<string, typeof cauchosProducts>) => ({
      title,
      subcategories: subcategoryMap
        ? Array.from(subcategoryMap.entries()).map(([name, items]) => ({
            name,
            items: items.slice(0, 8),
          }))
        : [],
    });

    // Always list the 8 official categories, in order, populated with whatever
    // products already carry that category. Any other category value still
    // present on older products (not yet recategorized from the admin panel)
    // is appended after, so nothing disappears from navigation silently.
    const officialDepartments = fallbackDepartments.map((title) =>
      toDepartment(title, departmentMap.get(title)),
    );
    const extraDepartments = Array.from(departmentMap.entries())
      .filter(([title]) => !fallbackDepartments.includes(title))
      .map(([title, subcategoryMap]) => toDepartment(title, subcategoryMap));

    return [...officialDepartments, ...extraDepartments];
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
          className="w-[500px] shrink-0 border-r border-slate-200 py-4"
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
                    className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left text-[13px] font-bold transition-colors duration-150 ${
                      isActive ? "bg-[#eef5ff] text-[#075ed8]" : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3 whitespace-nowrap">
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
            style={{ left: "max(500px, calc(50% - 750px + 500px))", right: 0 }}
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
