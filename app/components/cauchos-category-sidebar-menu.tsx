"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import {
  cauchosCategorySubcategories,
  categoriasData,
  importCategoriasData,
  plasticCategoriasData,
  getCategoriasForDivision,
  slugify,
} from "../data/catalog";
import { useProducts } from "./products-provider";
import { useCauchosMenu } from "./cauchos-menu-context";
import CauchosTechnicalForm from "./cauchos-technical-form";
import CauchosProjectChat from "./cauchos-project-chat";
import { useSiteImages } from "./use-site-images";
import { useSiteTexts } from "./use-site-texts";
import { resolveImage } from "@/lib/image-slots";
import { resolveText, categoryLabelKey } from "@/lib/text-slots";
import type { DivisionName } from "@/lib/divisions";

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

function ForkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2v8M9 2v8M7 10a2 2 0 0 1-2-2V2M9 10v11M15 2c-1.5 1.5-2 3-2 5s.5 3.5 2 5v9" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-30 12 12)" />
      <path d="M11 8.5 15.5 15.5" />
    </svg>
  );
}

function SprayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 8h4v13H9zM11 8V4h2a2 2 0 0 1 2 2v2" />
      <path d="M16 6h3M16 9h4M16 3h2" />
    </svg>
  );
}

function MountainIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 19 9 8l4 6 2-3 6 8Z" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.3.6-2.3 1.3-3.2.2 1 1 1.7 1.7 1.4C9 8.8 9 6.4 12 3Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 7v10l8 4 8-4V7Z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </svg>
  );
}

function BrickIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="8" height="5" />
      <rect x="13" y="5" width="8" height="5" />
      <rect x="7" y="14" width="8" height="5" />
      <rect x="1.5" y="14" width="3" height="5" />
      <rect x="17.5" y="14" width="3" height="5" />
    </svg>
  );
}

function AnchorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v14M7 12H3a9 9 0 0 0 9 9 9 9 0 0 0 9-9h-4M6 12a6 6 0 0 0 6 6M18 12a6 6 0 0 1-6 6" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8 12 4l9 4-9 4-9-4Z" />
      <path d="M3 8v8l9 4 9-4V8M12 12v8" />
    </svg>
  );
}

function PencilRulerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m14.5 3.5 6 6L8 22l-6.5 1L2.5 16.5Z" />
      <path d="M12 6 18 12M4.5 19.5 7 22M2 21l1-1" />
    </svg>
  );
}

function ThreadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4c-3 3-3 13 0 16M12 4c3 3 3 13 0 16M4 12h16" />
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

// Icons for the placeholder subcategory circles (no real product photos yet
// for these industry sub-sectors), keyed by the subcategory column name.
const SUBCATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  Alimentos: ForkIcon,
  Farmacéuticos: PillIcon,
  Cosméticos: SprayIcon,
  Agroindustria: LeafIcon,
  Petróleo: DropletIcon,
  Minería: MountainIcon,
  Gas: FlameIcon,
  "Energías renovables": SunIcon,
  Petroquímica: FlaskIcon,
  Químico: FlaskIcon,
  Aseo: SprayIcon,
  Plásticos: CubeIcon,
  Construcción: BuildingIcon,
  Infraestructura: BuildingIcon,
  "Obra civil": BrickIcon,
  Cemento: BrickIcon,
  Agregados: MountainIcon,
  Transporte: TruckIcon,
  Logística: BoxIcon,
  "Puertos marítimos": AnchorIcon,
  Manufactura: GearIcon,
  Metalmecánica: ToolIcon,
  Siderúrgica: FlameIcon,
  Textiles: ThreadIcon,
  Ferretería: ToolIcon,
  Otros: BoxIcon,
};

const DEPARTMENT_COLORS: Record<string, string> = Object.fromEntries(
  [...categoriasData, ...importCategoriasData, ...plasticCategoriasData].map((item) => [item.nombre, item.color]),
);

type Props = {
  basePath?: string;
  division?: DivisionName;
  accent?: string;
};

export default function CauchosCategorySidebarMenu({
  basePath = "",
  division = "Cauchos",
  accent = "#075ed8",
}: Props) {
  const { products } = useProducts();
  const { isOpen, close } = useCauchosMenu();
  const siteImages = useSiteImages();
  const siteTexts = useSiteTexts();
  const categoryLabel = (nombre: string) => resolveText(categoryLabelKey(division, nombre), siteTexts, nombre);
  const cauchosBasePath = basePath || "/cauchos";
  const [activeDept, setActiveDept] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  const menuData = useMemo(() => {
    const fallbackDepartments = getCategoriasForDivision(division);
    const cauchosProducts = products.filter((product) => product.division === division);
    const departmentMap = new Map<string, Map<string, typeof cauchosProducts>>();

    cauchosProducts.forEach((product) => {
      const department = product.categoria.trim() || "Productos de caucho";
      const subcategory = product.subcategoria?.trim() || "Productos";
      const subcategoryMap = departmentMap.get(department) || new Map();
      const existing = subcategoryMap.get(subcategory) || [];

      subcategoryMap.set(subcategory, [...existing, product]);
      departmentMap.set(department, subcategoryMap);
    });

    const buildFromProducts = (subcategoryMap: Map<string, typeof cauchosProducts>) =>
      Array.from(subcategoryMap.entries()).map(([name, items]) => {
        const minorItems = Array.from(
          new Map(items.map((product) => [product.categoriaMenor || product.nombre, product])).values(),
        );
        const groupHref = `${cauchosBasePath}/categoria/${slugify(name)}`;

        return {
          name,
          image: items[0]?.imagen ?? null,
          groupHref,
          itemLinks: minorItems.map((product) => ({
            label: product.categoriaMenor || product.nombre,
            href: `${groupHref}/${slugify(product.categoriaMenor || product.nombre)}`,
          })),
        };
      });

    // Placeholder subcategory groups (invented names, no real products yet)
    // for departments still waiting on real catalog data from the admin
    // panel. Every link funnels to the department's own category page since
    // there's nothing to filter by yet.
    const buildFromPlaceholders = (title: string) => {
      const groups = cauchosCategorySubcategories[title];
      if (!groups) return [];

      const groupHref = `${cauchosBasePath}/categoria/${slugify(title)}`;
      return groups.map((group) => ({
        name: group.name,
        image: resolveImage(group.imageKey, siteImages),
        groupHref,
        itemLinks: group.items.map((label) => ({ label, href: groupHref })),
      }));
    };

    // Only this division's official categories are shown, in order, each
    // populated with whatever products already carry that category, or with
    // placeholder subcategory groups until real products are assigned.
    return fallbackDepartments.map((title) => {
      const subcategoryMap = departmentMap.get(title);
      const subcategories =
        subcategoryMap && subcategoryMap.size > 0
          ? buildFromProducts(subcategoryMap)
          : buildFromPlaceholders(title);

      return { title, subcategories };
    });
  }, [products, cauchosBasePath, division, siteImages]);

  const active = menuData.find((department) => department.title === activeDept) ?? null;

  // Match homecenter.com.co: the panel opens with the first department's
  // content already showing, rather than staying blank until the user
  // hovers something.
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveDept(menuData[0]?.title ?? null);
    }
  }

  if (!isOpen) {
    return null;
  }

  if (division === "Import") {
    return (
      <div
        className="absolute inset-x-0 top-full z-40 shadow-[0_32px_80px_rgba(0,0,0,0.35)]"
        style={{ "--brand-accent": accent } as CSSProperties}
      >
        <div className="fixed inset-0 -z-10" aria-hidden="true" onClick={close} />
        <nav className="border-t border-white/10 bg-[#0b0b0d]">
          <div className="mx-auto max-w-[1632px] px-8 py-7">
            <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/40">
              <span className="h-px w-8" style={{ backgroundColor: "var(--brand-accent)" }} />
              Categorías
            </p>
            <ul className="flex flex-wrap gap-x-11 gap-y-5">
              {importCategoriasData.map((category, index) => (
                <li key={category.nombre}>
                  <Link
                    href={`${cauchosBasePath}/categoria/${slugify(category.nombre)}`}
                    onClick={close}
                    className="group inline-flex items-baseline gap-2.5"
                  >
                    <span
                      className="font-mono text-[10px] font-medium tabular-nums text-white/30 transition-colors duration-200 group-hover:text-[var(--brand-accent)]"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="relative text-[13px] font-medium uppercase tracking-[0.05em] text-white/80 transition-colors duration-200 group-hover:text-white">
                      {categoryLabel(category.nombre)}
                      <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-[var(--brand-accent)] transition-all duration-300 ease-out group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-7 border-t border-white/10 pt-5">
              <CauchosProjectChat
                division="Import"
                triggerLabel={
                  <>
                    ¿Qué quieres importar?
                    <span className="ml-2">→</span>
                  </>
                }
                triggerClassName="inline-flex items-center text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--brand-accent)] transition-colors duration-200 hover:text-white"
              />
            </div>
          </div>
        </nav>
      </div>
    );
  }

  if (division === "Plastic") {
    return (
      <div
        className="absolute inset-x-0 top-full z-40 shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
        style={{ "--brand-accent": accent } as CSSProperties}
      >
        <div className="fixed inset-0 -z-10" aria-hidden="true" onClick={close} />
        <nav className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1632px] px-8 py-7">
            <p className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
              <span className="h-px w-8" style={{ backgroundColor: "var(--brand-accent)" }} />
              Categorías
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {plasticCategoriasData.map((category) => (
                <Link
                  key={category.nombre}
                  href={`${cauchosBasePath}/categoria/${slugify(category.nombre)}`}
                  onClick={close}
                  className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_rgba(15,23,42,0.12)]"
                >
                  <span className="text-[13px] font-bold uppercase leading-tight tracking-[0.02em] text-slate-800 transition-colors duration-200 group-hover:text-slate-950">
                    {categoryLabel(category.nombre)}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
              <CauchosProjectChat
                division="Plastic"
                triggerLabel={
                  <>
                    ¿Qué necesitas producir?
                    <span className="ml-2">→</span>
                  </>
                }
                triggerClassName="inline-flex items-center text-[13px] font-medium uppercase tracking-[0.05em] text-[var(--brand-accent)] transition-colors duration-200 hover:text-slate-950"
              />
            </div>
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-x-0 top-full z-40 border-t border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
      style={{ "--brand-accent": accent } as CSSProperties}
    >
      <div
        className="fixed inset-0 -z-10"
        aria-hidden="true"
        onClick={close}
      />
      <div className="relative" onMouseLeave={() => setActiveDept(null)}>
        <nav className="w-[540px] shrink-0 border-r border-slate-200 py-4">
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
                      isActive ? "bg-[#eef5ff] text-[var(--brand-accent)]" : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3 whitespace-nowrap">
                      <Icon />
                      {categoryLabel(department.title)}
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {active && (
          <div
            className="absolute top-0 z-50 min-h-[420px] max-h-[560px] overflow-y-auto border-l border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
            style={{ left: "540px", right: 0 }}
          >
            {active.subcategories.length === 0 && (
              <div className="flex h-full min-h-[350px] flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm font-bold text-slate-700">
                  Muy pronto vas a encontrar productos en {categoryLabel(active.title)}
                </p>
                <p className="text-[13px] text-slate-500">
                  Estamos cargando el catálogo de esta categoría.
                </p>
              </div>
            )}

            {active.subcategories.length > 0 && (
              <>
            <div className="mb-6 flex flex-wrap gap-x-14 gap-y-6 overflow-x-auto pb-1">
              {active.subcategories.slice(0, 10).map((subcategory) => {
                const SubIcon = SUBCATEGORY_ICONS[subcategory.name] ?? DEPARTMENT_ICONS[active.title] ?? GearIcon;
                const color = DEPARTMENT_COLORS[active.title] ?? accent;

                return (
                  <Link
                    key={subcategory.name}
                    href={subcategory.groupHref}
                    className="flex shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <span
                      className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200"
                      style={{ backgroundColor: subcategory.image ? undefined : `${color}1A` }}
                    >
                      {subcategory.image ? (
                        <Image
                          src={subcategory.image}
                          alt={subcategory.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <span style={{ color }}>
                          <SubIcon />
                        </span>
                      )}
                    </span>
                    <span className="max-w-[96px] text-xs font-bold leading-tight text-slate-800">
                      {subcategory.name}
                    </span>
                  </Link>
                );
              })}

              {division === "Cauchos" && (
                <CauchosTechnicalForm
                  triggerClassName="flex shrink-0 flex-col items-center gap-2 text-center"
                  triggerLabel={
                    <>
                      <span className="asesoria-tecnica-btn relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#dd1b44] bg-[#dd1b44]/10 text-[#dd1b44]">
                        <PencilRulerIcon />
                      </span>
                      <span className="max-w-[96px] text-xs font-bold leading-tight text-[#dd1b44]">
                        Diseña tu pieza
                      </span>
                    </>
                  }
                />
              )}
            </div>

            <div
              className="grid gap-x-8 gap-y-8 border-t border-slate-100 pt-6"
              style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
            >
              {active.subcategories.map((subcategory, index) => (
                <div
                  key={subcategory.name}
                  className={index === 0 ? "" : "border-l border-slate-100 pl-8"}
                >
                  <Link
                    href={subcategory.groupHref}
                    className="text-[13px] font-black tracking-[0.02em] hover:underline"
                    style={{ color: "var(--brand-accent)" }}
                  >
                    {subcategory.name} &gt;
                  </Link>
                  <div className="mt-3 grid gap-2 text-[13px] text-slate-900">
                    {subcategory.itemLinks.map((item, itemIndex) => (
                      <Link
                        key={`${subcategory.name}-${item.label}-${itemIndex}`}
                        href={item.href}
                        className="leading-5 hover:text-[var(--brand-accent)] hover:underline"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Link
                      href={subcategory.groupHref}
                      className="mt-1 text-[13px] font-semibold hover:underline"
                      style={{ color: "var(--brand-accent)" }}
                    >
                      Ver más &gt;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
