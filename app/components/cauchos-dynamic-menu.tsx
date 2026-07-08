"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cauchosCategoriasNombres, slugify } from "../data/catalog";
import { useProducts } from "./products-provider";

const fallbackDepartments = [...cauchosCategoriasNombres];

const utilityNavItems: string[] = [];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function cleanCategory(value: string) {
  return value.replace(/^Línea\s+/i, "").trim();
}

export default function CauchosDynamicMenu({ basePath = "" }: { basePath?: string }) {
  const { products } = useProducts();
  const cauchosBasePath = basePath || "/cauchos";

  const menuData = useMemo(() => {
    const cauchosProducts = products.filter((product) => {
      const searchable = normalize(`${product.categoria} ${product.marca}`);

      return (
        (cauchosCategoriasNombres as readonly string[]).includes(product.categoria) ||
        searchable.includes("caucho") ||
        searchable.includes("universal de cauchos")
      );
    });
    const departmentMap = new Map<
      string,
      Map<string, typeof cauchosProducts>
    >();

    cauchosProducts.forEach((product) => {
      const department =
        cleanCategory(product.categoria) ||
        "Productos de caucho";
      const subcategory =
        product.subcategoria?.trim() ||
        "Productos";
      const subcategoryMap = departmentMap.get(department) || new Map();
      const existing = subcategoryMap.get(subcategory) || [];

      subcategoryMap.set(subcategory, [...existing, product]);
      departmentMap.set(department, subcategoryMap);
    });

    const departments = Array.from(departmentMap.entries()).map(
      ([title, subcategoryMap]) => ({
        title,
        subcategories: Array.from(subcategoryMap.entries()).map(
          ([name, items]) => ({
            name,
            items: items.slice(0, 8),
          }),
        ),
      }),
    );

    if (departments.length > 0) {
      return departments;
    }

    return fallbackDepartments.map((title) => ({
      title,
      subcategories: [],
    }));
  }, [products]);

  const navItems = [
    ...menuData.map((department) => ({
      label: department.title,
      href: `${basePath}#catalogo-cauchos`,
    })),
    ...utilityNavItems.map((label) => ({ label, href: `${basePath}#contacto` })),
  ];

  return (
    <div className="border-t border-slate-200 bg-white">
      <div className="group/menu relative">
        <nav className="mx-auto flex min-h-[58px] max-w-[1500px] items-stretch overflow-x-auto bg-white text-[10px] font-black uppercase tracking-[0.02em] text-slate-900">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-[148px] items-center justify-center border-b-2 border-transparent px-4 text-center leading-tight transition-colors duration-200 hover:border-[#075ed8] hover:bg-slate-50 hover:text-[#075ed8]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="pointer-events-none absolute inset-x-0 top-full z-50 hidden w-full border-y border-slate-200 bg-white text-slate-950 opacity-0 shadow-[0_24px_70px_rgba(15,23,42,0.16)] transition-opacity duration-200 group-hover/menu:pointer-events-auto group-hover/menu:block group-hover/menu:opacity-100">
          {menuData.some((department) => department.subcategories.length > 0) ? (
            <div className="mx-auto grid max-h-[540px] max-w-[1500px] gap-x-14 gap-y-9 overflow-y-auto px-8 py-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {menuData.flatMap((department) =>
                department.subcategories.map((subcategory) => {
                  const minorItems = Array.from(
                    new Map(
                      subcategory.items.map((product) => [
                        product.categoriaMenor || product.nombre,
                        product,
                      ]),
                    ).values(),
                  );

                  return (
                    <div key={`${department.title}-${subcategory.name}`}>
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
                }),
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-[1500px] px-8 py-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.14em] text-[#075ed8]">
                Catálogo en construcción
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Crea categorías, subcategorías y productos desde el panel maestro para llenar este menú.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
