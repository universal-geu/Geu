"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "../components/products-provider";
import { useCategories } from "../components/categories-provider";
import CategoryComboBox from "./category-combobox";
import MultiCategoryComboBox from "./multi-category-combobox";
import {
  cauchosCategorySubcategories,
  type Categoria,
  type ProductoCatalogo,
  type ProductoEspecificacion,
} from "../data/catalog";
import type { InventoryMovementSummary, StoreProduct } from "@/lib/products";
import { expandProductCategoryViews } from "@/lib/product-category-views";
import { matchesQuery } from "@/lib/text-match";
import type { DashboardMetrics, SalesReport, SalesReportOverview, ShippingStatus } from "@/lib/orders";
import type { AdminCustomer, CustomerPurchaseStatus } from "@/lib/customers";
import { formatOrderCode } from "@/lib/format-order";
import { IMAGE_SLOTS, isVideoUrl } from "@/lib/image-slots";
import { TEXT_SLOTS } from "@/lib/text-slots";
import { COLOR_SLOTS } from "@/lib/color-slots";
import {
  DIVISIONS,
  DIVISION_ADMIN_EMAILS,
  DIVISION_ADMIN_PASSWORD,
  DIVISION_ADMIN_PIN,
  DIVISION_BRAND,
  getDivisionFromBrandParam,
  isServiceDivision,
  type DivisionName,
} from "@/lib/divisions";
import type { CauchosSalesMode } from "@/lib/site-settings";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  hasAdminPermission,
  isToolAllowedForDivision,
  type AdminToolKey,
} from "@/lib/admin-permissions";
import GusOrderRunner from "../components/gus-order-runner";
import {
  formatShippingDestinationAddress,
  readShippingDestinations,
} from "@/lib/shipping-destinations";

const IMAGE_GROUP_SECTIONS: { label: string; groups: string[] }[] = [
  { label: "Sitio GEU Structure", groups: ["Sitio Structure"] },
  { label: "Página principal", groups: ["Página de inicio", "Ofertas", "Marcas destacadas"] },
  { label: "Quiénes somos", groups: ["Nosotros"] },
  { label: "Mi cuenta", groups: ["Mi cuenta"] },
  {
    label: "Catálogo",
    groups: ["Página de categorías", "Categorías", "Subcategorías (menú)"],
  },
  {
    label: "Innovation · Autoservicio inteligente",
    groups: [
      "Autoservicio · Inicio",
      "Autoservicio · Ofertas y destacadas",
      "Estufas",
      "Doypack",
    ],
  },
];

const IMAGE_GROUP_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="m21 15-5-5-11 11" />
  </svg>
);

type AdminBrandConfig = {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  logo: string;
  logoAlt: string;
  siteHref: string;
  productsHref: string;
  contactHref: string;
  accent: string;
  accentHover: string;
  sessionLabel: string;
};

const ADMIN_BRAND_CONFIG: Record<DivisionName, AdminBrandConfig> = {
  Cauchos: {
    label: "Universal de Cauchos",
    eyebrow: "UNIVERSAL DE CAUCHOS",
    title: "Panel maestro de productos",
    description:
      "Desde aquí puedes crear, editar e inventariar productos de Universal de Cauchos para que aparezcan en el catálogo.",
    logo: "/logo-universal-cauchos.png",
    logoAlt: "GEU Universal de Cauchos",
    siteHref: "/cauchos",
    productsHref: "/cauchos#productos",
    contactHref: "/cauchos#contacto",
    accent: "#075ed8",
    accentHover: "#064fb7",
    sessionLabel: "Administrador GEU",
  },
  Import: {
    label: "GEU Import",
    eyebrow: "GEU IMPORT",
    title: "Panel maestro GEU Import",
    description:
      "Desde aquí puedes crear, editar e inventariar productos de GEU Import para que aparezcan en el catálogo.",
    logo: "/logo-geu-import.png",
    logoAlt: "GEU Import",
    siteHref: "/import",
    productsHref: "/import#productos",
    contactHref: "/import#contacto",
    accent: "#e31313",
    accentHover: "#ba1010",
    sessionLabel: "Administrador GEU Import",
  },
  Innovation: {
    label: "GEU Structure",
    eyebrow: "GEU STRUCTURE",
    title: "Panel maestro GEU Structure",
    description:
      "Desde aquí puedes crear y editar las fichas de servicio de GEU Structure para que aparezcan en el sitio.",
    logo: "/logo-geu-structure.png",
    logoAlt: "GEU Structure",
    siteHref: "/structure",
    productsHref: "/structure#producto",
    contactHref: "/structure#contacto",
    accent: "#0498b4",
    accentHover: "#037c92",
    sessionLabel: "Administrador GEU Structure",
  },
  Energy: {
    label: "GEU Energy",
    eyebrow: "GEU ENERGY",
    title: "Panel maestro GEU Energy",
    description:
      "Desde aquí puedes crear, editar e inventariar productos de GEU Energy para que aparezcan en el catálogo.",
    logo: "/logo-geu-energy.png",
    logoAlt: "GEU Energy",
    siteHref: "/energy",
    productsHref: "/energy#productos",
    contactHref: "/energy#contacto",
    accent: "#d4a900",
    accentHover: "#b38f00",
    sessionLabel: "Administrador GEU Energy",
  },
  Plastic: {
    label: "GEU Plastic",
    eyebrow: "GEU PLASTIC",
    title: "Panel maestro GEU Plastic",
    description:
      "Desde aquí puedes crear y editar las fichas de servicio de GEU Plastic para que aparezcan en el sitio.",
    logo: "/logo-geu-plastic.png",
    logoAlt: "GEU Plastic",
    siteHref: "/plastic",
    productsHref: "/plastic#productos",
    contactHref: "/plastic#contacto",
    accent: "#6b7280",
    accentHover: "#565c64",
    sessionLabel: "Administrador GEU Plastic",
  },
  GEU: {
    label: "GEU",
    eyebrow: "GEU CORPORATIVO",
    title: "Panel maestro GEU",
    description:
      "Desde aquí puedes editar las imágenes y textos de la página institucional \"Nosotros\" de GEU (grupoempresarialgeu.com).",
    logo: "/home-geu-logo.png",
    logoAlt: "GEU Grupo Empresarial Universal",
    siteHref: "/quienes-somos",
    productsHref: "/quienes-somos",
    contactHref: "/quienes-somos#contacto",
    accent: "#075ed8",
    accentHover: "#064fb7",
    sessionLabel: "Administrador GEU Corporativo",
  },
};

function hexToRgb(hex: string): string {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

const disponibilidades: ProductoCatalogo["disponibilidad"][] = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
];

type AdditionalCategoryFormItem = {
  id: string;
  categoria: string;
  subcategoria: string;
  categoriaMenor: string;
};

function createAdditionalCategoryItem(
  entry?: Partial<Omit<AdditionalCategoryFormItem, "id">>,
): AdditionalCategoryFormItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    categoria: entry?.categoria || "",
    subcategoria: entry?.subcategoria || "",
    categoriaMenor: entry?.categoriaMenor || "",
  };
}

type DivisionCategoriaFormItem = {
  division: DivisionName;
  categorias: string[];
  subcategorias: string[];
  categoriasMenores: string[];
};

function createDivisionCategoriaItem(
  entry: Partial<DivisionCategoriaFormItem> & { division: DivisionName },
): DivisionCategoriaFormItem {
  return {
    division: entry.division,
    categorias: entry.categorias || [],
    subcategorias: entry.subcategorias || [],
    categoriasMenores: entry.categoriasMenores || [],
  };
}

type FormState = {
  sku: string;
  oemReferencia: string;
  referenciasAlternas: string;
  categoria: string;
  subcategorias: string[];
  categoriasMenores: string[];
  categoriasAdicionales: AdditionalCategoryFormItem[];
  categoriasPorDivision: DivisionCategoriaFormItem[];
  nombre: string;
  marca: string;
  precioValor: string;
  precioAnteriorValor: string;
  displayPriceOverride: string;
  displaySecondaryLabel: string;
  stock: string;
  stockMinimo: string;
  disponibilidad: ProductoCatalogo["disponibilidad"];
  descripcion: string;
  aplicacion: string;
  compatibilidad: string;
  garantia: string;
};

const initialState: FormState = {
  sku: "",
  oemReferencia: "",
  referenciasAlternas: "",
  categoria: "",
  subcategorias: [],
  categoriasMenores: [],
  categoriasAdicionales: [],
  categoriasPorDivision: [],
  nombre: "",
  marca: "",
  precioValor: "",
  precioAnteriorValor: "",
  displayPriceOverride: "",
  displaySecondaryLabel: "",
  stock: "0",
  stockMinimo: "0",
  disponibilidad: "Entrega inmediata",
  descripcion: "",
  aplicacion: "",
  compatibilidad: "",
  garantia: "Garantía técnica según aplicación y condiciones de uso.",
};

type TechnicalSpecFormItem = {
  id: string;
  etiqueta: string;
  valor: string;
};

function createTechnicalSpecItem(
  spec?: Partial<ProductoEspecificacion>,
): TechnicalSpecFormItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    etiqueta: spec?.etiqueta || "",
    valor: spec?.valor || "",
  };
}

function normalizeTechnicalSpecFormItems(
  items: TechnicalSpecFormItem[],
): ProductoEspecificacion[] {
  return items
    .map((item) => ({
      etiqueta: item.etiqueta.trim(),
      valor: item.valor.trim(),
    }))
    .filter((item) => item.etiqueta && item.valor);
}

const MAX_VARIANTES = 50;

type VariantFormItem = {
  id: string;
  medida: string;
  sku: string;
  stock: string;
  precio: string;
};

function createVariantItem(variante?: {
  medida?: string;
  sku?: string;
  stock?: string;
  precio?: string;
}): VariantFormItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    medida: variante?.medida || "",
    sku: variante?.sku || "",
    stock: variante?.stock ?? "0",
    precio: variante?.precio ?? "",
  };
}

function normalizeVariantFormItems(items: VariantFormItem[]) {
  return items
    .map((item) => ({
      medida: item.medida.trim(),
      sku: item.sku.trim().toUpperCase(),
      stock: Math.max(0, Math.round(Number(item.stock) || 0)),
      precioValor: item.precio.trim() ? Math.max(1, Math.round(Number(item.precio))) : undefined,
    }))
    .filter((item) => item.medida && item.sku)
    .slice(0, MAX_VARIANTES);
}

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const RECOMMENDED_FILE_SIZE_KB = 500;
const EXTRA_IMAGE_SLOTS = 3;

// Matches categoria/subcategoria values ignoring case and stray whitespace,
// so a product saved as "ferretería y otros" still surfaces its subcategoría
// and categoría menor suggestions when the field later reads "Ferretería y otros".
function normalizeMatchKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}
const shippingStatuses: ShippingStatus[] = [
  "PENDING",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type AdminOrder = {
  id: string;
  orderNumber: number;
  status: "PENDING" | "PAID" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  shippingStatus: ShippingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company: string | null;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  adminNotes: string | null;
  notes: string | null;
  shippingDestinations: unknown;
  preparingAt: string | Date | null;
  shippedAt: string | Date | null;
  deliveredAt: string | Date | null;
  estimatedDeliveryAt: string | Date | null;
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  createdAt: string | Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    image: string;
    division: DivisionName;
    ownerDivision: DivisionName | null;
    variantSku: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

type OrderEditState = {
  shippingStatus: ShippingStatus;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  carrier: string;
  trackingNumber: string;
  adminNotes: string;
  estimatedDeliveryAt: string;
};

type QuoteStatusValue = "NEW" | "CONTACTED" | "CLOSED";

type AdminQuote = {
  id: string;
  fullName: string;
  company: string;
  nit: string;
  phone: string;
  division: string;
  requestType: string;
  productDetails: string;
  process: string[];
  conditions: string[];
  quantityAndDeadline: string;
  details?: Record<string, string> | null;
  adminNotes?: string | null;
  status: QuoteStatusValue;
  createdAt: string | Date;
};

const quoteStatuses: QuoteStatusValue[] = ["NEW", "CONTACTED", "CLOSED"];

function getQuoteStatusLabel(status: QuoteStatusValue) {
  if (status === "CONTACTED") return "Contactado";
  if (status === "CLOSED") return "Cerrado";
  return "Nueva";
}

const QUOTE_STATUS_THEME: Record<QuoteStatusValue, { dot: string; badgeBg: string; badgeText: string }> = {
  NEW: { dot: "#c98a1f", badgeBg: "#fff4e5", badgeText: "#a15c00" },
  CONTACTED: { dot: "var(--admin-accent)", badgeBg: "var(--admin-accent-soft)", badgeText: "var(--admin-accent)" },
  CLOSED: { dot: "#1f9d55", badgeBg: "#effaf2", badgeText: "#1f6b39" },
};

type ProductImageChoice = {
  label: string;
  image: string | null;
};

// wa.me needs the full international number with no symbols. GEU only
// sells in Colombia, so a bare 10-digit mobile (3xx…) gets the +57 prefix.
function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return digits;
  return digits.length >= 11 ? digits : "";
}

const INVENTORY_PAGE_SIZE = 10;

const INVENTORY_MOVEMENT_LABELS: Record<string, string> = {
  CREATED: "Producto creado",
  ADJUSTMENT: "Ajuste manual",
  ORDER_DEDUCTION: "Venta (pedido)",
};

// Page numbers with ellipses: 1 … 4 5 6 … 20
function getPageList(current: number, total: number): Array<number | "gap"> {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? (["gap", page] as const) : [page],
  );
}

function InventoryBoxIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </svg>
  );
}

function getInventoryTone(
  status?: ProductoCatalogo["estadoInventario"],
) {
  if (status === "out-of-stock") {
    return {
      label: "Agotado",
      className: "bg-[#fff1f1] text-[#c53b3b]",
      dot: "bg-[#c53b3b]",
    };
  }

  if (status === "low-stock") {
    return {
      label: "Stock bajo",
      className: "bg-[#fff6e5] text-[#9a6200]",
      dot: "bg-[#e0a100]",
    };
  }

  return {
    label: "En stock",
    className: "bg-[#effaf2] text-[#1f6b39]",
    dot: "bg-[#22a04b]",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function getShippingStatusLabel(status: ShippingStatus) {
  if (status === "PREPARING") return "En preparación";
  if (status === "SHIPPED") return "Enviado";
  if (status === "DELIVERED") return "Entregado";
  if (status === "CANCELLED") return "Cancelado";
  return "Pendiente";
}

const SHIPPING_STATUS_BADGE_CLASS: Record<ShippingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  PREPARING: "bg-emerald-50 text-emerald-700",
  SHIPPED: "bg-blue-50 text-blue-700",
  DELIVERED: "bg-emerald-600 text-white",
  CANCELLED: "bg-slate-200 text-slate-600",
};

const PREPARATION_LIMIT_MS = 24 * 60 * 60 * 1000;
const SHIPPING_LIMIT_MS = 3 * 24 * 60 * 60 * 1000;

function isOrderDelayed(order: AdminOrder) {
  if (
    order.shippingStatus === "SHIPPED" ||
    order.shippingStatus === "DELIVERED" ||
    order.shippingStatus === "CANCELLED"
  ) {
    return false;
  }

  const now = Date.now();

  if (now - new Date(order.createdAt).getTime() > SHIPPING_LIMIT_MS) {
    return true;
  }

  if (
    order.preparingAt &&
    now - new Date(order.preparingAt).getTime() > PREPARATION_LIMIT_MS
  ) {
    return true;
  }

  return false;
}

function getPaymentStatusLabel(status: "PENDING" | "PAID" | "FAILED") {
  if (status === "PAID") return "Pago confirmado";
  if (status === "FAILED") return "Pago fallido";
  return "Pago pendiente";
}

const CUSTOMER_STATUS_ORDER: CustomerPurchaseStatus[] = [
  "RECURRENT",
  "BUYER",
  "PAYMENT_PENDING",
  "CART",
  "NO_PURCHASES",
];

const CUSTOMER_STATUS_META: Record<CustomerPurchaseStatus, { label: string; className: string }> = {
  RECURRENT: { label: "Cliente recurrente", className: "bg-emerald-600 text-white" },
  BUYER: { label: "Ha comprado", className: "bg-emerald-50 text-emerald-700" },
  PAYMENT_PENDING: { label: "Pago pendiente", className: "bg-amber-50 text-amber-700" },
  CART: { label: "Carrito sin comprar", className: "bg-blue-50 text-blue-700" },
  NO_PURCHASES: { label: "Sin compras", className: "bg-slate-100 text-slate-600" },
};

type DashboardPreset = "all" | "today" | "yesterday" | "week" | "month" | "year" | "custom";
type DateRangePreset = Exclude<DashboardPreset, "custom">;
type DateInputRange = { from: string; to: string };

const DASHBOARD_PRESETS: Array<{ key: DateRangePreset; label: string; period: string }> = [
  { key: "today", label: "Hoy", period: "hoy" },
  { key: "yesterday", label: "Ayer", period: "ayer" },
  { key: "week", label: "Esta semana", period: "esta semana" },
  { key: "month", label: "Este mes", period: "este mes" },
  { key: "year", label: "Este año", period: "este año" },
];

// <input type="date"> values (YYYY-MM-DD) in the admin's local calendar.
function toLocalDateInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseDateInputValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const REPORT_PRESETS: Array<{ key: DateRangePreset; label: string; period: string }> = [
  { key: "all", label: "Todo", period: "todo el historial" },
  ...DASHBOARD_PRESETS,
];

// Inclusive first/last day of a preset, weeks starting on Monday. "all" is
// an open range (no dates sent to the API).
function getDashboardPresetRange(preset: DateRangePreset): DateInputRange {
  if (preset === "all") return { from: "", to: "" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  const to = new Date(today);

  if (preset === "yesterday") {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
  } else if (preset === "week") {
    from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
  } else if (preset === "month") {
    from.setDate(1);
  } else if (preset === "year") {
    from.setMonth(0, 1);
  }

  return { from: toLocalDateInputValue(from), to: toLocalDateInputValue(to) };
}

// Query string for the admin APIs: [from, to) as ISO instants, empty for "all".
function toDateRangeQuery(range: DateInputRange) {
  if (!range.from || !range.to) return "";
  const to = parseDateInputValue(range.to);
  to.setDate(to.getDate() + 1);
  return `?${new URLSearchParams({
    from: parseDateInputValue(range.from).toISOString(),
    to: to.toISOString(),
  })}`;
}

// Moves one end of a date range, keeping it valid (from <= to).
function updateDateInputRange(range: DateInputRange, field: "from" | "to", value: string): DateInputRange {
  const next = { ...range, [field]: value };
  if (!next.from) next.from = value;
  if (!next.to) next.to = value;
  if (next.from > next.to) {
    if (field === "from") next.to = value;
    else next.from = value;
  }
  return next;
}

function DateRangeFilter({
  presets,
  preset,
  range,
  accent,
  isLoading,
  onPresetChange,
  onDateChange,
}: {
  presets: Array<{ key: DateRangePreset; label: string }>;
  preset: DashboardPreset;
  range: DateInputRange;
  accent: string;
  isLoading: boolean;
  onPresetChange: (preset: DateRangePreset) => void;
  onDateChange: (field: "from" | "to", value: string) => void;
}) {
  const today = toLocalDateInputValue(new Date());

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[1.5rem] border border-black/8 bg-white p-2 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">
      {presets.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onPresetChange(item.key)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
            preset === item.key ? "text-white" : "text-[#5d6167] hover:bg-[#fafaf9]"
          }`}
          style={preset === item.key ? { backgroundColor: accent } : undefined}
        >
          {item.label}
        </button>
      ))}
      <div
        className={`ml-auto flex flex-wrap items-center gap-2 rounded-full px-3 py-1 ${
          preset === "custom" ? "ring-2 ring-[var(--admin-accent)]/30" : ""
        }`}
      >
        {(["from", "to"] as const).map((field) => (
          <label key={field} className="flex items-center gap-2 text-xs font-semibold text-[#8b8d91]">
            {field === "from" ? "Desde" : "Hasta"}
            <input
              type="date"
              value={range[field]}
              max={today}
              onChange={(event) => event.target.value && onDateChange(field, event.target.value)}
              className="rounded-full border border-black/10 bg-[#fafaf9] px-3 py-1.5 text-sm font-medium text-[#1f2328] outline-none focus:border-[var(--admin-accent)]"
            />
          </label>
        ))}
        {isLoading && <span className="text-xs text-[#8b8d91]">Actualizando…</span>}
      </div>
    </div>
  );
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

function getOrderEditState(order: AdminOrder): OrderEditState {
  return {
    shippingStatus: order.shippingStatus,
    paymentStatus: order.paymentStatus,
    carrier: order.carrier || "",
    trackingNumber: order.trackingNumber || "",
    adminNotes: order.adminNotes || "",
    estimatedDeliveryAt: toDateInputValue(order.estimatedDeliveryAt),
  };
}

// "YYYY-MM-DD" in Colombia time, for <input type="date">.
function toDateInputValue(value: string | Date | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
}

function getDerivedOrderStatus(
  shippingStatus: ShippingStatus,
  paymentStatus: "PENDING" | "PAID" | "FAILED",
): AdminOrder["status"] {
  if (shippingStatus === "CANCELLED") return "CANCELLED";
  if (paymentStatus === "PAID") return "PAID";
  return "PENDING";
}

function getAdminOrderProgressStep(order: AdminOrder) {
  if (order.shippingStatus === "DELIVERED") return 3;
  if (order.shippingStatus === "SHIPPED") return 2;
  if (order.shippingStatus === "PREPARING") return 1;
  if (order.paymentStatus === "PAID" || order.status === "PAID") return 0;
  return -1;
}

function AdminOrderProgress({ order }: { order: AdminOrder }) {
  const activeStep = getAdminOrderProgressStep(order);
  const steps = [
    {
      label: "Pedido confirmado",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3h9l3 3v15H6z" />
          <path d="M15 3v3h3" />
          <path d="M9 12h6" />
          <path d="M9 16h4" />
        </svg>
      ),
    },
    {
      label: "En preparación",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 4 7l8 4 8-4-8-4Z" />
          <path d="M4 7v10l8 4 8-4V7" />
          <path d="M12 11v10" />
        </svg>
      ),
    },
    {
      label: "Enviado",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7h11v8H3z" />
          <path d="M14 10h3l4 3v2h-7z" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="17.5" cy="17.5" r="1.5" />
        </svg>
      ),
    },
    {
      label: "Recibido",
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
            Flujo del pedido
          </p>
          <p className="mt-2 text-sm leading-7 text-[#6e7379]">
            Muestra el mismo progreso que verá el cliente en su cuenta.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#16384f] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
          {getShippingStatusLabel(order.shippingStatus)}
        </span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="relative min-w-[620px] px-1 py-2">
          <GusOrderRunner
            key={activeStep}
            activeStep={activeStep}
            stepCount={steps.length}
            cancelled={order.status === "CANCELLED" || order.shippingStatus === "CANCELLED"}
          />
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[80px] z-0">
            <span className="block h-[6px] rounded-full bg-[#d9dde4] shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)]" />
            <span
              className="absolute left-0 top-0 h-[6px] rounded-full bg-gradient-to-r from-[var(--admin-accent)] to-[var(--admin-accent-light)] shadow-[0_6px_16px_rgba(var(--admin-accent-rgb),0.25)] transition-all duration-300"
              style={{
                width:
                  activeStep < 0
                    ? "0%"
                    : `${(activeStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="relative flex items-start justify-between gap-0">
            {steps.map((step, index) => {
              const isCompleted = activeStep >= 0 && index <= activeStep;
              const isCurrent = index === activeStep;

              return (
                <div
                  key={step.label}
                  className="relative flex min-w-[136px] flex-1 flex-col items-center text-center"
                >
                  <span
                    className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                      isCompleted
                        ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
                        : "border-black/10 bg-[#f8f8f7] text-[#8b8d91]"
                    } ${isCurrent ? "shadow-[0_10px_24px_rgba(var(--admin-accent-rgb),0.2)]" : ""}`}
                  >
                    {step.icon}
                  </span>
                  <div className="mt-3">
                    <p
                      className={`text-sm font-semibold ${
                        isCompleted ? "text-[#16384f]" : "text-[#8b8d91]"
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--admin-accent)]">
                        Actual
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductImageSelector({
  choices,
  primaryImageIndex,
  onSelect,
  description,
}: {
  choices: ProductImageChoice[];
  primaryImageIndex: number;
  onSelect: (index: number) => void;
  description: string;
}) {
  return (
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4">
      <p className="text-sm font-medium text-[#4f545a]">Elegir imagen principal</p>
      <p className="mt-2 text-xs leading-6 text-[#6e7379]">{description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {choices.map((item, index) => {
          const hasImage = Boolean(item.image);

          return (
            <button
              key={`choice-${item.label}-${index}`}
              type="button"
              onClick={() => hasImage && onSelect(index)}
              disabled={!hasImage}
              className={`group rounded-[1.15rem] border p-2.5 text-left transition-all duration-200 ${
                primaryImageIndex === index && hasImage
                  ? "border-[#16384f] bg-white shadow-[0_14px_28px_rgba(22,56,79,0.12)]"
                  : "border-black/8 bg-white/96"
              } ${hasImage ? "hover:-translate-y-0.5 hover:border-[#16384f]/30" : "cursor-not-allowed opacity-55"}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a9da2]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-[#5c6167]">
                    {hasImage ? "Haz clic para usarla" : "Sin imagen"}
                  </p>
                </div>
                <div
                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    primaryImageIndex === index && hasImage
                      ? "bg-[#16384f] text-white"
                      : "border border-black/8 text-[#8b8d91]"
                  }`}
                >
                  {primaryImageIndex === index && hasImage ? "Principal" : "Vista"}
                </div>
              </div>
              <div className="mt-3 overflow-hidden rounded-[0.95rem] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f8_100%)]">
                {item.image ? (
                  <div className="relative p-2">
                    {primaryImageIndex === index && hasImage && (
                      <div className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--admin-accent)] text-white shadow-[0_10px_20px_rgba(var(--admin-accent-rgb),0.28)]">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4.5 10.5 8 14l7.5-8" />
                        </svg>
                      </div>
                    )}
                    <div className="overflow-hidden rounded-[0.8rem] bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.04)]">
                      <Image
                        src={item.image}
                        alt={`Opción ${item.label}`}
                        width={320}
                        height={240}
                        className="h-20 w-full object-cover md:h-24"
                        unoptimized={item.image.startsWith("blob:")}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center text-xs font-medium text-[#a2a5aa] md:h-28">
                    Sin imagen
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TechnicalSpecsEditor({
  items,
  onChange,
}: {
  items: TechnicalSpecFormItem[];
  onChange: (items: TechnicalSpecFormItem[]) => void;
}) {
  const updateItem = (id: string, field: "etiqueta" | "valor", value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createTechnicalSpecItem()]);
  };

  return (
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4f545a]">Ficha técnica del producto</p>
          <p className="mt-2 text-xs leading-6 text-[#6e7379]">
            Agrega solo las especificaciones que apliquen para este producto. Puedes dejar pocas o muchas.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
        >
          Agregar especificación
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-white px-4 py-5 text-sm text-[#6e7379]">
            Aún no hay especificaciones. Agrega las filas que necesites para esta categoría.
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-3 rounded-[1.2rem] border border-black/8 bg-white p-4 md:grid-cols-[220px_minmax(0,1fr)_auto]"
          >
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Etiqueta
              </span>
              <input
                value={item.etiqueta}
                onChange={(event) => updateItem(item.id, "etiqueta", event.target.value)}
                placeholder={index === 0 ? "Ej. Material" : "Nombre del dato"}
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Valor
              </span>
              <input
                value={item.valor}
                onChange={(event) => updateItem(item.id, "valor", event.target.value)}
                placeholder="Escribe la especificación"
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="inline-flex rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VariantesEditor({
  items,
  onChange,
}: {
  items: VariantFormItem[];
  onChange: (items: VariantFormItem[]) => void;
}) {
  const updateItem = (
    id: string,
    field: "medida" | "sku" | "stock" | "precio",
    value: string,
  ) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (items.length >= MAX_VARIANTES) return;
    onChange([...items, createVariantItem()]);
  };

  return (
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4f545a]">Medidas del producto</p>
          <p className="mt-2 text-xs leading-6 text-[#6e7379]">
            Agrega hasta {MAX_VARIANTES} medidas. Cada una tiene su propio SKU, stock y, si lo
            necesitas, un precio distinto al precio base (déjalo vacío para usar el precio del
            producto).
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= MAX_VARIANTES}
          className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#16384f]"
        >
          Agregar medida
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-white px-4 py-5 text-sm text-[#6e7379]">
            Aún no hay medidas. Agrega la primera fila.
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-3 rounded-[1.2rem] border border-black/8 bg-white p-4 md:grid-cols-[1fr_1fr_140px_140px_auto]"
          >
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Medida
              </span>
              <input
                value={item.medida}
                onChange={(event) => updateItem(item.id, "medida", event.target.value)}
                placeholder={index === 0 ? "Ej. 215/65 R16" : "Medida"}
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                SKU
              </span>
              <input
                value={item.sku}
                onChange={(event) => updateItem(item.id, "sku", event.target.value)}
                placeholder="Ej. IMP-215-65-R16"
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Precio
              </span>
              <input
                type="number"
                min="0"
                value={item.precio}
                onChange={(event) => updateItem(item.id, "precio", event.target.value)}
                placeholder="Precio base"
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                Stock
              </span>
              <input
                type="number"
                min="0"
                value={item.stock}
                onChange={(event) => updateItem(item.id, "stock", event.target.value)}
                className="w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="inline-flex rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function productSubcategoriesList(product: StoreProduct) {
  return product.subcategorias?.length
    ? product.subcategorias
    : [product.subcategoria].filter((v): v is string => Boolean(v));
}

function productMinorCategoriesList(product: StoreProduct) {
  return product.categoriasMenores?.length
    ? product.categoriasMenores
    : [product.categoriaMenor].filter((v): v is string => Boolean(v));
}

function getSubcategoryOptionsFor(categoria: string, adminProducts: StoreProduct[]) {
  const normalizedCategoria = normalizeMatchKey(categoria);
  const menuGroups = cauchosCategorySubcategories[categoria] ?? [];
  const fromMenu = menuGroups.map((group) => group.name);
  const fromProducts = adminProducts
    .filter((product) => normalizeMatchKey(product.categoria) === normalizedCategoria)
    .flatMap(productSubcategoriesList);

  return Array.from(new Set([...fromMenu, ...fromProducts])).sort((a, b) => a.localeCompare(b, "es"));
}

function getCategoriaMenorOptionsFor(
  categoria: string,
  subcategoria: string,
  adminProducts: StoreProduct[],
) {
  const normalizedCategoria = normalizeMatchKey(categoria);
  const normalizedSubcategoria = normalizeMatchKey(subcategoria);
  const menuGroups = cauchosCategorySubcategories[categoria] ?? [];
  const fromMenu =
    menuGroups.find((group) => normalizeMatchKey(group.name) === normalizedSubcategoria)?.items ?? [];
  const fromProducts = adminProducts
    .filter(
      (product) =>
        normalizeMatchKey(product.categoria) === normalizedCategoria &&
        (!normalizedSubcategoria ||
          productSubcategoriesList(product).some(
            (value) => normalizeMatchKey(value) === normalizedSubcategoria,
          )),
    )
    .flatMap(productMinorCategoriesList);

  return Array.from(new Set([...fromMenu, ...fromProducts])).sort((a, b) => a.localeCompare(b, "es"));
}

function AdditionalCategoriesEditor({
  items,
  categoryOptions,
  adminProducts,
  strictCategory,
  onChange,
}: {
  items: AdditionalCategoryFormItem[];
  categoryOptions: string[];
  adminProducts: StoreProduct[];
  strictCategory: boolean;
  onChange: (items: AdditionalCategoryFormItem[]) => void;
}) {
  const updateItem = (id: string, patch: Partial<Omit<AdditionalCategoryFormItem, "id">>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, createAdditionalCategoryItem()]);
  };

  return (
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#4f545a]">Este producto también aplica para otra categoría</p>
          <p className="mt-2 text-xs leading-6 text-[#6e7379]">
            Agrega categorías adicionales para que este mismo producto aparezca al navegar por ellas, sin duplicarlo.
          </p>
          {items.length > 0 && (
            <p className="mt-2 text-xs font-medium leading-6 text-[#b45309]">
              Los campos marcados con * son obligatorios. No podrás guardar el producto hasta completarlos o quitar la categoría adicional.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
        >
          Agregar a otra categoría
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 && (
          <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-white px-4 py-5 text-sm text-[#6e7379]">
            Este producto solo aparece en su categoría principal.
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="rounded-[1.2rem] border border-black/8 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <CategoryComboBox
                label="Categoría *"
                name={`categoriaAdicional-${item.id}`}
                value={item.categoria}
                options={categoryOptions}
                entityName="categoría"
                strict={strictCategory}
                required
                onChange={(value) =>
                  updateItem(item.id, { categoria: value, subcategoria: "", categoriaMenor: "" })
                }
              />

              {!strictCategory && (
                <>
                  <CategoryComboBox
                    label="Sub categoría *"
                    name={`subcategoriaAdicional-${item.id}`}
                    value={item.subcategoria}
                    options={getSubcategoryOptionsFor(item.categoria, adminProducts)}
                    entityName="subcategoría"
                    required
                    onChange={(value) => updateItem(item.id, { subcategoria: value, categoriaMenor: "" })}
                  />

                  <CategoryComboBox
                    label="Categoría menor *"
                    name={`categoriaMenorAdicional-${item.id}`}
                    value={item.categoriaMenor}
                    options={getCategoriaMenorOptionsFor(item.categoria, item.subcategoria, adminProducts)}
                    entityName="categoría menor"
                    required
                    onChange={(value) => updateItem(item.id, { categoriaMenor: value })}
                  />
                </>
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SELLABLE_DIVISIONS: DivisionName[] = ["Cauchos", "Import", "Plastic", "Energy"];

function AdditionalDivisionsEditor({
  currentDivision,
  items,
  allProducts,
  onChange,
}: {
  currentDivision: DivisionName;
  items: DivisionCategoriaFormItem[];
  allProducts: StoreProduct[];
  onChange: (items: DivisionCategoriaFormItem[]) => void;
}) {
  const { getCategoryNamesForDivision } = useCategories();
  const options = SELLABLE_DIVISIONS.filter((division) => division !== currentDivision);

  if (options.length === 0) return null;

  const toggle = (division: DivisionName) => {
    onChange(
      items.some((item) => item.division === division)
        ? items.filter((item) => item.division !== division)
        : [...items, createDivisionCategoriaItem({ division })],
    );
  };

  const updateItem = (
    division: DivisionName,
    patch: Partial<Omit<DivisionCategoriaFormItem, "division">>,
  ) => {
    onChange(
      items.map((item) =>
        item.division === division ? { ...item, ...patch } : item,
      ),
    );
  };

  return (
    <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5">
      <p className="text-sm font-medium text-[#4f545a]">
        Este producto también funciona para otra empresa GEU
      </p>
      <p className="mt-2 text-xs leading-6 text-[#6e7379]">
        Márcalas si este mismo producto debe aparecer también en el catálogo de esas empresas, sin duplicarlo.
        Elige en qué categoría de esa empresa debe aparecer.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {options.map((division) => (
          <label
            key={division}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[#4f545a] transition-colors duration-200 has-[:checked]:border-[var(--admin-accent)] has-[:checked]:text-[#16384f]"
          >
            <input
              type="checkbox"
              checked={items.some((item) => item.division === division)}
              onChange={() => toggle(division)}
            />
            {DIVISION_BRAND[division].label}
          </label>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-4 space-y-4">
          {items.map((item) => {
            const isCauchos = item.division === "Cauchos";
            // Sugerencias tomadas del catálogo REAL de la empresa destino
            // (no de la empresa que se está editando).
            const targetViews = isCauchos
              ? expandProductCategoryViews(allProducts, item.division)
              : [];
            const subcategoryOptionsForItem = Array.from(
              new Set(
                (item.categorias.length ? item.categorias : [""]).flatMap((categoria) =>
                  getSubcategoryOptionsFor(categoria, targetViews),
                ),
              ),
            ).sort((a, b) => a.localeCompare(b, "es"));
            const minorOptionsForItem = Array.from(
              new Set(
                (item.categorias.length ? item.categorias : [""]).flatMap((categoria) =>
                  (item.subcategorias.length ? item.subcategorias : [""]).flatMap((subcategoria) =>
                    getCategoriaMenorOptionsFor(categoria, subcategoria, targetViews),
                  ),
                ),
              ),
            ).sort((a, b) => a.localeCompare(b, "es"));
            return (
              <div
                key={item.division}
                className="rounded-[1.25rem] border border-black/8 bg-white p-4"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6e7379]">
                  {DIVISION_BRAND[item.division].label}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <MultiCategoryComboBox
                    label={`Categorías en ${DIVISION_BRAND[item.division].label}`}
                    name={`categoriaDivision-${item.division}`}
                    value={item.categorias}
                    options={getCategoryNamesForDivision(item.division)}
                    placeholder="Elige una o varias"
                    entityName="categoría"
                    strict={!isCauchos}
                    onChange={(value) => updateItem(item.division, { categorias: value })}
                  />

                  {isCauchos && (
                    <>
                      <MultiCategoryComboBox
                        label="Sub categorías"
                        name={`subcategoriaDivision-${item.division}`}
                        value={item.subcategorias}
                        options={subcategoryOptionsForItem}
                        entityName="subcategoría"
                        onChange={(value) => updateItem(item.division, { subcategorias: value })}
                      />

                      <MultiCategoryComboBox
                        label="Categorías menores"
                        name={`categoriaMenorDivision-${item.division}`}
                        value={item.categoriasMenores}
                        options={minorOptionsForItem}
                        entityName="categoría menor"
                        onChange={(value) =>
                          updateItem(item.division, { categoriasMenores: value })
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// Trim, drop empties, dedupe (case-insensitive) — for multi-select lists.
function cleanList(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    result.push(trimmed);
  }
  return result;
}

function SidebarIconShell({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function DashboardIcon() {
  return (
    <SidebarIconShell>
      <rect x="3" y="3" width="7" height="9" rx="1.4" />
      <rect x="14" y="3" width="7" height="5" rx="1.4" />
      <rect x="14" y="12" width="7" height="9" rx="1.4" />
      <rect x="3" y="16" width="7" height="5" rx="1.4" />
    </SidebarIconShell>
  );
}

function CreateIcon() {
  return (
    <SidebarIconShell>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </SidebarIconShell>
  );
}

function EditIcon() {
  return (
    <SidebarIconShell>
      <path d="M14.7 4.3a2.1 2.1 0 0 1 3 3L8.5 16.5 4 18l1.5-4.5Z" />
    </SidebarIconShell>
  );
}

function InventoryIcon() {
  return (
    <SidebarIconShell>
      <path d="M3 8 12 4l9 4-9 4-9-4Z" />
      <path d="M3 8v8l9 4 9-4V8M12 12v9" />
    </SidebarIconShell>
  );
}

function OrdersIcon() {
  return (
    <SidebarIconShell>
      <path d="M6 2h12l1 5H5Z" />
      <path d="M4 7h16l-1.2 12.2A2 2 0 0 1 16.8 21H7.2a2 2 0 0 1-2-1.8Z" />
      <path d="M9 11a3 3 0 0 0 6 0" />
    </SidebarIconShell>
  );
}

function QuotesIcon() {
  return (
    <SidebarIconShell>
      <path d="M4 5h16v11H8l-4 4Z" />
      <path d="M8 9h8M8 12h5" />
    </SidebarIconShell>
  );
}

function CategoriesIcon() {
  return (
    <SidebarIconShell>
      <path d="M3 11.5V5a2 2 0 0 1 2-2h6.5L21 12.5 12.5 21 3 11.5Z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </SidebarIconShell>
  );
}

function CustomersIcon() {
  return (
    <SidebarIconShell>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.3c2.6.5 4.4 2.6 4.4 5.2" />
    </SidebarIconShell>
  );
}

function ReportsIcon() {
  return (
    <SidebarIconShell>
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2 20h20" />
    </SidebarIconShell>
  );
}

function SettingsIcon() {
  return (
    <SidebarIconShell>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
    </SidebarIconShell>
  );
}

function CatalogIcon() {
  return (
    <SidebarIconShell>
      <path d="M5 4h11a2 2 0 0 1 2 2v14l-7.5-4L5 20Z" />
    </SidebarIconShell>
  );
}

function LogoutIcon() {
  return (
    <SidebarIconShell>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 16l4-4-4-4" />
      <path d="M19 12H9" />
    </SidebarIconShell>
  );
}

function ImagesSubIcon() {
  return (
    <SidebarIconShell>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 5-4.5 3.5 3L17 11l3.5 4.5" />
    </SidebarIconShell>
  );
}

function TextsSubIcon() {
  return (
    <SidebarIconShell>
      <path d="M5 4h14M5 9h14M5 14h9M5 19h6" />
    </SidebarIconShell>
  );
}

function ColorsSubIcon() {
  return (
    <SidebarIconShell>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a5 5 0 0 0 0 18 2.5 2.5 0 0 0 2.5-2.5c0-.7-.3-1.2-.7-1.7-.4-.5-.5-.8-.3-1.3.2-.4.7-.5 1.3-.5H16a5 5 0 0 0 5-5A9 9 0 0 0 12 3Z" />
      <circle cx="8" cy="11" r=".6" fill="currentColor" />
      <circle cx="12" cy="8" r=".6" fill="currentColor" />
      <circle cx="16" cy="11" r=".6" fill="currentColor" />
    </SidebarIconShell>
  );
}

function WhatsAppSubIcon() {
  return (
    <SidebarIconShell>
      <path d="M4 20l1.4-4.1A8 8 0 1 1 8.9 19Z" />
      <path d="M8.6 8.8c-.2.9.4 2.2 1.4 3.2s2.3 1.6 3.2 1.4" />
    </SidebarIconShell>
  );
}

function SalesModeSubIcon() {
  return (
    <SidebarIconShell>
      <rect x="2.5" y="7" width="19" height="12" rx="2.5" />
      <circle cx="8" cy="13" r="2.2" />
      <path d="M14 13h4.5" />
    </SidebarIconShell>
  );
}

const SETTINGS_SUB_ICONS: Record<
  "images" | "texts" | "colors" | "whatsapp" | "salesMode",
  () => React.JSX.Element
> = {
  images: ImagesSubIcon,
  texts: TextsSubIcon,
  colors: ColorsSubIcon,
  whatsapp: WhatsAppSubIcon,
  salesMode: SalesModeSubIcon,
};

function DashboardMetricIconShell({ children }: { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function DashboardMetricRevenueIcon() {
  return (
    <DashboardMetricIconShell>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 9.3c0-1.2 1.1-2 2.5-2s2.5.7 2.5 1.8c0 2.4-5 1.2-5 3.6 0 1.1 1.1 1.8 2.5 1.8s2.5-.8 2.5-2" />
    </DashboardMetricIconShell>
  );
}

function DashboardMetricOrdersIcon() {
  return (
    <DashboardMetricIconShell>
      <path d="M6 2h12l1 5H5Z" />
      <path d="M4 7h16l-1.2 12.2A2 2 0 0 1 16.8 21H7.2a2 2 0 0 1-2-1.8Z" />
    </DashboardMetricIconShell>
  );
}

function DashboardMetricTicketIcon() {
  return (
    <DashboardMetricIconShell>
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a1.6 1.6 0 0 0 0 3.2V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.8a1.6 1.6 0 0 0 0-3.2Z" />
    </DashboardMetricIconShell>
  );
}

function DashboardMetricCustomersIcon() {
  return (
    <DashboardMetricIconShell>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.3c2.6.5 4.4 2.6 4.4 5.2" />
    </DashboardMetricIconShell>
  );
}

function DashboardMetricClockIcon() {
  return (
    <DashboardMetricIconShell>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 1.8" />
    </DashboardMetricIconShell>
  );
}

function DashboardMetricAlertIcon() {
  return (
    <DashboardMetricIconShell>
      <path d="M12 3 2 20h20Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </DashboardMetricIconShell>
  );
}

function DashboardTrophyIcon() {
  return (
    <DashboardMetricIconShell>
      <path d="M7 4h10v4a5 5 0 0 1-10 0Z" />
      <path d="M7 5H4v1a4 4 0 0 0 3.5 4M17 5h3v1a4 4 0 0 1-3.5 4" />
      <path d="M12 13v3M9 20h6M10 17h4v3h-4Z" />
    </DashboardMetricIconShell>
  );
}

function DashboardTagIcon() {
  return (
    <DashboardMetricIconShell>
      <path d="M3 11.5V5a2 2 0 0 1 2-2h6.5L21 12.5 12.5 21 3 11.5Z" />
      <circle cx="7.5" cy="7.5" r="1.3" />
    </DashboardMetricIconShell>
  );
}

const SIDEBAR_ICONS: Partial<Record<AdminToolKey | "dashboard" | "overview", () => React.JSX.Element>> = {
  dashboard: DashboardIcon,
  create: CreateIcon,
  edit: EditIcon,
  inventory: InventoryIcon,
  orders: OrdersIcon,
  customers: CustomersIcon,
  quotes: QuotesIcon,
  categories: CategoriesIcon,
  reports: ReportsIcon,
  overview: ReportsIcon,
  settings: SettingsIcon,
};

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginDivision = getDivisionFromBrandParam(searchParams.get("brand"));
  const [adminDivision, setAdminDivision] = useState<DivisionName>(loginDivision);
  const adminBrand = ADMIN_BRAND_CONFIG[adminDivision];
  const isServiceAdmin = isServiceDivision(adminDivision);
  const {
    adminProducts: allAdminProducts,
    createProduct,
    updateProduct,
    removeProduct,
    adjustInventory,
    refreshProducts,
    loadFullCatalog,
  } = useProducts();
  // The shared product list starts out "light" (no specs/gallery/variants —
  // see lib/products.ts) so storefront pages stay fast. The admin edit form
  // needs every field, so upgrade it to the full catalog once when the
  // panel opens instead of every page paying for that weight up front.
  // loadFullCatalog is a new closure on every ProductsProvider render (it
  // captures setProducts) and calling it triggers exactly that re-render,
  // so depending on it here would refetch in a loop — mount-once is correct.
  useEffect(() => {
    void loadFullCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const {
    getCategoriesForDivision: getCategoryRecordsForDivision,
    getCategoryNamesForDivision,
    createCategory: createCategoryRequest,
    renameCategory: renameCategoryRequest,
    removeCategory: removeCategoryRequest,
    reorderCategories: reorderCategoriesRequest,
  } = useCategories();
  const adminProducts = useMemo(
    () => allAdminProducts.filter((product) => product.division === adminDivision),
    [allAdminProducts, adminDivision],
  );
  const [activeTab, setActiveTab] = useState<
    | "create"
    | "edit"
    | "inventory"
    | "orders"
    | "customers"
    | "quotes"
    | "categories"
    | "reports"
    | "overview"
    | "settings"
    | null
  >(null);
  const imageDivisionFilter = adminDivision;
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [siteImageLinks, setSiteImageLinks] = useState<Record<string, string>>({});
  const [savingLinkKey, setSavingLinkKey] = useState<string | null>(null);
  const [selectedImageGroup, setSelectedImageGroup] = useState<string | null>(null);
  const [imageViewMode, setImageViewMode] = useState<"web" | "movil">("web");
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);
  const [savedImageKey, setSavedImageKey] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageHistory, setImageHistory] = useState<Record<string, { url: string; createdAt: string }[]>>({});
  const [restoringHistoryKey, setRestoringHistoryKey] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [cauchosSalesMode, setCauchosSalesMode] = useState<CauchosSalesMode>("precios");
  const [isSavingSalesMode, setIsSavingSalesMode] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [siteColorsAdmin, setSiteColorsAdmin] = useState<Record<string, string>>({});
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);
  const [savingColorKey, setSavingColorKey] = useState<string | null>(null);
  const [savedColorKey, setSavedColorKey] = useState<string | null>(null);
  const [contentDrafts, setContentDrafts] = useState<
    Record<string, { kind: "image" | "text" | "color"; division: string; value: string; link: string | null }>
  >({});
  // Bumped on every draft save/discard so an in-flight loadContentDrafts()
  // response (e.g. from just opening the tab) can detect it's now stale and
  // skip overwriting the newer local state — see loadContentDrafts below.
  const contentDraftsMutationRef = useRef(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishNotice, setPublishNotice] = useState<string | null>(null);
  const [contentVersions, setContentVersions] = useState<
    { id: string; createdAt: string; createdBy: string | null; label: string | null; changedCount: number }[]
  >([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("geu-admin-sidebar-collapsed") === "1") {
      setIsSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("geu-admin-sidebar-collapsed", isSidebarCollapsed ? "1" : "0");
  }, [isSidebarCollapsed]);
  const [settingsSection, setSettingsSection] = useState<
    "images" | "texts" | "colors" | "whatsapp" | "salesMode" | null
  >(null);
  const [editSearch, setEditSearch] = useState("");
  const [editCategoryFilter, setEditCategoryFilter] = useState<"Todas" | Categoria>("Todas");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<
    "all" | "low-stock" | "out-of-stock"
  >("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerStatusFilter, setCustomerStatusFilter] = useState<CustomerPurchaseStatus | "all">("all");
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [orderShippingFilter, setOrderShippingFilter] = useState<
    "all" | ShippingStatus
  >("all");
  const [form, setForm] = useState<FormState>(initialState);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedExtraImages, setSelectedExtraImages] = useState<Array<File | null>>(
    () => Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null),
  );
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [technicalSpecs, setTechnicalSpecs] = useState<TechnicalSpecFormItem[]>([
    createTechnicalSpecItem({ etiqueta: "Observaciones" }),
  ]);
  const [variantMode, setVariantMode] = useState(false);
  const [variantes, setVariantes] = useState<VariantFormItem[]>([]);
  const canUseVariantMode =
    adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy" || adminDivision === "Cauchos";
  const isVariantModeActive = canUseVariantMode && variantMode;
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDivisionSwitcher, setShowDivisionSwitcher] = useState(true);
  const [isSwitchingDivision, setIsSwitchingDivision] = useState(false);
  const [switchDivisionError, setSwitchDivisionError] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [inventoryAdjustments, setInventoryAdjustments] = useState<Record<string, string>>({});
  const [inventoryPage, setInventoryPage] = useState(1);
  // Quick-edit modal opened by the pencil in the inventory list, so stock
  // fixes don't throw the admin out to the full product editor.
  const [inventoryEdit, setInventoryEdit] = useState<{
    slug: string;
    stock: string;
    stockMinimo: string;
    note: string;
  } | null>(null);
  const [isSavingInventoryEdit, setIsSavingInventoryEdit] = useState(false);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovementSummary[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [draggingQuoteId, setDraggingQuoteId] = useState<string | null>(null);
  const [quoteDropStatus, setQuoteDropStatus] = useState<QuoteStatusValue | null>(null);
  const [isSavingQuoteStatus, setIsSavingQuoteStatus] = useState(false);
  const [quoteNotesDraft, setQuoteNotesDraft] = useState("");
  const [prevSelectedQuoteId, setPrevSelectedQuoteId] = useState<string | null>(null);
  const [isSavingQuoteNotes, setIsSavingQuoteNotes] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [divisionOverview, setDivisionOverview] = useState<SalesReportOverview | null>(null);
  const [expandedOverviewDivision, setExpandedOverviewDivision] = useState<DivisionName | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [dashboardPreset, setDashboardPreset] = useState<DashboardPreset>("month");
  const [dashboardRange, setDashboardRange] = useState(() => getDashboardPresetRange("month"));
  const [reportsPreset, setReportsPreset] = useState<DashboardPreset>("all");
  const [reportsRange, setReportsRange] = useState<DateInputRange>({ from: "", to: "" });
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<OrderEditState>({
    shippingStatus: "PENDING",
    paymentStatus: "PENDING",
    carrier: "",
    trackingNumber: "",
    adminNotes: "",
    estimatedDeliveryAt: "",
  });
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const editFormRef = useRef<HTMLFormElement | null>(null);
  const orderCardsScrollRef = useRef<HTMLDivElement | null>(null);
  const editingProduct =
    adminProducts.find((product) => product.slug === editingSlug) ?? null;
  const previewImageUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }

    return editingProduct?.imagen ?? null;
  }, [editingProduct?.imagen, selectedImage]);
  const previewExtraImageUrls = useMemo(
    () =>
      Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, index) => {
        const file = selectedExtraImages[index];

        if (file) {
          return URL.createObjectURL(file);
        }

        return editingProduct?.imagenesExtra?.[index] ?? null;
      }),
    [editingProduct?.imagenesExtra, selectedExtraImages],
  );
  const productImageChoices = useMemo(
    () => [
      {
        label: "Principal",
        image: previewImageUrl,
      },
      ...previewExtraImageUrls.map((image, index) => ({
        label: `Extra ${index + 1}`,
        image,
      })),
    ],
    [previewExtraImageUrls, previewImageUrl],
  );
  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedOrderPreview = useMemo(() => {
    if (!selectedOrder) return null;

    return {
      ...selectedOrder,
      status: getDerivedOrderStatus(
        orderForm.shippingStatus,
        orderForm.paymentStatus,
      ),
      shippingStatus: orderForm.shippingStatus,
      paymentStatus: orderForm.paymentStatus,
      carrier: orderForm.carrier.trim() || null,
      trackingNumber: orderForm.trackingNumber.trim() || null,
      adminNotes: orderForm.adminNotes.trim() || null,
    };
  }, [orderForm, selectedOrder]);
  const selectedOrderDestinations = useMemo(
    () => readShippingDestinations(selectedOrder?.shippingDestinations),
    [selectedOrder],
  );
  // Only this division's official categories are selectable here — they're
  // the ones that actually appear in the storefront's category navigation.
  // Legacy seed products carry older category strings (e.g. "Mangueras",
  // "Sellos y empaques") that predate this taxonomy and aren't real nav
  // categories, so they're intentionally excluded from the picker.
  const categoryOptions = useMemo(
    () => getCategoryNamesForDivision(adminDivision),
    [adminDivision, getCategoryNamesForDivision],
  );
  const subcategoryOptions = useMemo(() => {
    const normalizedCategoria = normalizeMatchKey(form.categoria);
    const menuGroups = cauchosCategorySubcategories[form.categoria] ?? [];
    const fromMenu = menuGroups.map((group) => group.name);
    const fromProducts = adminProducts
      .filter((product) => normalizeMatchKey(product.categoria) === normalizedCategoria)
      .flatMap((product) => product.subcategorias || [product.subcategoria])
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...fromMenu, ...fromProducts])).sort((a, b) => a.localeCompare(b, "es"));
  }, [adminProducts, form.categoria]);
  const categoriaMenorOptions = useMemo(() => {
    const normalizedCategoria = normalizeMatchKey(form.categoria);
    const selectedSubcategorias = new Set(form.subcategorias.map(normalizeMatchKey));
    const menuGroups = cauchosCategorySubcategories[form.categoria] ?? [];
    const fromMenu = menuGroups
      .filter((group) => selectedSubcategorias.has(normalizeMatchKey(group.name)))
      .flatMap((group) => group.items);
    const fromProducts = adminProducts
      .filter(
        (product) =>
          normalizeMatchKey(product.categoria) === normalizedCategoria &&
          (selectedSubcategorias.size === 0 ||
            (product.subcategorias || [product.subcategoria]).some(
              (value) => value && selectedSubcategorias.has(normalizeMatchKey(value)),
            )),
      )
      .flatMap((product) => product.categoriasMenores || [])
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...fromMenu, ...fromProducts])).sort((a, b) => a.localeCompare(b, "es"));
  }, [adminProducts, form.categoria, form.subcategorias]);
  const stockAlerts = useMemo(() => {
    const divisionProducts = adminProducts.filter((product) => product.division === adminDivision);
    return {
      lowStock: divisionProducts.filter((product) => product.estadoInventario === "low-stock").length,
      outOfStock: divisionProducts.filter((product) => product.estadoInventario === "out-of-stock").length,
    };
  }, [adminProducts, adminDivision]);
  const filteredProducts = useMemo(() => {
    const search = editSearch.trim();

    return adminProducts.filter((product) => {
      const matchesCategory =
        editCategoryFilter === "Todas" || product.categoria === editCategoryFilter;
      const matchesSearch =
        search.length === 0 ||
        matchesQuery(
          [product.nombre, product.marca, product.sku, ...(product.variantes || []).map((v) => v.sku)]
            .filter((value): value is string => Boolean(value))
            .join(" "),
          search,
        );
      const matchesInventory =
        inventoryStatusFilter === "all" ||
        product.estadoInventario === inventoryStatusFilter;

      return matchesCategory && matchesSearch && matchesInventory;
    });
  }, [adminProducts, editCategoryFilter, editSearch, inventoryStatusFilter]);
  const inventoryCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of adminProducts) {
      counts[product.categoria] = (counts[product.categoria] ?? 0) + 1;
    }
    return counts;
  }, [adminProducts]);
  const inventoryTotalPages = Math.max(1, Math.ceil(filteredProducts.length / INVENTORY_PAGE_SIZE));
  // Clamped instead of reset-in-an-effect: a filter that shrinks the list
  // just lands on its last page.
  const currentInventoryPage = Math.min(inventoryPage, inventoryTotalPages);
  const inventoryPageProducts = filteredProducts.slice(
    (currentInventoryPage - 1) * INVENTORY_PAGE_SIZE,
    currentInventoryPage * INVENTORY_PAGE_SIZE,
  );
  const filteredCustomers = useMemo(() => {
    const search = customerSearch.trim();

    return customers.filter(
      (customer) =>
        (customerStatusFilter === "all" || customer.status === customerStatusFilter) &&
        (search.length === 0 ||
          matchesQuery(
            [customer.fullName, customer.email, customer.phone, customer.company, customer.city]
              .filter((value): value is string => Boolean(value))
              .join(" "),
            search,
          )),
    );
  }, [customerSearch, customerStatusFilter, customers]);

  const customerStatusCounts = useMemo(() => {
    const counts: Record<CustomerPurchaseStatus | "all", number> = {
      all: customers.length,
      RECURRENT: 0,
      BUYER: 0,
      PAYMENT_PENDING: 0,
      CART: 0,
      NO_PURCHASES: 0,
    };
    for (const customer of customers) counts[customer.status] += 1;
    return counts;
  }, [customers]);

  // Search first (it also drives the status chip counts), then the chip.
  const searchedOrders = useMemo(() => {
    const search = orderSearch.trim();
    if (!search) return orders;

    // A number ("12", "0012", "#0012") is an order code: match it exactly by
    // code prefix instead of fuzzily, or "0001" would also hit #0011, a "1/4"
    // in a product name, etc. Long digit runs can also be a phone/guide.
    const digits = search.replace(/^#/, "");
    if (/^\d+$/.test(digits)) {
      return orders.filter(
        (order) =>
          formatOrderCode(order.orderNumber).slice(1).startsWith(digits.padStart(Math.min(digits.length, 4), "0")) ||
          order.orderNumber === Number(digits) ||
          (digits.length >= 5 &&
            [order.customerPhone, order.trackingNumber].some((value) => value?.replace(/\D/g, "").includes(digits))),
      );
    }

    return orders.filter((order) =>
      matchesQuery(
        [
          formatOrderCode(order.orderNumber),
          order.customerName,
          order.customerEmail,
          order.city,
          order.trackingNumber,
          ...order.items.map((item) => item.name),
        ]
          .filter((value): value is string => Boolean(value))
          .join(" "),
        search,
      ),
    );
  }, [orderSearch, orders]);

  const filteredOrders = useMemo(
    () =>
      orderShippingFilter === "all"
        ? searchedOrders
        : searchedOrders.filter((order) => order.shippingStatus === orderShippingFilter),
    [orderShippingFilter, searchedOrders],
  );

  // Typing a search jumps straight to the first match when the open order
  // isn't among the results.
  const [prevOrderSearch, setPrevOrderSearch] = useState(orderSearch);
  if (orderSearch !== prevOrderSearch) {
    setPrevOrderSearch(orderSearch);
    const firstMatch = filteredOrders[0];
    if (orderSearch.trim() && firstMatch && !filteredOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(firstMatch.id);
      setOrderForm(getOrderEditState(firstMatch));
    }
  }

  const orderStatusCounts = useMemo(() => {
    const counts = { all: searchedOrders.length } as Record<"all" | ShippingStatus, number>;
    for (const status of shippingStatuses) {
      counts[status] = searchedOrders.filter((order) => order.shippingStatus === status).length;
    }
    return counts;
  }, [searchedOrders]);

  const quoteColumns = useMemo(() => {
    return quoteStatuses.map((status) => ({
      status,
      items: quotes.filter((quote) => quote.status === status),
    }));
  }, [quotes]);

  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId) ?? null;

  if (selectedQuoteId !== prevSelectedQuoteId) {
    setPrevSelectedQuoteId(selectedQuoteId);
    setQuoteNotesDraft(selectedQuote?.adminNotes || "");
  }

  const productCountLabel = `${adminProducts.length} producto${adminProducts.length === 1 ? "" : "s"} en catálogo`;

  useEffect(() => {
    if (previewImageUrl?.startsWith("blob:")) {
      return () => {
        URL.revokeObjectURL(previewImageUrl);
      };
    }
  }, [previewImageUrl]);

  useEffect(() => {
    return () => {
      previewExtraImageUrls.forEach((image) => {
        if (image?.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [previewExtraImageUrls]);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/account");

      if (!response.ok) {
        setIsAuthenticated(false);
        setAdminName("");
        setIsCheckingSession(false);
        return;
      }

      const payload = (await response.json()) as {
        user?: {
          id: string;
          fullName: string;
          role: "CUSTOMER" | "ADMIN";
          division?: DivisionName | null;
          permissions?: string[];
        };
      };

      if (payload.user?.role === "ADMIN" && payload.user.division) {
        const division = payload.user.division;
        const permissions = payload.user.permissions ?? [];
        setIsAuthenticated(true);
        setAdminName(payload.user.fullName);
        setAdminDivision(division);
        setAdminPermissions(permissions);

        const canAccess = (tool: AdminToolKey) =>
          isToolAllowedForDivision(division, tool) && hasAdminPermission(permissions, tool);

        if (canAccess("dashboard")) {
          void loadDashboardMetrics();
        } else {
          const fallback: Array<[AdminToolKey, () => void]> = [
            ["create", openCreateView],
            ["edit", openEditView],
            ...(isServiceDivision(division)
              ? []
              : ([["inventory", openInventoryView]] as Array<[AdminToolKey, () => void]>)),
            ["orders", openOrdersView],
            ["customers", openCustomersView],
            ["quotes", openQuotesView],
            ["reports", openReportsView],
            ["images", () => openSettingsSection("images")],
            ["settings", () => openSettingsSection("texts")],
          ];
          const firstAllowed = fallback.find(([tool]) => canAccess(tool));
          firstAllowed?.[1]();
        }

        if (canAccess("quotes")) {
          void loadQuotes();
        }

        void loadDivisionOverview();
      } else {
        setIsAuthenticated(false);
        setAdminName("");
      }

      setIsCheckingSession(false);
    })();
  }, []);

  useEffect(() => {
    if (activeTab === "edit" && editingSlug && editFormRef.current) {
      editFormRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeTab, editingSlug]);

  useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      const brandParam = searchParams.get("brand");
      router.replace(
        brandParam ? `/login?next=/admin&brand=${brandParam}` : "/login?next=/admin",
      );
    }
  }, [isAuthenticated, isCheckingSession, router, searchParams]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      setRequestError("La imagen supera el límite de 4 MB. Intenta con una versión más liviana.");
      setSelectedImage(null);
      setFileInputKey((current) => current + 1);
      return;
    }

    setRequestError("");
    setSelectedImage(file);
  };

  const handleExtraImageChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;

      if (file && file.size > MAX_FILE_SIZE_BYTES) {
        setRequestError("Una de las imágenes extra supera el límite de 4 MB. Intenta con una versión más liviana.");
        setSelectedExtraImages((current) =>
          current.map((item, itemIndex) => (itemIndex === index ? null : item)),
        );
        setFileInputKey((current) => current + 1);
        return;
      }

      setRequestError("");
      setSelectedExtraImages((current) =>
        current.map((item, itemIndex) => (itemIndex === index ? file : item)),
      );
    };

  const isStorageConfigurationError = (message?: string) =>
    Boolean(
      message?.includes("NEXT_PUBLIC_SUPABASE_URL") ||
        message?.includes("SUPABASE_SERVICE_ROLE_KEY") ||
        message?.toLowerCase().includes("storage"),
    );

  const uploadFileDirectToStorage = async (file: File, productName: string) => {
    const signResponse = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: file.name,
        productName,
        contentType: file.type,
        fileSize: file.size,
      }),
    });

    const signPayload = (await signResponse.json()) as {
      error?: string;
      path?: string;
      token?: string;
      bucket?: string;
      supabaseUrl?: string;
      anonKey?: string;
      publicUrl?: string;
    };

    if (!signResponse.ok || !signPayload.token || !signPayload.publicUrl) {
      return { error: signPayload.error, publicUrl: undefined as string | undefined };
    }

    const supabase = createSupabaseBrowserClient(signPayload.supabaseUrl!, signPayload.anonKey!);
    const { error: uploadError } = await supabase.storage
      .from(signPayload.bucket!)
      .uploadToSignedUrl(signPayload.path!, signPayload.token, file, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      return { error: uploadError.message, publicUrl: undefined as string | undefined };
    }

    return { error: undefined, publicUrl: signPayload.publicUrl };
  };

  const uploadProductImage = async (
    file: File,
    productName: string,
    fallbackUrl: string | null = adminBrand.logo,
  ) => {
    const { error, publicUrl } = await uploadFileDirectToStorage(file, productName);

    if (!publicUrl) {
      if (isStorageConfigurationError(error)) {
        return {
          publicUrl: fallbackUrl,
          usedFallback: true,
        };
      }

      throw new Error(error || "No fue posible subir la imagen a Supabase Storage.");
    }

    return {
      publicUrl,
      usedFallback: false,
    };
  };

  const uploadPdf = async (file: File, productName: string) => {
    const { error, publicUrl } = await uploadFileDirectToStorage(file, productName);

    if (!publicUrl) {
      throw new Error(error || "No fue posible subir la ficha técnica.");
    }

    return publicUrl;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProduct(true);
    setRequestError("");
    setToast(null);
    const isEditing = Boolean(editingSlug);

    const divisionSinCategoria = form.categoriasPorDivision.find(
      (item) => cleanList(item.categorias).length === 0,
    );
    if (divisionSinCategoria) {
      setIsSavingProduct(false);
      const label = DIVISION_BRAND[divisionSinCategoria.division].label;
      const message = `Elige al menos una categoría de ${label} para este producto.`;
      setRequestError(message);
      setToast({ tone: "error", message });
      return;
    }

    const strictCategoryAdicional =
      adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy";
    const categoriaAdicionalIncompleta = form.categoriasAdicionales.find(
      (item) =>
        item.categoria.trim() &&
        !strictCategoryAdicional &&
        (!item.subcategoria.trim() || !item.categoriaMenor.trim()),
    );
    if (categoriaAdicionalIncompleta) {
      setIsSavingProduct(false);
      const message =
        "Completa la sub categoría y la categoría menor de cada categoría adicional (o quítala si no aplica).";
      setRequestError(message);
      setToast({ tone: "error", message });
      return;
    }

    if (!editingSlug && !selectedImage) {
      setIsSavingProduct(false);
      setRequestError("Selecciona una imagen para el producto.");
      setToast({
        tone: "error",
        message: "Selecciona una imagen antes de guardar el producto.",
      });
      return;
    }

    let usedImageFallback = false;
    let imageUrl =
      adminProducts.find((product) => product.slug === editingSlug)?.imagen ||
      adminBrand.logo;
    let fichaTecnicaUrl = existingPdfUrl || undefined;

    try {
      if (selectedImage) {
        const uploadResult = await uploadProductImage(selectedImage, form.nombre);
        imageUrl = uploadResult.publicUrl || adminBrand.logo;
        usedImageFallback = usedImageFallback || uploadResult.usedFallback;
      }

      if (selectedPdf) {
        fichaTecnicaUrl = await uploadPdf(selectedPdf, form.nombre);
      }

      const currentExtraImages =
        adminProducts.find((product) => product.slug === editingSlug)?.imagenesExtra || [];
      const extraImageUrls = await Promise.all(
        Array.from({ length: EXTRA_IMAGE_SLOTS }, async (_, index) => {
          const selectedFile = selectedExtraImages[index];

          if (selectedFile) {
            const uploadResult = await uploadProductImage(
              selectedFile,
              `${form.nombre}-extra-${index + 1}`,
              null,
            );
            usedImageFallback = usedImageFallback || uploadResult.usedFallback;
            return uploadResult.publicUrl;
          }

          return currentExtraImages[index] || null;
        }),
      );

      const orderedImages = [imageUrl, ...extraImageUrls];
      const nextPrimaryImage = orderedImages[primaryImageIndex];

      if (!nextPrimaryImage) {
        setIsSavingProduct(false);
        setRequestError("Selecciona una imagen válida como principal.");
        setToast({
          tone: "error",
          message: "Selecciona una imagen válida como principal.",
        });
        return;
      }

      const reorderedExtraImages = orderedImages.filter(
        (image, index): image is string =>
          index !== primaryImageIndex && Boolean(image),
      );

      const normalizedVariantes = isVariantModeActive ? normalizeVariantFormItems(variantes) : [];
      const variantStockTotal = normalizedVariantes.reduce((total, item) => total + item.stock, 0);

      const payload = {
        sku: isVariantModeActive ? undefined : form.sku,
        oemReferencia: form.oemReferencia,
        referenciasAlternas: splitCommaSeparatedValues(form.referenciasAlternas),
        categoria: form.categoria,
        subcategorias: cleanList(form.subcategorias),
        categoriasMenores: cleanList(form.categoriasMenores),
        categoriasAdicionales: form.categoriasAdicionales
          .filter((item) => item.categoria.trim())
          .map((item) => ({
            categoria: item.categoria.trim(),
            subcategorias: item.subcategoria.trim() ? [item.subcategoria.trim()] : undefined,
            categoriasMenores: item.categoriaMenor.trim() ? [item.categoriaMenor.trim()] : undefined,
          })),
        nombre: form.nombre,
        marca: form.marca,
        division: adminDivision,
        divisionesAdicionales: form.categoriasPorDivision.map((item) => item.division),
        categoriasPorDivision: form.categoriasPorDivision.flatMap((item) =>
          cleanList(item.categorias).map((categoria) => ({
            division: item.division,
            categoria,
            subcategorias: cleanList(item.subcategorias),
            categoriasMenores: cleanList(item.categoriasMenores),
          })),
        ),
        precioValor: isServiceAdmin ? 1 : Number(form.precioValor),
        precioAnteriorValor: isServiceAdmin
          ? 1
          : Number(form.precioAnteriorValor || form.precioValor),
        displayPriceOverride: isServiceAdmin ? form.displayPriceOverride : undefined,
        displaySecondaryLabel: isServiceAdmin ? form.displaySecondaryLabel : undefined,
        stock: isServiceAdmin ? 0 : isVariantModeActive ? variantStockTotal : Number(form.stock),
        stockMinimo: isServiceAdmin ? 0 : Number(form.stockMinimo),
        imagen: nextPrimaryImage,
        imagenesExtra: reorderedExtraImages.slice(0, EXTRA_IMAGE_SLOTS),
        disponibilidad: isServiceAdmin ? "Disponible por pedido" : form.disponibilidad,
        descripcion: form.descripcion,
        aplicacion: form.aplicacion,
        compatibilidad: splitCommaSeparatedValues(form.compatibilidad),
        garantia: form.garantia,
        fichaTecnicaUrl,
        especificacionesTecnicas: normalizeTechnicalSpecFormItems(technicalSpecs),
        variantes: normalizedVariantes,
      };
      const result = editingSlug
        ? await updateProduct(editingSlug, payload)
        : await createProduct(payload);

      setIsSavingProduct(false);

      if (!result.ok) {
        const isStaleProduct = result.message.includes("No encontramos el producto");
        const message = isStaleProduct
          ? "Este producto ya no existe en el catálogo (puede que lo hayan renombrado o eliminado). Actualizamos la lista, ábrelo de nuevo si sigue existiendo."
          : result.message;

        if (isStaleProduct) {
          void refreshProducts();
        }

        setRequestError(message);
        setToast({
          tone: "error",
          message,
        });
        return;
      }

      setForm({ ...initialState, categoria: categoryOptions[0] ?? "" });
      setSelectedImage(null);
      setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
      setPrimaryImageIndex(0);
      setFileInputKey((current) => current + 1);
      setSelectedPdf(null);
      setExistingPdfUrl(null);
      setTechnicalSpecs([createTechnicalSpecItem({ etiqueta: "Observaciones" })]);
      setVariantMode(false);
      setVariantes([]);
      setEditingSlug(null);
      setActiveTab(null);
      setSaved(true);
      setToast({
        tone: "success",
        message: usedImageFallback
          ? "Producto guardado en local con imagen temporal. Configura Supabase Storage para subir fotos reales."
          : isEditing
            ? "Producto editado correctamente."
            : "Producto creado correctamente.",
      });
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      setIsSavingProduct(false);
      const message =
        error instanceof Error
          ? error.message
          : "No fue posible subir una de las imágenes.";
      setRequestError(message);
      setToast({
        tone: "error",
        message,
      });
    }
  };

  const handleEditProduct = (slug: string) => {
    const product = adminProducts.find((item) => item.slug === slug);
    if (!product) return;

    const precioAnteriorValor = Number(product.precioAnterior.replace(/\D/g, "")) || product.precioValor;

    setForm({
      sku: product.sku || "",
      oemReferencia: product.oemReferencia || "",
      referenciasAlternas: (product.referenciasAlternas || []).join(", "),
      categoria: product.categoria,
      subcategorias: product.subcategorias?.length
        ? product.subcategorias
        : [product.subcategoria].filter((v): v is string => Boolean(v)),
      categoriasMenores: product.categoriasMenores?.length
        ? product.categoriasMenores
        : [product.categoriaMenor].filter((v): v is string => Boolean(v)),
      categoriasAdicionales: (product.categoriasAdicionales || []).map((entry) =>
        createAdditionalCategoryItem({
          categoria: entry.categoria,
          subcategoria: entry.subcategorias?.[0] || "",
          categoriaMenor: entry.categoriasMenores?.[0] || "",
        }),
      ),
      categoriasPorDivision: (product.divisionesAdicionales || []).map((division) => {
        const entries = (product.categoriasPorDivision || []).filter(
          (entry) => entry.division === division,
        );
        return createDivisionCategoriaItem({
          division,
          categorias: cleanList(entries.map((entry) => entry.categoria)),
          subcategorias: cleanList(entries.flatMap((entry) => entry.subcategorias || [])),
          categoriasMenores: cleanList(entries.flatMap((entry) => entry.categoriasMenores || [])),
        });
      }),
      nombre: product.nombre,
      marca: product.marca,
      precioValor: String(product.precioValor),
      precioAnteriorValor: String(precioAnteriorValor),
      displayPriceOverride: product.displayPriceOverride || "",
      displaySecondaryLabel: product.displaySecondaryLabel || "",
      stock: String(product.stock ?? 0),
      stockMinimo: String(product.stockMinimo ?? 0),
      disponibilidad: product.disponibilidad,
      descripcion: product.descripcion || "",
      aplicacion: product.aplicacion || "",
      compatibilidad: (product.compatibilidad || []).join(", "),
      garantia: product.garantia || "",
    });
    setEditingSlug(product.slug);
    setActiveTab("edit");
    setSelectedImage(null);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setRequestError("");
    setFileInputKey((current) => current + 1);
    setSelectedPdf(null);
    setExistingPdfUrl(product.fichaTecnicaUrl || null);
    setTechnicalSpecs(
      (product.especificacionesTecnicas || []).length > 0
        ? (product.especificacionesTecnicas || []).map((item) => createTechnicalSpecItem(item))
        : [createTechnicalSpecItem({ etiqueta: "Observaciones" })],
    );
    setVariantMode(Boolean(product.variantes?.length));
    setVariantes(
      (product.variantes || []).map((variante) =>
        createVariantItem({
          medida: variante.medida,
          sku: variante.sku,
          stock: String(variante.stock),
          precio: variante.precioValor != null ? String(variante.precioValor) : "",
        }),
      ),
    );
  };

  const handleResetForm = () => {
    setForm({ ...initialState, categoria: categoryOptions[0] ?? "" });
    setSelectedImage(null);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setRequestError("");
    setFileInputKey((current) => current + 1);
    setSelectedOrderId(null);
    setOrderSearch("");
    setOrderShippingFilter("all");
    setActiveTab(null);
    setSelectedPdf(null);
    setExistingPdfUrl(null);
    setTechnicalSpecs([createTechnicalSpecItem({ etiqueta: "Observaciones" })]);
    setVariantMode(false);
    setVariantes([]);
  };

  const handleDeleteProduct = async (slug: string) => {
    setRequestError("");
    setToast(null);
    const result = await removeProduct(slug);

    if (!result.ok) {
      setRequestError(result.message);
      setToast({
        tone: "error",
        message: result.message,
      });
      return;
    }

    setToast({
      tone: "success",
      message: "Producto eliminado correctamente.",
    });
  };

  async function loadInventoryMovements() {
    setIsLoadingInventory(true);
    const response = await fetch("/api/inventory");
    const payload = (await response.json()) as {
      error?: string;
      movements?: InventoryMovementSummary[];
    };

    setIsLoadingInventory(false);

    if (!response.ok || !payload.movements) {
      setToast({
        tone: "error",
        message:
          payload.error || "No fue posible cargar los movimientos de inventario.",
      });
      return;
    }

    setInventoryMovements(payload.movements);
  }

  async function loadOrders(focusOrderId?: string) {
    setIsLoadingOrders(true);

    const response = await fetch("/api/orders");
    const payload = (await response.json()) as {
      error?: string;
      orders?: AdminOrder[];
    };

    setIsLoadingOrders(false);

    if (!response.ok || !payload.orders) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar los pedidos.",
      });
      return;
    }

    setOrders(payload.orders);

    const focusOrder = focusOrderId
      ? payload.orders.find((order) => order.id === focusOrderId)
      : undefined;

    if (focusOrder) {
      setSelectedOrderId(focusOrder.id);
      setOrderForm(getOrderEditState(focusOrder));
    } else if (!selectedOrderId && payload.orders[0]) {
      setSelectedOrderId(payload.orders[0].id);
      setOrderForm(getOrderEditState(payload.orders[0]));
    }
  }

  async function loadCustomers() {
    setIsLoadingCustomers(true);

    const response = await fetch("/api/admin/customers");
    const payload = (await response.json()) as {
      error?: string;
      customers?: AdminCustomer[];
    };

    setIsLoadingCustomers(false);

    if (!response.ok || !payload.customers) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar los clientes.",
      });
      return;
    }

    setCustomers(payload.customers);
  }

  async function loadQuotes() {
    setIsLoadingQuotes(true);

    const response = await fetch("/api/quotes");
    const payload = (await response.json()) as {
      error?: string;
      quotes?: AdminQuote[];
    };

    setIsLoadingQuotes(false);

    if (!response.ok || !payload.quotes) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar las cotizaciones.",
      });
      return;
    }

    setQuotes(payload.quotes);
  }

  async function handleQuoteStatusChange(id: string, status: QuoteStatusValue) {
    setIsSavingQuoteStatus(true);

    const response = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json()) as { error?: string; quote?: AdminQuote };

    setIsSavingQuoteStatus(false);

    if (!response.ok || !payload.quote) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible actualizar la cotización.",
      });
      return;
    }

    setQuotes((current) =>
      current.map((quote) => (quote.id === id ? { ...quote, status } : quote)),
    );
    setToast({ tone: "success", message: "Cotización actualizada correctamente." });
  }

  // Kanban drag & drop: move the card right away, roll back if the save fails.
  async function moveQuoteToStatus(id: string, status: QuoteStatusValue) {
    const previousStatus = quotes.find((quote) => quote.id === id)?.status;
    if (!previousStatus || previousStatus === status) return;

    setQuotes((current) =>
      current.map((quote) => (quote.id === id ? { ...quote, status } : quote)),
    );

    const response = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json()) as { error?: string; quote?: AdminQuote };

    if (!response.ok || !payload.quote) {
      setQuotes((current) =>
        current.map((quote) => (quote.id === id ? { ...quote, status: previousStatus } : quote)),
      );
      setToast({
        tone: "error",
        message: payload.error || "No fue posible mover la cotización.",
      });
      return;
    }

    setToast({ tone: "success", message: `Cotización movida a ${getQuoteStatusLabel(status)}.` });
  }

  async function handleSaveQuoteNotes(id: string) {
    setIsSavingQuoteNotes(true);

    const response = await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: quoteNotesDraft }),
    });
    const payload = (await response.json()) as { error?: string; quote?: AdminQuote };

    setIsSavingQuoteNotes(false);

    if (!response.ok || !payload.quote) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible guardar la respuesta.",
      });
      return;
    }

    setQuotes((current) =>
      current.map((quote) => (quote.id === id ? { ...quote, adminNotes: payload.quote!.adminNotes } : quote)),
    );
    setToast({ tone: "success", message: "Respuesta guardada. El cliente ya puede verla." });
  }

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    setIsCreatingCategory(true);
    const result = await createCategoryRequest(adminDivision, name);
    setIsCreatingCategory(false);

    if (!result.ok) {
      setToast({ tone: "error", message: result.message });
      return;
    }

    setNewCategoryName("");
    setToast({ tone: "success", message: "Categoría creada correctamente." });
  }

  async function handleRenameCategory(id: string) {
    const name = editingCategoryName.trim();
    if (!name) return;

    setSavingCategoryId(id);
    const result = await renameCategoryRequest(id, name);
    setSavingCategoryId(null);

    if (!result.ok) {
      setToast({ tone: "error", message: result.message });
      return;
    }

    setEditingCategoryId(null);
    setToast({ tone: "success", message: "Categoría renombrada correctamente." });
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!window.confirm(`¿Eliminar la categoría "${name}"? Esta acción no se puede deshacer.`)) return;

    setSavingCategoryId(id);
    const result = await removeCategoryRequest(id);
    setSavingCategoryId(null);

    if (!result.ok) {
      setToast({ tone: "error", message: result.message });
      return;
    }

    setToast({ tone: "success", message: "Categoría eliminada correctamente." });
  }

  async function handleMoveCategory(id: string, direction: "up" | "down") {
    const list = getCategoryRecordsForDivision(adminDivision);
    const index = list.findIndex((category) => category.id === id);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const reordered = [...list];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    setSavingCategoryId(id);
    const result = await reorderCategoriesRequest(
      adminDivision,
      reordered.map((category) => category.id),
    );
    setSavingCategoryId(null);

    if (!result.ok) {
      setToast({ tone: "error", message: result.message });
    }
  }

  async function loadSalesReport(range = reportsRange) {
    setIsLoadingReport(true);

    const response = await fetch(`/api/admin/reports${toDateRangeQuery(range)}`);
    const payload = (await response.json()) as {
      error?: string;
      report?: SalesReport;
    };

    setIsLoadingReport(false);

    if (!response.ok || !payload.report) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar los informes.",
      });
      return;
    }

    setSalesReport(payload.report);
  }

  async function loadDivisionOverview() {
    const response = await fetch("/api/admin/reports/overview");
    const payload = (await response.json()) as {
      error?: string;
      overview?: SalesReportOverview | null;
    };

    if (response.ok && payload.overview) {
      setDivisionOverview(payload.overview);
    }
  }

  async function loadDashboardMetrics(range = dashboardRange) {
    setIsLoadingDashboard(true);

    const response = await fetch(`/api/admin/dashboard${toDateRangeQuery(range)}`);
    const payload = (await response.json()) as {
      error?: string;
      metrics?: DashboardMetrics;
      report?: SalesReport;
    };

    setIsLoadingDashboard(false);

    if (!response.ok || !payload.metrics || !payload.report) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible cargar el panel.",
      });
      return;
    }

    setDashboardMetrics(payload.metrics);
    setSalesReport(payload.report);
  }

  const handleQuickInventoryAdjust = async (
    slug: string,
    quantity: number,
    note?: string,
  ) => {
    setRequestError("");
    setToast(null);

    const result = await adjustInventory(slug, quantity, note);

    if (!result.ok) {
      setToast({
        tone: "error",
        message: result.message,
      });
      return;
    }

    setInventoryAdjustments((current) => ({ ...current, [slug]: "" }));
    setToast({
      tone: "success",
      message: "Inventario ajustado correctamente.",
    });
    await loadInventoryMovements();
  };

  const inventoryEditProduct = inventoryEdit
    ? adminProducts.find((product) => product.slug === inventoryEdit.slug) ?? null
    : null;

  const openInventoryEdit = (slug: string) => {
    const product = adminProducts.find((entry) => entry.slug === slug);
    if (!product) return;
    setInventoryEdit({
      slug,
      stock: String(product.stock ?? 0),
      stockMinimo: String(product.stockMinimo ?? 0),
      note: "",
    });
  };

  const handleSaveInventoryEdit = async () => {
    if (!inventoryEdit || !inventoryEditProduct) return;

    const nextStock = Math.max(0, Math.trunc(Number(inventoryEdit.stock) || 0));
    const nextMinimum = Math.max(0, Math.trunc(Number(inventoryEdit.stockMinimo) || 0));
    const delta = nextStock - (inventoryEditProduct.stock ?? 0);
    const minimumChanged = nextMinimum !== (inventoryEditProduct.stockMinimo ?? 0);

    if (delta === 0 && !minimumChanged) {
      setInventoryEdit(null);
      return;
    }

    setIsSavingInventoryEdit(true);
    const result = await adjustInventory(
      inventoryEdit.slug,
      delta,
      inventoryEdit.note.trim() || "Ajuste desde inventario",
      minimumChanged ? { minimumStock: nextMinimum } : undefined,
    );
    setIsSavingInventoryEdit(false);

    if (!result.ok) {
      setToast({ tone: "error", message: result.message });
      return;
    }

    setInventoryEdit(null);
    setToast({ tone: "success", message: "Inventario actualizado." });
    if (delta !== 0) await loadInventoryMovements();
  };

  const openCreateView = () => {
    setForm({ ...initialState, categoria: categoryOptions[0] ?? "" });
    setSelectedImage(null);
    setSelectedExtraImages(Array.from({ length: EXTRA_IMAGE_SLOTS }, () => null));
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setRequestError("");
    setFileInputKey((current) => current + 1);
    setSelectedPdf(null);
    setExistingPdfUrl(null);
    setTechnicalSpecs([createTechnicalSpecItem({ etiqueta: "Observaciones" })]);
    setVariantMode(false);
    setVariantes([]);
    setActiveTab("create");
  };

  const openEditView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setActiveTab("edit");
  };

  const openInventoryView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setInventoryStatusFilter("all");
    setActiveTab("inventory");
    void loadInventoryMovements();
  };

  const openOrdersView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setOrderShippingFilter("all");
    setActiveTab("orders");
    void loadOrders();
  };

  const openOrderFromCustomer = (orderId: string, orderNumber: number) => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setOrderShippingFilter("all");
    setOrderSearch(formatOrderCode(orderNumber));
    setActiveTab("orders");
    void loadOrders(orderId);
  };

  const selectDashboardPreset = (preset: DateRangePreset) => {
    const range = getDashboardPresetRange(preset);
    setDashboardPreset(preset);
    setDashboardRange(range);
    void loadDashboardMetrics(range);
  };

  const selectReportsPreset = (preset: DateRangePreset) => {
    const range = getDashboardPresetRange(preset);
    setReportsPreset(preset);
    setReportsRange(range);
    void loadSalesReport(range);
  };

  const changeReportsDate = (field: "from" | "to", value: string) => {
    const range = updateDateInputRange(reportsRange, field, value);
    setReportsPreset("custom");
    setReportsRange(range);
    void loadSalesReport(range);
  };

  const changeDashboardDate = (field: "from" | "to", value: string) => {
    const range = updateDateInputRange(dashboardRange, field, value);
    setDashboardPreset("custom");
    setDashboardRange(range);
    void loadDashboardMetrics(range);
  };

  const [isStartingLiveTextEdit, setIsStartingLiveTextEdit] = useState(false);

  async function startLiveTextEdit() {
    setIsStartingLiveTextEdit(true);
    const response = await fetch("/api/admin/live-text-edit", { method: "POST" });
    if (!response.ok) {
      setIsStartingLiveTextEdit(false);
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setToast({ tone: "error", message: payload.error || "No fue posible activar la edición en vivo." });
      return;
    }
    window.location.href = adminBrand.siteHref;
  }

  const openCustomersView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("customers");
    void loadCustomers();
  };

  const openQuotesView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("quotes");
    void loadQuotes();
  };

  const openCategoriesView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("categories");
  };

  const openReportsView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("reports");
    void loadSalesReport();
  };

  const openOverviewView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("overview");
    void loadDivisionOverview();
  };

  const loadContentDrafts = async () => {
    const snapshot = contentDraftsMutationRef.current;
    try {
      const response = await fetch("/api/admin/content-drafts");
      const payload = (await response.json()) as {
        drafts?: { key: string; kind: string; division: string; value: string; link: string | null }[];
        error?: string;
      };
      if (!response.ok || !payload.drafts) return;
      // If a save/discard happened while this request was in flight, our local
      // state is already newer than what this (now-stale) response reflects —
      // applying it here would silently revert the user's most recent change.
      if (contentDraftsMutationRef.current !== snapshot) return;
      setContentDrafts(
        Object.fromEntries(
          payload.drafts.map((d) => [
            d.key,
            { kind: d.kind as "image" | "text" | "color", division: d.division, value: d.value, link: d.link },
          ]),
        ),
      );
    } catch {
      // Non-fatal: the panel still works with live data if drafts fail to load.
    }
  };

  const myContentDrafts = Object.entries(contentDrafts).filter(
    ([, draft]) => draft.division === adminDivision || draft.division === "Global",
  );

  useEffect(() => {
    if (myContentDrafts.length === 0) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [myContentDrafts.length]);

  const resolveAdminImageSrc = (key: string, fallback: string) => {
    const draft = contentDrafts[key];
    if (draft?.kind === "image") return draft.value;
    return siteImages[key] ?? fallback;
  };

  const resolveAdminImageLink = (key: string) => {
    const draft = contentDrafts[key];
    if (draft?.kind === "image") return draft.link ?? "";
    return siteImageLinks[key] ?? "";
  };

  const resolveAdminColor = (key: string, fallback: string) => {
    const draft = contentDrafts[key];
    if (draft?.kind === "color") return draft.value;
    return siteColorsAdmin[key] ?? fallback;
  };

  const handleDiscardDraft = async (key: string) => {
    try {
      await fetch("/api/admin/content-drafts/discard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
    } finally {
      contentDraftsMutationRef.current += 1;
      setContentDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const handlePublishDrafts = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch("/api/admin/content-drafts/publish", { method: "POST" });
      const payload = (await response.json()) as {
        ok?: boolean;
        published?: { key: string; kind: string; label: string }[];
        error?: string;
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "No se pudieron publicar los cambios.");
      }
      setIsPublishModalOpen(false);
      setPublishNotice(`✓ ${payload.published?.length ?? 0} cambios publicados`);
      window.setTimeout(() => setPublishNotice(null), 3000);
      await Promise.all([loadSiteImages(), loadSiteColors(), loadContentDrafts()]);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudieron publicar los cambios.");
    } finally {
      setIsPublishing(false);
    }
  };

  const loadContentVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const response = await fetch("/api/admin/content-versions");
      const payload = (await response.json()) as {
        versions?: { id: string; createdAt: string; createdBy: string | null; label: string | null; changedCount: number }[];
      };
      setContentVersions(payload.versions ?? []);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setRestoringVersionId(versionId);
    try {
      const response = await fetch(`/api/admin/content-versions/${versionId}/restore`, { method: "POST" });
      if (!response.ok) throw new Error("No se pudo restaurar esta versión.");
      setPublishNotice("✓ Versión restaurada");
      window.setTimeout(() => setPublishNotice(null), 3000);
      await Promise.all([
        loadSiteImages(),
        loadSiteColors(),
        loadContentDrafts(),
        loadContentVersions(),
      ]);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudo restaurar esta versión.");
    } finally {
      setRestoringVersionId(null);
    }
  };

  const loadSiteImages = async () => {
    setIsLoadingImages(true);
    setImageError(null);
    try {
      const response = await fetch("/api/admin/images");
      const payload = (await response.json()) as {
        images?: Record<string, string>;
        links?: Record<string, string>;
        error?: string;
      };
      if (!response.ok || !payload.images) {
        throw new Error(payload.error || "No fue posible cargar las imágenes.");
      }
      setSiteImages(payload.images);
      setSiteImageLinks(payload.links || {});
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No fue posible cargar las imágenes.");
    } finally {
      setIsLoadingImages(false);
    }
  };

  const loadImageHistory = async () => {
    try {
      const response = await fetch("/api/admin/images/history");
      const payload = (await response.json()) as {
        history?: Record<string, { url: string; createdAt: string }[]>;
        error?: string;
      };
      if (!response.ok || !payload.history) return;
      setImageHistory(payload.history);
    } catch {
      // Non-fatal: the panel still works without the history strip.
    }
  };

  const handleSiteImageLinkSave = async (slotKey: string, link: string) => {
    setSavingLinkKey(slotKey);
    setImageError(null);
    try {
      const response = await fetch("/api/admin/content-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slotKey, kind: "image", link }),
      });
      const payload = (await response.json()) as {
        draft?: { kind: "image"; division: string; value: string; link: string | null };
        error?: string;
      };
      if (!response.ok || !payload.draft) {
        throw new Error(payload.error || "No se pudo guardar el enlace.");
      }
      contentDraftsMutationRef.current += 1;
      setContentDrafts((current) => ({ ...current, [slotKey]: payload.draft! }));
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudo guardar el enlace.");
    } finally {
      setSavingLinkKey(null);
    }
  };

  const loadSiteSettings = async () => {
    setIsLoadingSettings(true);
    setSettingsError(null);
    try {
      const response = await fetch("/api/admin/settings");
      const payload = (await response.json()) as {
        whatsappNumber?: string;
        cauchosSalesMode?: CauchosSalesMode;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error || "No fue posible cargar la configuración.");
      }
      setWhatsappNumber(payload.whatsappNumber ?? "");
      setCauchosSalesMode(payload.cauchosSalesMode === "whatsapp" ? "whatsapp" : "precios");
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "No fue posible cargar la configuración.",
      );
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSaveWhatsAppNumber = async () => {
    setIsSavingSettings(true);
    setSettingsSaved(false);
    setSettingsError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNumber }),
      });
      const payload = (await response.json()) as { whatsappNumber?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo guardar el número.");
      }
      setWhatsappNumber(payload.whatsappNumber ?? "");
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (error) {
      setSettingsError(error instanceof Error ? error.message : "No se pudo guardar el número.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleChangeCauchosSalesMode = async (mode: CauchosSalesMode) => {
    const previousMode = cauchosSalesMode;
    setCauchosSalesMode(mode);
    setIsSavingSalesMode(true);
    setSettingsSaved(false);
    setSettingsError(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cauchosSalesMode: mode }),
      });
      const payload = (await response.json()) as { cauchosSalesMode?: CauchosSalesMode; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo guardar el modo de venta.");
      }
      setCauchosSalesMode(payload.cauchosSalesMode === "whatsapp" ? "whatsapp" : "precios");
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch (error) {
      setCauchosSalesMode(previousMode);
      setSettingsError(
        error instanceof Error ? error.message : "No se pudo guardar el modo de venta.",
      );
    } finally {
      setIsSavingSalesMode(false);
    }
  };

  const loadSiteColors = async () => {
    setIsLoadingColors(true);
    setColorsError(null);
    try {
      const response = await fetch("/api/admin/colors");
      const payload = (await response.json()) as { colors?: Record<string, string>; error?: string };
      if (!response.ok || !payload.colors) {
        throw new Error(payload.error || "No fue posible cargar los colores.");
      }
      setSiteColorsAdmin(payload.colors);
    } catch (error) {
      setColorsError(error instanceof Error ? error.message : "No fue posible cargar los colores.");
    } finally {
      setIsLoadingColors(false);
    }
  };

  const handleSaveColor = async (key: string, value: string) => {
    setSavingColorKey(key);
    setColorsError(null);
    try {
      const response = await fetch("/api/admin/content-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, kind: "color", value }),
      });
      const payload = (await response.json()) as {
        draft?: { kind: "color"; division: string; value: string; link: string | null };
        error?: string;
      };
      if (!response.ok || !payload.draft) {
        throw new Error(payload.error || "No se pudo guardar el color.");
      }
      contentDraftsMutationRef.current += 1;
      setContentDrafts((current) => ({ ...current, [key]: payload.draft! }));
      setSavedColorKey(key);
      setTimeout(() => setSavedColorKey((current) => (current === key ? null : current)), 1500);
    } catch (error) {
      setColorsError(error instanceof Error ? error.message : "No se pudo guardar el color.");
    } finally {
      setSavingColorKey(null);
    }
  };

  const openSettingsSection = (section: "images" | "texts" | "colors" | "whatsapp" | "salesMode") => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("settings");
    setIsSettingsMenuOpen(true);
    setSettingsSection(section);
    setSelectedImageGroup(null);
    if (section === "images") {
      void loadSiteImages();
      void loadContentDrafts();
      void loadImageHistory();
    }
    if (section === "texts") {
      void loadContentDrafts();
    }
    if (section === "colors") {
      void loadSiteColors();
      void loadContentDrafts();
    }
    if (section === "whatsapp") void loadSiteSettings();
    if (section === "salesMode") void loadSiteSettings();
  };

  const openSettingsView = () => {
    if (canAccessTool("images")) {
      openSettingsSection("images");
    } else {
      openSettingsSection("texts");
    }
  };

  const handleSiteImageUpload = async (slotKey: string, file: File) => {
    setUploadingImageKey(slotKey);
    setImageError(null);
    try {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("La imagen supera el límite de 4 MB.");
      }

      const form = new FormData();
      form.append("file", file);
      form.append("key", slotKey);
      const uploadResponse = await fetch("/api/admin/images/upload", { method: "POST", body: form });
      const uploadPayload = (await uploadResponse
        .json()
        .catch(() => null)) as { publicUrl?: string; error?: string } | null;
      if (!uploadResponse.ok || !uploadPayload?.publicUrl) {
        throw new Error(uploadPayload?.error || "No se pudo subir la imagen.");
      }

      const saveResponse = await fetch("/api/admin/content-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slotKey, kind: "image", value: uploadPayload.publicUrl }),
      });
      const savePayload = (await saveResponse.json().catch(() => null)) as {
        draft?: { kind: "image"; division: string; value: string; link: string | null };
        error?: string;
      } | null;
      if (!saveResponse.ok || !savePayload?.draft) {
        throw new Error(savePayload?.error || "No se pudo guardar la imagen.");
      }

      contentDraftsMutationRef.current += 1;
      setContentDrafts((current) => ({ ...current, [slotKey]: savePayload.draft! }));
      setSavedImageKey(slotKey);
      window.setTimeout(() => setSavedImageKey(null), 2500);
      void loadImageHistory();
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImageKey(null);
    }
  };

  const handleRestoreFromHistory = async (slotKey: string, url: string) => {
    setRestoringHistoryKey(slotKey);
    setImageError(null);
    try {
      const saveResponse = await fetch("/api/admin/content-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slotKey, kind: "image", value: url }),
      });
      const savePayload = (await saveResponse.json().catch(() => null)) as {
        draft?: { kind: "image"; division: string; value: string; link: string | null };
        error?: string;
      } | null;
      if (!saveResponse.ok || !savePayload?.draft) {
        throw new Error(savePayload?.error || "No se pudo restaurar esta imagen.");
      }

      contentDraftsMutationRef.current += 1;
      setContentDrafts((current) => ({ ...current, [slotKey]: savePayload.draft! }));
      setSavedImageKey(slotKey);
      window.setTimeout(() => setSavedImageKey(null), 2500);
      void loadImageHistory();
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudo restaurar esta imagen.");
    } finally {
      setRestoringHistoryKey(null);
    }
  };

  const handleOrderFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setOrderForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSaveOrder = async () => {
    if (!selectedOrderId) return;

    setIsSavingOrder(true);
    setToast(null);

    const response = await fetch(`/api/orders/${selectedOrderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderForm),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      order?: AdminOrder;
    };

    setIsSavingOrder(false);

    if (!response.ok || !payload.order) {
      setToast({
        tone: "error",
        message: payload.error || "No fue posible actualizar el pedido.",
      });
      return;
    }

    setOrders((current) =>
      current.map((order) => (order.id === payload.order?.id ? payload.order : order)),
    );
    setToast({
      tone: "success",
      message: payload.message || "Pedido actualizado correctamente.",
    });
  };

  const handleLogout = async () => {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      setToast({ tone: "error", message: "No fue posible cerrar sesión. Intenta de nuevo." });
      return;
    }

    setIsAuthenticated(false);
    setAdminName("");
    router.refresh();
  };

  const switchDivision = async (target: DivisionName) => {
    if (target === adminDivision) {
      setShowDivisionSwitcher(false);
      return;
    }

    setSwitchDivisionError("");
    setIsSwitchingDivision(true);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: DIVISION_ADMIN_EMAILS[target],
          password: DIVISION_ADMIN_PASSWORD,
          adminPin: DIVISION_ADMIN_PIN,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        user?: { role: "CUSTOMER" | "ADMIN" };
        requiresAdminPin?: boolean;
      };

      if (!response.ok || payload.requiresAdminPin || payload.user?.role !== "ADMIN") {
        setSwitchDivisionError(payload.error || "No fue posible cambiar de unidad de negocio.");
        setIsSwitchingDivision(false);
        return;
      }

      const brandParam = target === "Cauchos" ? "" : `?brand=${target.toLowerCase()}`;
      window.location.href = `/admin${brandParam}`;
    } catch {
      setSwitchDivisionError("No fue posible cambiar de unidad de negocio.");
      setIsSwitchingDivision(false);
    }
  };

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto flex max-w-[1440px] px-6 py-16">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 text-center shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--admin-accent)]">
              Administrador
            </p>
            <p className="mt-4 text-sm text-[#6e7379]">
              Verificando acceso al panel...
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#f5f5f5] text-[#111]">
        <section className="mx-auto flex max-w-[1440px] px-6 py-16">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/8 bg-white p-8 text-center shadow-[0_16px_35px_rgba(15,23,42,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[var(--admin-accent)]">
              Administrador
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6e7379]">
              Redirigiendo al ingreso general para validar tu cuenta.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const pendingQuotesCount = quotes.filter((quote) => quote.status === "NEW").length;

  const getPeriodLabel = (preset: DashboardPreset, range: DateInputRange) =>
    REPORT_PRESETS.find((item) => item.key === preset)?.period ??
    (range.from === range.to
      ? `el ${formatShortDate(parseDateInputValue(range.from).toISOString())}`
      : `del ${formatShortDate(parseDateInputValue(range.from).toISOString())} al ${formatShortDate(
          parseDateInputValue(range.to).toISOString(),
        )}`);
  const dashboardPeriodLabel = getPeriodLabel(dashboardPreset, dashboardRange);
  const reportsPeriodLabel = getPeriodLabel(reportsPreset, reportsRange);

  const canAccessTool = (tool: AdminToolKey) =>
    isToolAllowedForDivision(adminDivision, tool) && hasAdminPermission(adminPermissions, tool);

  const sidebarNavItems = (
    [
      {
        key: "dashboard",
        label: "Dashboard",
        active: activeTab === null,
        onClick: () => {
          setActiveTab(null);
          void loadDashboardMetrics();
        },
      },
      { key: "create", label: "Crear", active: activeTab === "create", onClick: openCreateView },
      { key: "edit", label: "Editar", active: activeTab === "edit", onClick: openEditView },
      ...(!isServiceAdmin
        ? [{ key: "inventory", label: "Inventario", active: activeTab === "inventory", onClick: openInventoryView }]
        : []),
      { key: "orders", label: "Pedidos", active: activeTab === "orders", onClick: openOrdersView },
      { key: "customers", label: "Clientes", active: activeTab === "customers", onClick: openCustomersView },
      { key: "quotes", label: "Cotizaciones", active: activeTab === "quotes", onClick: openQuotesView, count: pendingQuotesCount },
      { key: "categories", label: "Categorías", active: activeTab === "categories", onClick: openCategoriesView },
      { key: "reports", label: "Informes", active: activeTab === "reports", onClick: openReportsView },
      ...(adminDivision === "GEU"
        ? [
            {
              key: "overview" as const,
              label: "Informes generales",
              active: activeTab === "overview",
              onClick: openOverviewView,
            },
          ]
        : []),
      {
        key: "settings",
        label: "Configuración",
        active: activeTab === "settings",
        onClick: openSettingsView,
      },
    ] as Array<{
      key: AdminToolKey | "overview";
      label: string;
      active: boolean;
      onClick: () => void;
      count?: number;
    }>
  ).filter((item) =>
    item.key === "overview"
      ? true
      : item.key === "settings"
        ? canAccessTool("settings") || canAccessTool("images")
        : canAccessTool(item.key),
  );

  const settingsSubItems = (
    [
      canAccessTool("images")
        ? {
            key: "images" as const,
            label: "Imágenes",
            active: activeTab === "settings" && settingsSection === "images",
            onClick: () => openSettingsSection("images"),
          }
        : null,
      canAccessTool("settings")
        ? {
            key: "texts" as const,
            label: "Textos",
            active: activeTab === "settings" && settingsSection === "texts",
            onClick: () => openSettingsSection("texts"),
          }
        : null,
      canAccessTool("settings")
        ? {
            key: "colors" as const,
            label: "Colores",
            active: activeTab === "settings" && settingsSection === "colors",
            onClick: () => openSettingsSection("colors"),
          }
        : null,
      canAccessTool("settings")
        ? {
            key: "whatsapp" as const,
            label: "WhatsApp",
            active: activeTab === "settings" && settingsSection === "whatsapp",
            onClick: () => openSettingsSection("whatsapp"),
          }
        : null,
      canAccessTool("settings") && !isServiceDivision(adminDivision)
        ? {
            key: "salesMode" as const,
            label: "Modo de venta",
            active: activeTab === "settings" && settingsSection === "salesMode",
            onClick: () => openSettingsSection("salesMode"),
          }
        : null,
    ] as const
  ).filter((item): item is NonNullable<typeof item> => item !== null);

  const adminAccentRgb = hexToRgb(adminBrand.accent);

  return (
    <main
      className="min-h-screen bg-[#f5f5f5] text-[#111]"
      style={
        {
          "--admin-accent": adminBrand.accent,
          "--admin-accent-hover": adminBrand.accentHover,
          "--admin-accent-rgb": adminAccentRgb,
          "--admin-accent-soft": `rgba(${adminAccentRgb}, 0.08)`,
          "--admin-accent-light": `rgba(${adminAccentRgb}, 0.55)`,
        } as React.CSSProperties
      }
    >
      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div
            className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]"
                : "border-[var(--admin-accent)]/18 bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">
                  {toast.tone === "success" ? "Correcto" : "Atención"}
                </p>
                <p className="mt-2 text-sm font-medium leading-6">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-lg leading-none opacity-60 transition-opacity duration-200 hover:opacity-100"
                aria-label="Cerrar notificación"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {showDivisionSwitcher && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#05070d]/70 px-6 backdrop-blur-md">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-black/[0.06] bg-white shadow-[0_50px_120px_-30px_rgba(2,6,23,0.45),0_18px_40px_rgba(15,23,42,0.14)]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
              aria-hidden="true"
            />

            <div className="relative px-7 pb-7 pt-8 md:px-9">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#9a9ea3]">
                    <span className="h-px w-7 bg-[#c7cacd]" />
                    Panel maestro
                  </p>
                  <h2 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#12161c] md:text-3xl">
                    ¿En qué unidad de negocio quieres trabajar?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDivisionSwitcher(false)}
                  disabled={isSwitchingDivision}
                  aria-label="Cerrar"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#12161c] text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)] transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 md:h-9 md:w-9 md:border md:border-black/8 md:bg-transparent md:text-slate-500 md:shadow-none md:hover:border-black/16 md:hover:bg-black/5 md:hover:text-slate-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-4 md:w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>

              {switchDivisionError && (
                <p className="mt-5 rounded-xl border border-[var(--admin-accent)]/25 bg-[var(--admin-accent-soft)] px-4 py-3 text-sm text-[var(--admin-accent)]">
                  {switchDivisionError}
                </p>
              )}

              <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {DIVISIONS.map((division) => {
                  const brand = ADMIN_BRAND_CONFIG[division];
                  const isCurrent = division === adminDivision;

                  return (
                    <button
                      key={division}
                      type="button"
                      onClick={() => void switchDivision(division)}
                      disabled={isSwitchingDivision}
                      className={`group relative flex flex-col gap-3 overflow-hidden rounded-[1.3rem] border p-5 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isCurrent
                          ? "border-black/[0.06] bg-[#fafaf9]"
                          : "border-black/8 bg-white hover:-translate-y-0.5 hover:border-black/[0.14] hover:shadow-[0_18px_34px_-14px_rgba(15,23,42,0.28)]"
                      }`}
                    >
                      {isCurrent && (
                        <span
                          className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
                          style={{ backgroundColor: brand.accent }}
                          aria-hidden="true"
                        />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.85rem] text-base font-bold text-white ring-1 ring-black/5"
                          style={{
                            background: `linear-gradient(155deg, ${brand.accent} 0%, ${brand.accentHover} 100%)`,
                            boxShadow: `0 10px 22px -8px ${brand.accent}66`,
                          }}
                        >
                          {brand.label.charAt(0)}
                        </span>
                        {!isCurrent && (
                          <svg
                            viewBox="0 0 24 24"
                            className="mt-1 h-4 w-4 shrink-0 text-[#c4c6c9] transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#8b8d91]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="block text-[13.5px] font-semibold leading-snug text-[#12161c]">
                          {brand.label}
                        </span>
                        {isCurrent ? (
                          <span
                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{ backgroundColor: `${brand.accent}14`, color: brand.accent }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: brand.accent }}
                            />
                            Estás aquí ahora
                          </span>
                        ) : (
                          <span className="mt-1 block text-xs font-medium text-[#8b8d91]">
                            Entrar al panel
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSwitchingDivision && (
                <p className="mt-6 flex items-center justify-center gap-2.5 text-sm font-semibold text-[#6e7379]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Cambiando de unidad de negocio...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((value) => !value)}
          aria-label={isSidebarCollapsed ? "Mostrar menú" : "Ocultar menú"}
          className={`fixed top-5 z-[60] hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-[0_6px_16px_rgba(15,23,42,0.12)] transition-all duration-300 hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] md:flex ${
            isSidebarCollapsed ? "left-3" : "left-[236px]"
          }`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m14 6-6 6 6 6" />
          </svg>
        </button>

        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-slate-200 bg-white transition-all duration-300 md:flex ${
            isSidebarCollapsed ? "w-0 border-r-0" : "w-64 border-r"
          }`}
        >
          <div className="border-b border-slate-200 px-5 py-5">
            <Link href={adminBrand.siteHref} className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
                style={{ backgroundColor: adminBrand.accent }}
              >
                {adminBrand.label.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black text-[#1f2328]">Panel maestro</span>
                <span className="block truncate text-xs font-semibold text-[#8b8d91]">{adminBrand.label}</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setShowDivisionSwitcher(true);
                void loadDivisionOverview();
              }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
              </svg>
              Cambiar de unidad
            </button>
          </div>

          <nav className="w-64 flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = SIDEBAR_ICONS[item.key];

                if (item.key === "settings") {
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => setIsSettingsMenuOpen((value) => !value)}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors duration-200 ${
                          item.active
                            ? "text-white shadow-[0_10px_22px_-6px_rgba(var(--admin-accent-rgb),0.55)]"
                            : "text-slate-700 hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]"
                        }`}
                        style={item.active ? { backgroundColor: adminBrand.accent } : undefined}
                      >
                        <span className="flex items-center gap-2.5">
                          {Icon && <Icon />}
                          {item.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`text-xs transition-transform duration-200 ${isSettingsMenuOpen ? "rotate-180" : ""}`}
                        >
                          ▾
                        </span>
                      </button>
                      {isSettingsMenuOpen && (
                        <ul className="mt-1 space-y-0.5 border-l border-slate-200 pl-3">
                          {settingsSubItems.map((subItem) => {
                            const SubIcon = SETTINGS_SUB_ICONS[subItem.key];
                            return (
                              <li key={subItem.key}>
                                <button
                                  type="button"
                                  onClick={subItem.onClick}
                                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${
                                    subItem.active
                                      ? "bg-[var(--admin-accent-soft)]"
                                      : "text-slate-600 hover:bg-slate-50"
                                  }`}
                                  style={subItem.active ? { color: adminBrand.accent } : undefined}
                                >
                                  <SubIcon />
                                  {subItem.label}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors duration-200 ${
                        item.active
                          ? "text-white shadow-[0_10px_22px_-6px_rgba(var(--admin-accent-rgb),0.55)]"
                          : "text-slate-700 hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]"
                      }`}
                      style={item.active ? { backgroundColor: adminBrand.accent } : undefined}
                    >
                      <span className="flex items-center gap-2.5">
                        {Icon && <Icon />}
                        {item.label}
                      </span>
                      {"count" in item && Boolean(item.count) && (
                        <span
                          className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-black ${
                            item.active ? "bg-white/20 text-white" : "bg-[#fff1f1] text-[#c53b3b]"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => router.push(adminBrand.productsHref)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-700 transition-colors duration-200 hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]"
                >
                  <CatalogIcon />
                  Catálogo
                </button>
              </li>
            </ul>
          </nav>

          <div className="w-64 border-t border-slate-200 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-left text-sm font-bold text-red-600 transition-colors duration-200 hover:bg-red-100"
            >
              <LogoutIcon />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[auto_1fr_auto] md:px-8">
              <Link href={adminBrand.siteHref} className="flex shrink-0 items-center md:hidden">
                <Image
                  src={adminBrand.logo}
                  alt={adminBrand.logoAlt}
                  width={2518}
                  height={420}
                  priority
                  className="h-auto object-contain"
                  style={{ width: "180px", maxWidth: "100%" }}
                />
              </Link>

              <form
                className="flex min-h-11 overflow-hidden rounded-full border border-slate-300 bg-white transition-shadow duration-200 focus-within:border-[var(--admin-accent)] focus-within:shadow-[0_0_0_3px_rgba(var(--admin-accent-rgb),0.14)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  openEditView();
                }}
              >
                <input
                  value={editSearch}
                  onChange={(event) => setEditSearch(event.target.value)}
                  aria-label="Buscar productos por nombre, marca o SKU"
                  className="min-w-0 flex-1 px-5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                  placeholder="Buscar productos por nombre, marca o SKU..."
                />
                <button
                  type="submit"
                  className="flex w-12 shrink-0 items-center justify-center text-slate-500 transition-colors duration-200 hover:text-[var(--admin-accent)]"
                  aria-label="Buscar"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.4-3.4" />
                  </svg>
                </button>
              </form>

              <div className="flex items-center justify-between gap-4 text-sm text-slate-700 md:justify-end">
                {adminName && (
                  <span className="hidden items-center gap-2.5 lg:flex">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ backgroundColor: adminBrand.accent }}
                    >
                      {adminName.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[160px] truncate font-bold">
                      {adminName || adminBrand.sessionLabel}
                    </span>
                  </span>
                )}
                <Link
                  href={adminBrand.siteHref}
                  className="rounded-full border bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.06em] transition-colors duration-200"
                  style={{ borderColor: adminBrand.accent, color: adminBrand.accent }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = adminBrand.accent;
                    event.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = "#ffffff";
                    event.currentTarget.style.color = adminBrand.accent;
                  }}
                >
                  Ver sitio
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition-colors duration-200 hover:bg-red-100 md:hidden"
                >
                  <LogoutIcon />
                </button>
              </div>
            </div>

            <nav className="border-t border-slate-200 bg-white md:hidden">
              <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-5">
                {sidebarNavItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={item.onClick}
                    className="flex min-w-max items-center gap-1.5 border-b-2 px-3 py-3 text-[11px] font-black uppercase tracking-[0.04em] transition-colors duration-200"
                    style={{
                      borderColor: item.active ? adminBrand.accent : "transparent",
                      color: item.active ? adminBrand.accent : "#334155",
                    }}
                  >
                    <span>{item.label}</span>
                    {"count" in item && Boolean(item.count) && (
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fff1f1] px-1 text-[10px] font-black text-[#c53b3b]">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => router.push(adminBrand.productsHref)}
                  className="flex min-w-max items-center border-b-2 border-transparent px-3 py-3 text-[11px] font-black uppercase tracking-[0.04em] text-slate-700 transition-colors duration-200"
                >
                  Catálogo
                </button>
              </div>
            </nav>
          </header>

          <section className="mx-auto w-full max-w-[1440px] px-6 py-12">
        <div className="space-y-8">
          {!activeTab && (
            <div className="admin-fade-up space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8b8d91]">
                  {adminBrand.eyebrow}
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#1f2328] md:text-4xl">
                  Dashboard
                </h2>
                <p className="mt-2 text-sm capitalize text-[#6e7379]">
                  {new Date().toLocaleDateString("es-CO", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}
                  {productCountLabel}
                </p>
              </div>

              <DateRangeFilter
                presets={DASHBOARD_PRESETS}
                preset={dashboardPreset}
                range={dashboardRange}
                accent={adminBrand.accent}
                isLoading={isLoadingDashboard && Boolean(dashboardMetrics)}
                onPresetChange={selectDashboardPreset}
                onDateChange={changeDashboardDate}
              />

              {isLoadingDashboard && !dashboardMetrics ? (
                <p className="text-sm text-[#6e7379]">Cargando métricas...</p>
              ) : !dashboardMetrics || !salesReport ? (
                <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-[#fafaf9] p-8 text-center text-sm leading-7 text-[#6e7379]">
                  Aún no hay datos suficientes para mostrar el dashboard.
                </div>
              ) : (
                <>
                  <section className="overflow-hidden rounded-2xl border border-black/8 bg-white">
                    <header className="flex items-center justify-between gap-3 border-b border-black/6 px-6 py-4">
                      <h3 className="text-sm font-semibold text-[#16384f]">Resumen de ventas</h3>
                      <span className="text-xs capitalize text-[#8b8d91]">{dashboardPeriodLabel}</span>
                    </header>
                    <dl className="grid gap-px bg-black/[0.06] sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Vendido",
                          value: formatCurrency(dashboardMetrics.revenue),
                          helper: "Solo pedidos pagados",
                          Icon: DashboardMetricRevenueIcon,
                        },
                        {
                          label: "Pedidos",
                          value: formatNumber(dashboardMetrics.orders),
                          helper: `${formatNumber(dashboardMetrics.unitsSold)} ${dashboardMetrics.unitsSold === 1 ? "unidad vendida" : "unidades vendidas"}`,
                          Icon: DashboardMetricOrdersIcon,
                        },
                        {
                          label: "Ticket promedio",
                          value: formatCurrency(dashboardMetrics.averageTicket),
                          helper: "Valor promedio por pedido",
                          Icon: DashboardMetricTicketIcon,
                        },
                        {
                          label: "Clientes nuevos",
                          value: formatNumber(dashboardMetrics.newCustomers),
                          helper: `De ${formatNumber(dashboardMetrics.customers)} ${dashboardMetrics.customers === 1 ? "comprador" : "compradores"} en el periodo`,
                          Icon: DashboardMetricCustomersIcon,
                        },
                      ].map((metric) => (
                        <div key={metric.label} className="bg-white px-6 py-5">
                          <dt className="flex items-center gap-2 text-xs font-medium text-[#6e7379]">
                            <span className="text-[#9a9da2] [&_svg]:h-3.5 [&_svg]:w-3.5">
                              <metric.Icon />
                            </span>
                            {metric.label}
                          </dt>
                          <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-[-0.02em] text-[#16384f]">
                            {metric.value}
                          </dd>
                          <dd className="mt-1 text-xs text-[#8b8d91]">{metric.helper}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                    <section className="rounded-2xl border border-black/8 bg-white">
                      <header className="flex items-center justify-between gap-3 border-b border-black/6 px-6 py-4">
                        <h3 className="text-sm font-semibold text-[#16384f]">Destacados</h3>
                        <span className="text-xs capitalize text-[#8b8d91]">{dashboardPeriodLabel}</span>
                      </header>
                      <dl className="divide-y divide-black/6">
                        {[
                          {
                            label: "Producto más vendido",
                            Icon: DashboardTrophyIcon,
                            value: dashboardMetrics.topProduct?.name,
                            detail: dashboardMetrics.topProduct
                              ? `${formatNumber(dashboardMetrics.topProduct.quantitySold)} ${dashboardMetrics.topProduct.quantitySold === 1 ? "unidad" : "unidades"}`
                              : null,
                          },
                          {
                            label: "Categoría más vendida",
                            Icon: DashboardTagIcon,
                            value: dashboardMetrics.topCategory?.category,
                            detail: dashboardMetrics.topCategory
                              ? `${formatNumber(dashboardMetrics.topCategory.quantitySold)} ${dashboardMetrics.topCategory.quantitySold === 1 ? "unidad" : "unidades"}`
                              : null,
                          },
                          {
                            label: "Clientes atendidos",
                            Icon: DashboardMetricCustomersIcon,
                            value: `${formatNumber(dashboardMetrics.customers)} ${dashboardMetrics.customers === 1 ? "comprador" : "compradores distintos"}`,
                            detail: null,
                          },
                        ].map((row) => (
                          <div key={row.label} className="grid gap-1 px-6 py-4 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                            <dt className="flex items-center gap-2 text-xs font-medium text-[#6e7379]">
                              <span className="text-[#9a9da2] [&_svg]:h-3.5 [&_svg]:w-3.5">
                                <row.Icon />
                              </span>
                              {row.label}
                            </dt>
                            <dd className="text-sm font-semibold text-[#1f2328]">
                              {row.value ?? <span className="font-normal text-[#8b8d91]">Sin ventas en este periodo</span>}
                            </dd>
                            {row.detail && (
                              <dd className="text-xs tabular-nums text-[#8b8d91] sm:text-right">{row.detail}</dd>
                            )}
                          </div>
                        ))}
                      </dl>
                    </section>

                    <section className="rounded-2xl border border-black/8 bg-white">
                      <header className="border-b border-black/6 px-6 py-4">
                        <h3 className="text-sm font-semibold text-[#16384f]">Estado actual</h3>
                      </header>
                      <dl className="divide-y divide-black/6">
                        {[
                          {
                            label: "Pedidos con pago pendiente",
                            Icon: DashboardMetricClockIcon,
                            value: salesReport.totals.pendingOrders,
                            detail: `${formatNumber(salesReport.totals.cancelledOrders)} cancelados`,
                            warn: salesReport.totals.pendingOrders > 0,
                          },
                          {
                            label: "Alertas de stock",
                            Icon: DashboardMetricAlertIcon,
                            value: stockAlerts.lowStock + stockAlerts.outOfStock,
                            detail: `${formatNumber(stockAlerts.lowStock)} con stock bajo · ${formatNumber(stockAlerts.outOfStock)} agotados`,
                            warn: stockAlerts.outOfStock > 0,
                          },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-4">
                            <div>
                              <dt className="flex items-center gap-2 text-xs font-medium text-[#6e7379]">
                                <span className="text-[#9a9da2] [&_svg]:h-3.5 [&_svg]:w-3.5">
                                  <row.Icon />
                                </span>
                                {row.label}
                              </dt>
                              <dd className="mt-1 text-xs text-[#8b8d91]">{row.detail}</dd>
                            </div>
                            <dd
                              className={`text-2xl font-semibold tabular-nums ${row.warn ? "text-[#b42318]" : "text-[#16384f]"}`}
                            >
                              {formatNumber(row.value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8b8d91]">
                      Pedidos recientes
                    </p>
                    {salesReport.recentOrders.length === 0 ? (
                      <p className="text-sm text-[#6e7379]">Todavía no hay pedidos registrados.</p>
                    ) : (
                      <div className="space-y-3">
                        {salesReport.recentOrders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between gap-4 rounded-xl border border-black/6 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm font-bold text-[#1f2328]">{order.customerName}</p>
                              <p className="text-xs text-[#8b8d91]">
                                {new Date(order.createdAt).toLocaleDateString("es-CO")} · {order.totalItems}{" "}
                                artículo{order.totalItems === 1 ? "" : "s"}
                              </p>
                            </div>
                            <p className="text-sm font-semibold" style={{ color: adminBrand.accent }}>
                              {formatCurrency(order.subtotal)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <form
              onSubmit={handleSubmit}
              className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Nuevo producto
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Crear producto
                  </h2>
                </div>
                {saved && (
                  <span className="rounded-full bg-[#16384f] px-4 py-2 text-sm font-semibold text-white">
                    Guardado
                  </span>
                )}
              </div>

                {canUseVariantMode && (
                  <label className="mb-5 flex items-center gap-3 rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={variantMode}
                      onChange={(event) => setVariantMode(event.target.checked)}
                    />
                    <span className="text-sm font-medium text-[#4f545a]">
                      Este producto está categorizado por medidas
                    </span>
                  </label>
                )}

                {isVariantModeActive && (
                  <div className="mb-5">
                    <VariantesEditor items={variantes} onChange={setVariantes} />
                  </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  {!isVariantModeActive && (
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">SKU</span>
                      <input
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        placeholder="Ej. FAROLA001"
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>
                  )}

                  <CategoryComboBox
                    label={adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy" ? "Categoría" : "Crear categoría"}
                    name="categoria"
                    value={form.categoria}
                    options={categoryOptions}
                    placeholder="Ej. Transporte, logística y puertos marítimos"
                    required
                    entityName="categoría"
                    strict={adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy"}
                    onChange={(value) => setForm((current) => ({ ...current, categoria: value }))}
                  />

                  {adminDivision !== "Import" && adminDivision !== "Plastic" && adminDivision !== "Energy" && (
                    <>
                      <MultiCategoryComboBox
                        label="Sub categorías"
                        name="subcategoria"
                        value={form.subcategorias}
                        options={subcategoryOptions}
                        placeholder="Ej. O-rings, Neopreno, EPDM"
                        entityName="subcategoría"
                        onChange={(value) => setForm((current) => ({ ...current, subcategorias: value }))}
                      />

                      <MultiCategoryComboBox
                        label="Categorías menores"
                        name="categoriaMenor"
                        value={form.categoriasMenores}
                        options={categoriaMenorOptions}
                        placeholder="Ej. Pintura para interior"
                        entityName="categoría menor"
                        onChange={(value) => setForm((current) => ({ ...current, categoriasMenores: value }))}
                      />
                    </>
                  )}

                  <AdditionalCategoriesEditor
                    items={form.categoriasAdicionales}
                    categoryOptions={categoryOptions}
                    adminProducts={adminProducts}
                    strictCategory={adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy"}
                    onChange={(items) => setForm((current) => ({ ...current, categoriasAdicionales: items }))}
                  />

                  {!isServiceAdmin && (
                    <AdditionalDivisionsEditor
                      currentDivision={adminDivision}
                      items={form.categoriasPorDivision}
                      allProducts={allAdminProducts}
                      onChange={(items) => setForm((current) => ({ ...current, categoriasPorDivision: items }))}
                    />
                  )}

                <label className="space-y-2">
                  <span className="text-sm font-medium text-[#4f545a]">Marca</span>
                  <input
                    name="marca"
                    value={form.marca}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                  />
                </label>

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-[#4f545a]">Nombre del producto</span>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                  />
                </label>

                {isServiceAdmin ? (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Precio o llamada a la acción</span>
                      <input
                        name="displayPriceOverride"
                        value={form.displayPriceOverride}
                        onChange={handleChange}
                        placeholder="Ej. Cotizar"
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Nota secundaria</span>
                      <input
                        name="displaySecondaryLabel"
                        value={form.displaySecondaryLabel}
                        onChange={handleChange}
                        placeholder="Ej. Diagnóstico técnico"
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Precio actual</span>
                      <input
                        name="precioValor"
                        type="number"
                        min="1"
                        value={form.precioValor}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Stock actual</span>
                      {isVariantModeActive ? (
                        <div className="w-full rounded-2xl border border-black/10 bg-[#f3f3f2] px-4 py-3 text-sm text-[#6e7379]">
                          {variantes.reduce((total, item) => total + (Number(item.stock) || 0), 0)} (suma de las medidas)
                        </div>
                      ) : (
                        <input
                          name="stock"
                          type="number"
                          min="0"
                          value={form.stock}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                        />
                      )}
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Precio anterior</span>
                      <input
                        name="precioAnteriorValor"
                        type="number"
                        min="1"
                        value={form.precioAnteriorValor}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Stock mínimo</span>
                      <input
                        name="stockMinimo"
                        type="number"
                        min="0"
                        value={form.stockMinimo}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>
                  </>
                )}

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-[#4f545a]">
                    Subir imagen del producto
                  </span>
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    required
                    className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-4 file:rounded-full file:border-0 file:bg-[#16384f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                  />
                  <p className="text-xs leading-6 text-[#6e7379]">
                    Formatos permitidos: JPG, PNG o WEBP. En local, si Storage no está configurado, se guardará una imagen temporal.
                  </p>
                  <p className="text-xs leading-6 text-[#6e7379]">
                    Recomendado: hasta {RECOMMENDED_FILE_SIZE_KB} KB por imagen. Límite máximo: 4 MB.
                  </p>
                  {selectedImage && (
                    <p className="text-xs leading-6 text-[#16384f]">
                      Archivo seleccionado: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                    </p>
                  )}
                </label>

                <div className="grid gap-5 md:col-span-2 md:grid-cols-3">
                  {Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, index) => (
                    <label
                      key={`create-extra-${index}`}
                      className="space-y-2 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-4"
                    >
                      <span className="text-sm font-medium text-[#4f545a]">
                        Imagen extra {index + 1}
                      </span>
                      <input
                        key={`${fileInputKey}-create-extra-${index}`}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleExtraImageChange(index)}
                        className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#16384f] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                      />
                      <p className="text-xs leading-6 text-[#6e7379]">
                        Opcional. Se mostrará como miniatura en la galería.
                      </p>
                      {selectedExtraImages[index] && (
                        <p className="text-xs leading-6 text-[#16384f]">
                          Archivo: {selectedExtraImages[index]?.name} ({Math.round((selectedExtraImages[index]?.size || 0) / 1024)} KB)
                        </p>
                      )}
                      {previewExtraImageUrls[index] && (
                        <div className="overflow-hidden rounded-[1rem] border border-black/8 bg-white">
                          <Image
                            src={previewExtraImageUrls[index] || ""}
                            alt={`Vista previa extra ${index + 1}`}
                            width={500}
                            height={500}
                            className="h-28 w-full object-contain bg-white"
                            unoptimized={previewExtraImageUrls[index]?.startsWith("blob:")}
                          />
                        </div>
                      )}
                    </label>
                  ))}
                </div>

                {previewImageUrl && (
                  <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4">
                    <p className="text-sm font-medium text-[#4f545a]">
                      Vista previa de la nueva imagen
                    </p>
                    <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/8 bg-white">
                      <Image
                        src={previewImageUrl}
                        alt={form.nombre || "Vista previa del producto"}
                        width={1200}
                        height={900}
                        className="h-64 w-full object-contain bg-white"
                        unoptimized={previewImageUrl.startsWith("blob:")}
                      />
                    </div>
                  </div>
                )}

                <ProductImageSelector
                  choices={productImageChoices}
                  primaryImageIndex={primaryImageIndex}
                  onSelect={setPrimaryImageIndex}
                  description="Puedes escoger cuál de las imágenes será la principal del producto."
                />

                <TechnicalSpecsEditor items={technicalSpecs} onChange={setTechnicalSpecs} />

                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium text-[#4f545a]">Descripción</span>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe el producto, su uso principal y el beneficio para el cliente."
                    className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm leading-7 text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                  />
                </label>

                {!isServiceAdmin && (
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-[#4f545a]">Disponibilidad</span>
                    <select
                      name="disponibilidad"
                      value={form.disponibilidad}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                    >
                      {disponibilidades.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <span className="text-sm font-medium text-[#4f545a]">Ficha técnica (PDF)</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-3 transition-colors hover:border-[var(--admin-accent)]/50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--admin-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  <span className="text-sm text-[#4f545a]">
                    {selectedPdf ? selectedPdf.name : "Sube acá tu ficha técnica"}
                  </span>
                  <input
                    key={`pdf-${fileInputKey}`}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setSelectedPdf(e.target.files?.[0] ?? null)}
                  />
                </label>
                {existingPdfUrl && !selectedPdf && (
                  <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--admin-accent)] underline">
                    Ver ficha técnica actual
                  </a>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {requestError && (
                  <p className="w-full rounded-2xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--admin-accent)]">
                    {requestError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="inline-flex rounded-full bg-[var(--admin-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--admin-accent-hover)]"
                >
                  {isSavingProduct ? "Guardando..." : "Crear producto"}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                >
                  Limpiar
                </button>
              </div>
            </form>
          )}

          {activeTab === "edit" && (
            <div className="admin-fade-up space-y-8">
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Edición
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Productos
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Usa la misma lógica visual del catálogo para encontrar el producto y editarlo más rápido.
                    </p>
                    {editingSlug && (
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="mt-5 inline-flex rounded-full border border-black/10 bg-[#f8f8f7] px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                      >
                        Salir de edición
                      </button>
                    )}
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                      Categorías
                    </h3>
                    <div className="mt-4 space-y-2">
                      <button
                        type="button"
                        onClick={() => setEditCategoryFilter("Todas")}
                        className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                          editCategoryFilter === "Todas"
                            ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                            : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todas
                      </button>
                      {categoryOptions.map((categoria) => (
                        <button
                          key={categoria}
                          type="button"
                          onClick={() => setEditCategoryFilter(categoria)}
                          className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors duration-200 ${
                            editCategoryFilter === categoria
                              ? "bg-[#16384f] text-white shadow-[0_12px_24px_rgba(22,56,79,0.18)]"
                              : "bg-[#f8f8f7] text-[#5d6167] hover:bg-[#ececea]"
                          }`}
                        >
                          {categoria}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="space-y-8">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Buscar por nombre o marca
                      </span>
                      <input
                        type="search"
                        value={editSearch}
                        onChange={(event) => setEditSearch(event.target.value)}
                        placeholder="Ej: sello, Universal de Cauchos, manguera..."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <p className="mt-4 text-sm text-[#6e7379]">
                      Mostrando {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} según los filtros actuales.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => {
                      const inventoryTone = getInventoryTone(product.estadoInventario);

                      return (
                        <article
                          key={product.slug}
                          className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-[0_16px_35px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1 ${
                            editingSlug === product.slug
                              ? "border-[#16384f] ring-2 ring-[#16384f]/12"
                              : "border-black/8"
                          }`}
                        >
                        <div className="relative">
                          <span className="absolute left-4 top-4 z-10 rounded-lg bg-[var(--admin-accent)] px-3 py-1 text-sm font-semibold text-white">
                            {product.descuento}
                          </span>
                          <Image
                            src={product.imagen}
                            alt={product.nombre}
                            width={900}
                            height={700}
                            className="h-56 w-full object-cover"
                          />
                        </div>

                        <div className="space-y-4 p-5">
                          <div>
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-[#8b8d91]">
                              {product.categoria} · {product.marca}
                            </p>
                            <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-[#1f2328]">
                              {product.nombre}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-[#6e7379]">{product.disponibilidad}</span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${inventoryTone.className}`}
                            >
                              {inventoryTone.label}
                            </span>
                          </div>

                          <div className="rounded-[1rem] border border-black/8 bg-[#fafaf9] px-4 py-3 text-sm text-[#5d6167]">
                            <div className="flex items-center justify-between gap-3">
                              <span>SKU</span>
                              <span className="font-semibold text-[#16384f]">
                                {product.sku || "Sin SKU"}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span>Stock</span>
                              <span className="font-semibold text-[#16384f]">
                                {product.stock ?? 0}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <span>Stock mínimo</span>
                              <span className="font-semibold text-[#16384f]">
                                {product.stockMinimo ?? 0}
                              </span>
                            </div>
                          </div>

                          <div className="border-t border-black/6 pt-4">
                            <p className="text-sm text-[#a0a3a8] line-through">
                              {product.precioAnterior}
                            </p>
                            <p className="text-3xl font-semibold tracking-[-0.03em] text-[var(--admin-accent)]">
                              {product.precio}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product.slug)}
                              className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.slug)}
                              className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                        </article>
                      );
                    })}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-10 text-center text-[#6e7379]">
                      No encontramos productos con ese nombre, marca o categoría.
                    </div>
                  )}
                </div>
              </div>

              {editingSlug && (
                <form
                  ref={editFormRef}
                  onSubmit={handleSubmit}
                  className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8"
                >
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                        Producto seleccionado
                      </p>
                      <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                        Actualizar producto
                      </h2>
                    </div>
                    {saved && (
                      <span className="rounded-full bg-[#16384f] px-4 py-2 text-sm font-semibold text-white">
                        Guardado
                      </span>
                    )}
                  </div>

                  {canUseVariantMode && (
                    <label className="mb-5 flex items-center gap-3 rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3">
                      <input
                        type="checkbox"
                        checked={variantMode}
                        onChange={(event) => setVariantMode(event.target.checked)}
                      />
                      <span className="text-sm font-medium text-[#4f545a]">
                        Este producto está categorizado por medidas
                      </span>
                    </label>
                  )}

                  {isVariantModeActive && (
                    <div className="mb-5">
                      <VariantesEditor items={variantes} onChange={setVariantes} />
                    </div>
                  )}

                  <div className="grid gap-5 md:grid-cols-2">
                    {!isVariantModeActive && (
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-[#4f545a]">SKU</span>
                        <input
                          name="sku"
                          value={form.sku}
                          onChange={handleChange}
                          placeholder="Ej. FAROLA001"
                          className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                        />
                      </label>
                    )}

                    <CategoryComboBox
                      label={adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy" ? "Categoría" : "Crear categoría"}
                      name="categoria"
                      value={form.categoria}
                      options={categoryOptions}
                      placeholder="Ej. Transporte, logística y puertos marítimos"
                      required
                      entityName="categoría"
                      strict={adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy"}
                      onChange={(value) => setForm((current) => ({ ...current, categoria: value }))}
                    />

                    {adminDivision !== "Import" && adminDivision !== "Plastic" && adminDivision !== "Energy" && (
                      <>
                        <MultiCategoryComboBox
                          label="Sub categorías"
                          name="subcategoria"
                          value={form.subcategorias}
                          options={subcategoryOptions}
                          placeholder="Ej. O-rings, Neopreno, EPDM"
                          entityName="subcategoría"
                          onChange={(value) => setForm((current) => ({ ...current, subcategorias: value }))}
                        />

                        <MultiCategoryComboBox
                          label="Categorías menores"
                          name="categoriaMenor"
                          value={form.categoriasMenores}
                          options={categoriaMenorOptions}
                          placeholder="Ej. Pintura para interior"
                          entityName="categoría menor"
                          onChange={(value) => setForm((current) => ({ ...current, categoriasMenores: value }))}
                        />
                      </>
                    )}

                    <AdditionalCategoriesEditor
                      items={form.categoriasAdicionales}
                      categoryOptions={categoryOptions}
                      adminProducts={adminProducts}
                      strictCategory={adminDivision === "Import" || adminDivision === "Plastic" || adminDivision === "Energy"}
                      onChange={(items) => setForm((current) => ({ ...current, categoriasAdicionales: items }))}
                    />

                    {!isServiceAdmin && (
                      <AdditionalDivisionsEditor
                        currentDivision={adminDivision}
                        items={form.categoriasPorDivision}
                        allProducts={allAdminProducts}
                        onChange={(items) => setForm((current) => ({ ...current, categoriasPorDivision: items }))}
                      />
                    )}

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">Marca</span>
                      <input
                        name="marca"
                        value={form.marca}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-[#4f545a]">Nombre del producto</span>
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    {isServiceAdmin ? (
                      <>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[#4f545a]">Precio o llamada a la acción</span>
                          <input
                            name="displayPriceOverride"
                            value={form.displayPriceOverride}
                            onChange={handleChange}
                            placeholder="Ej. Cotizar"
                            required
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[#4f545a]">Nota secundaria</span>
                          <input
                            name="displaySecondaryLabel"
                            value={form.displaySecondaryLabel}
                            onChange={handleChange}
                            placeholder="Ej. Diagnóstico técnico"
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>
                      </>
                    ) : (
                      <>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[#4f545a]">Precio actual</span>
                          <input
                            name="precioValor"
                            type="number"
                            min="1"
                            value={form.precioValor}
                            onChange={handleChange}
                            required
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[#4f545a]">Stock actual</span>
                          {isVariantModeActive ? (
                            <div className="w-full rounded-2xl border border-black/10 bg-[#f3f3f2] px-4 py-3 text-sm text-[#6e7379]">
                              {variantes.reduce((total, item) => total + (Number(item.stock) || 0), 0)} (suma de las medidas)
                            </div>
                          ) : (
                            <input
                              name="stock"
                              type="number"
                              min="0"
                              value={form.stock}
                              onChange={handleChange}
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                            />
                          )}
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[#4f545a]">Precio anterior</span>
                          <input
                            name="precioAnteriorValor"
                            type="number"
                            min="1"
                            value={form.precioAnteriorValor}
                            onChange={handleChange}
                            required
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[#4f545a]">Stock mínimo</span>
                          <input
                            name="stockMinimo"
                            type="number"
                            min="0"
                            value={form.stockMinimo}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>
                      </>
                    )}

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Cambiar imagen del producto
                      </span>
                      <input
                        key={fileInputKey}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageChange}
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-4 file:rounded-full file:border-0 file:bg-[#16384f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                      />
                      <p className="text-xs leading-6 text-[#6e7379]">
                        Si no subes una nueva imagen, se conserva la actual.
                      </p>
                      {selectedImage && (
                        <p className="text-xs leading-6 text-[#16384f]">
                          Archivo seleccionado: {selectedImage.name} ({Math.round(selectedImage.size / 1024)} KB)
                        </p>
                      )}
                    </label>

                    <div className="grid gap-5 md:col-span-2 md:grid-cols-3">
                      {Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, index) => (
                        <label
                          key={`edit-extra-${index}`}
                          className="space-y-2 rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-4"
                        >
                          <span className="text-sm font-medium text-[#4f545a]">
                            Imagen extra {index + 1}
                          </span>
                          <input
                            key={`${fileInputKey}-edit-extra-${index}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleExtraImageChange(index)}
                            className="w-full rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 file:mr-3 file:rounded-full file:border-0 file:bg-[#16384f] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0f2a3b]"
                          />
                          <p className="text-xs leading-6 text-[#6e7379]">
                            Opcional. Si no subes una nueva, se conserva la actual.
                          </p>
                          {selectedExtraImages[index] && (
                            <p className="text-xs leading-6 text-[#16384f]">
                              Archivo: {selectedExtraImages[index]?.name} ({Math.round((selectedExtraImages[index]?.size || 0) / 1024)} KB)
                            </p>
                          )}
                          {previewExtraImageUrls[index] && (
                            <div className="overflow-hidden rounded-[1rem] border border-black/8 bg-white">
                              <Image
                                src={previewExtraImageUrls[index] || ""}
                                alt={`Imagen extra ${index + 1}`}
                                width={500}
                                height={500}
                                className="h-28 w-full object-contain bg-white"
                                unoptimized={previewExtraImageUrls[index]?.startsWith("blob:")}
                              />
                            </div>
                          )}
                        </label>
                      ))}
                    </div>

                    {previewImageUrl && (
                      <div className="md:col-span-2 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-4">
                        <p className="text-sm font-medium text-[#4f545a]">
                          {selectedImage ? "Vista previa de la nueva imagen" : "Imagen actual del producto"}
                        </p>
                        <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/8 bg-white">
                          <Image
                            src={previewImageUrl}
                            alt={form.nombre || "Vista previa del producto"}
                            width={1200}
                            height={900}
                            className="h-64 w-full object-contain bg-white"
                            unoptimized={previewImageUrl.startsWith("blob:")}
                          />
                        </div>
                      </div>
                    )}

                    <ProductImageSelector
                      choices={productImageChoices}
                      primaryImageIndex={primaryImageIndex}
                      onSelect={setPrimaryImageIndex}
                      description="La imagen marcada como principal será la que verá primero el cliente."
                    />

                    <TechnicalSpecsEditor items={technicalSpecs} onChange={setTechnicalSpecs} />

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-medium text-[#4f545a]">Descripción</span>
                      <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe el producto, su uso principal y el beneficio para el cliente."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm leading-7 text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    {!isServiceAdmin && (
                      <label className="space-y-2 md:col-span-2">
                        <span className="text-sm font-medium text-[#4f545a]">Disponibilidad</span>
                        <select
                          name="disponibilidad"
                          value={form.disponibilidad}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                        >
                          {disponibilidades.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  <div className="mt-6 space-y-2">
                    <span className="text-sm font-medium text-[#4f545a]">Ficha técnica (PDF)</span>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-black/15 bg-[#fafaf9] px-4 py-3 transition-colors hover:border-[var(--admin-accent)]/50">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--admin-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                      <span className="text-sm text-[#4f545a]">
                        {selectedPdf ? selectedPdf.name : "Sube acá tu ficha técnica"}
                      </span>
                      <input
                        key={`pdf-edit-${fileInputKey}`}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => setSelectedPdf(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {existingPdfUrl && !selectedPdf && (
                      <a href={existingPdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--admin-accent)] underline">
                        Ver ficha técnica actual
                      </a>
                    )}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    {requestError && (
                      <p className="w-full rounded-2xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent-soft)] px-4 py-3 text-sm font-medium text-[var(--admin-accent)]">
                        {requestError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingProduct}
                      className="inline-flex rounded-full bg-[var(--admin-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--admin-accent-hover)]"
                    >
                      {isSavingProduct ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                    >
                      Cancelar edición
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="admin-fade-up space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3 rounded-[1.5rem] border border-black/8 bg-white px-5 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b8d91]">Informes</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[#16384f]">Métricas de ventas</h2>
                  <p className="mt-1 text-sm text-[#6e7379]">
                    Calculado desde los pedidos reales de esta unidad · <span className="font-semibold text-[#16384f]">{reportsPeriodLabel}</span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {salesReport && (
                    <span className="text-xs text-[#8b8d91]">
                      Actualizado {new Date(salesReport.generatedAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => void loadSalesReport()}
                    disabled={isLoadingReport}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white disabled:opacity-60"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${isLoadingReport ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4" />
                    </svg>
                    Recargar
                  </button>
                </div>
              </div>

              <DateRangeFilter
                presets={REPORT_PRESETS}
                preset={reportsPreset}
                range={reportsRange}
                accent={adminBrand.accent}
                isLoading={isLoadingReport && Boolean(salesReport)}
                onPresetChange={selectReportsPreset}
                onDateChange={changeReportsDate}
              />

              {isLoadingReport && !salesReport ? (
                <p className="rounded-[1.25rem] border border-black/8 bg-white p-6 text-sm text-[#6e7379]">Cargando métricas...</p>
              ) : !salesReport ? (
                <div className="rounded-[1.25rem] border border-dashed border-black/12 bg-white p-8 text-center text-sm text-[#6e7379]">
                  Aún no se ha cargado el informe. Usa “Recargar” para consultar las métricas.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 overflow-hidden rounded-[1.5rem] border border-black/8 bg-white shadow-[0_10px_22px_rgba(15,23,42,0.04)] md:grid-cols-3 xl:grid-cols-5">
                    {[
                      {
                        label: "Ingresos confirmados",
                        value: formatCurrency(salesReport.totals.paidRevenue),
                        helper: `${formatNumber(salesReport.totals.paidOrders)} ${salesReport.totals.paidOrders === 1 ? "pago confirmado" : "pagos confirmados"}`,
                        primary: true,
                      },
                      {
                        label: "Unidades vendidas",
                        value: formatNumber(salesReport.totals.productsSold),
                        helper: `${formatNumber(salesReport.totals.orders)} ${salesReport.totals.orders === 1 ? "pedido no cancelado" : "pedidos no cancelados"}`,
                      },
                      {
                        label: "Ticket promedio",
                        value: formatCurrency(salesReport.totals.averageOrderValue),
                        helper: "Por pedido activo",
                      },
                      {
                        label: "Pendientes de pago",
                        value: formatNumber(salesReport.totals.pendingOrders),
                        helper: `${formatNumber(salesReport.totals.cancelledOrders)} ${salesReport.totals.cancelledOrders === 1 ? "cancelado" : "cancelados"}`,
                      },
                      {
                        label: "Productos activos",
                        value: formatNumber(salesReport.totals.totalProducts),
                        helper: "En el catálogo",
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="border-b border-r border-black/8 px-5 py-4 last:border-r-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">{metric.label}</p>
                        <p className={`mt-1.5 text-2xl font-semibold tabular-nums tracking-[-0.03em] ${metric.primary ? "text-[var(--admin-accent)]" : "text-[#16384f]"}`}>
                          {metric.value}
                        </p>
                        <p className="mt-0.5 text-xs text-[#6e7379]">{metric.helper}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#16384f]">Productos más vendidos</h3>
                      <span className="text-xs text-[#8b8d91]">Unidades vendidas · top {salesReport.topProducts.length}</span>
                    </div>
                    {salesReport.topProducts.length === 0 ? (
                      <p className="mt-4 text-sm text-[#6e7379]">Aún no hay productos vendidos.</p>
                    ) : (
                      <ol className="mt-3 divide-y divide-black/6">
                        {salesReport.topProducts.map((product, index) => {
                          const maxSold = salesReport.topProducts[0]?.quantitySold || 1;
                          const width = Math.max(2, Math.round((product.quantitySold / maxSold) * 100));
                          return (
                            <li
                              key={product.productId}
                              className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-3 md:grid-cols-[1.5rem_minmax(0,1.2fr)_minmax(0,1fr)_5.5rem_7.5rem]"
                            >
                              <span className="text-sm font-semibold tabular-nums text-[#8b8d91]">{index + 1}</span>
                              <div className="min-w-0">
                                <p className="flex items-center gap-2 truncate text-sm font-semibold text-[#1f2328]">
                                  <span className="truncate">{product.name}</span>
                                  {index === 0 && (
                                    <span className="shrink-0 rounded-full bg-[var(--admin-accent-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#16384f]">
                                      Más vendido
                                    </span>
                                  )}
                                </p>
                                <p className="truncate text-xs text-[#8b8d91]">{product.category}</p>
                              </div>
                              <div
                                className="order-last col-span-3 h-2 rounded-full bg-[#eef0f2] md:order-none md:col-span-1"
                                title={`${product.name}: ${formatNumber(product.quantitySold)} unidades`}
                              >
                                <span className="block h-full rounded-full bg-[var(--admin-accent)]" style={{ width: `${width}%` }} />
                              </div>
                              <span className="hidden text-right text-sm font-semibold tabular-nums text-[#16384f] md:block">
                                {formatNumber(product.quantitySold)} und.
                              </span>
                              <span className="text-right text-sm tabular-nums text-[#5d6167]">
                                <span className="font-semibold text-[#16384f] md:hidden">{formatNumber(product.quantitySold)} und. · </span>
                                {formatCurrency(product.revenue)}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-base font-semibold text-[#16384f]">Ventas por categoría</h3>
                        <span className="text-xs text-[#8b8d91]">Ingresos</span>
                      </div>
                      {salesReport.categories.length === 0 ? (
                        <p className="mt-4 text-sm text-[#6e7379]">Aún no hay categorías con ventas.</p>
                      ) : (
                        <ul className="mt-3 space-y-3">
                          {salesReport.categories.map((category) => {
                            const maxRevenue = Math.max(...salesReport.categories.map((entry) => entry.revenue), 1);
                            return (
                              <li key={category.category}>
                                <div className="flex items-baseline justify-between gap-3 text-sm">
                                  <span className="min-w-0 truncate font-medium text-[#1f2328]">{category.category}</span>
                                  <span className="shrink-0 tabular-nums text-[#5d6167]">
                                    <span className="text-xs text-[#8b8d91]">{formatNumber(category.quantitySold)} und. · </span>
                                    <span className="font-semibold text-[#16384f]">{formatCurrency(category.revenue)}</span>
                                  </span>
                                </div>
                                <div
                                  className="mt-1.5 h-1.5 rounded-full bg-[#eef0f2]"
                                  title={`${category.category}: ${formatCurrency(category.revenue)}`}
                                >
                                  <span
                                    className="block h-full rounded-full bg-[var(--admin-accent)]"
                                    style={{ width: `${Math.max(2, Math.round((category.revenue / maxRevenue) * 100))}%` }}
                                  />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_10px_22px_rgba(15,23,42,0.04)]">
                      <h3 className="text-base font-semibold text-[#16384f]">Pedidos recientes</h3>
                      {salesReport.recentOrders.length === 0 ? (
                        <p className="mt-4 text-sm text-[#6e7379]">Aún no hay pedidos registrados.</p>
                      ) : (
                        <ul className="mt-2 divide-y divide-black/6">
                          {salesReport.recentOrders.map((order) => (
                            <li key={order.id} className="flex items-center gap-3 py-2.5 text-sm">
                              <span className="w-14 shrink-0 font-semibold tabular-nums text-[#16384f]">
                                {formatOrderCode(order.orderNumber)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-[#1f2328]">{order.customerName}</p>
                                <p className="text-xs text-[#8b8d91]">
                                  {new Date(order.createdAt).toLocaleDateString("es-CO")} · {order.totalItems} producto{order.totalItems === 1 ? "" : "s"}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  order.paymentStatus === "PAID"
                                    ? "bg-[#effaf2] text-[#1f6b39]"
                                    : order.paymentStatus === "FAILED"
                                      ? "bg-[#fff1f1] text-[#c53b3b]"
                                      : "bg-[#fff6e5] text-[#9a6200]"
                                }`}
                              >
                                {getPaymentStatusLabel(order.paymentStatus)}
                              </span>
                              <span className="w-24 shrink-0 text-right font-semibold tabular-nums text-[#16384f]">
                                {formatCurrency(order.subtotal)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="admin-fade-up space-y-8">
              <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Panel maestro
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Informes generales
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6e7379]">
                      Ingresos, unidades vendidas y productos de cada unidad de negocio de GEU.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadDivisionOverview()}
                    className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Recargar informes
                  </button>
                </div>

                {!divisionOverview ? (
                  <p className="mt-8 text-sm text-[#6e7379]">Cargando informes de cada unidad...</p>
                ) : (
                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {DIVISIONS.map((division) => {
                      const brand = ADMIN_BRAND_CONFIG[division];
                      const summary = divisionOverview[division];
                      const isExpanded = expandedOverviewDivision === division;
                      const nonEmptyPriceRanges = summary.priceRanges.filter((range) => range.count > 0);
                      const maxRangeCount = Math.max(...nonEmptyPriceRanges.map((range) => range.count), 1);

                      return (
                        <div
                          key={division}
                          className={`flex flex-col gap-4 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-5 ${
                            isExpanded ? "md:col-span-2 xl:col-span-3" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)]"
                              style={{ backgroundColor: brand.accent }}
                            >
                              {brand.label.charAt(0)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#1f2328]">{brand.label}</p>
                              <button
                                type="button"
                                onClick={() => void switchDivision(division)}
                                disabled={isSwitchingDivision}
                                className="text-xs font-semibold text-[var(--admin-accent)] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {division === adminDivision ? "Estás aquí ahora" : "Entrar al panel"}
                              </button>
                            </div>
                          </div>

                          {isServiceDivision(division) ? (
                            <p className="text-sm leading-6 text-[#6e7379]">
                              Esta unidad no maneja productos ni pedidos: solo contenido del sitio.
                            </p>
                          ) : (
                            <>
                              <div className="space-y-2 border-t border-black/8 pt-4 text-sm">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#8b8d91]">Ingresos pagados</span>
                                  <span className="font-semibold text-[#1f2328]">
                                    {formatCurrency(summary.paidRevenue)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#8b8d91]">Unidades vendidas</span>
                                  <span className="font-semibold text-[#1f2328]">
                                    {formatNumber(summary.productsSold)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#8b8d91]">Pedidos</span>
                                  <span className="font-semibold text-[#1f2328]">
                                    {formatNumber(summary.orders)}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedOverviewDivision((current) =>
                                      current === division ? null : division,
                                    )
                                  }
                                  className="flex w-full items-center justify-between gap-2 rounded-lg -mx-2 px-2 py-1 text-left transition-colors duration-200 hover:bg-black/5"
                                >
                                  <span className="text-[#8b8d91]">Productos</span>
                                  <span className="flex items-center gap-1.5 font-semibold text-[var(--admin-accent)]">
                                    {formatNumber(summary.totalProducts)}
                                    <svg
                                      viewBox="0 0 24 24"
                                      className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="m6 9 6 6 6-6" />
                                    </svg>
                                  </span>
                                </button>
                              </div>

                              {isExpanded && (
                                <div className="grid gap-6 border-t border-black/8 pt-4 lg:grid-cols-2">
                                  <div>
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                                        Distribución de precios
                                      </p>
                                      <p className="text-xs font-semibold text-[#1f2328]">
                                        Total: {formatNumber(summary.totalProducts)}
                                      </p>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                      {nonEmptyPriceRanges.length === 0 ? (
                                        <p className="text-sm text-[#6e7379]">
                                          Aún no hay productos con precio registrado.
                                        </p>
                                      ) : (
                                        nonEmptyPriceRanges.map((range) => {
                                          const progress = Math.max(
                                            8,
                                            Math.round((range.count / maxRangeCount) * 100),
                                          );

                                          return (
                                            <div
                                              key={range.label}
                                              className="flex flex-wrap items-center gap-3 rounded-lg bg-white px-3 py-2 text-xs"
                                            >
                                              <span className="w-32 shrink-0 font-semibold text-[#1f2328]">
                                                {range.label}
                                              </span>
                                              <span className="h-1.5 flex-1 basis-16 overflow-hidden rounded-full bg-[#e5e7eb]">
                                                <span
                                                  className="block h-full rounded-full bg-[#0f766e]"
                                                  style={{ width: `${progress}%` }}
                                                />
                                              </span>
                                              <span className="w-8 shrink-0 text-right font-semibold text-[var(--admin-accent)]">
                                                {formatNumber(range.count)}
                                              </span>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                                      Productos más vendidos
                                    </p>
                                    <div className="mt-3 space-y-2">
                                      {summary.topProducts.length === 0 ? (
                                        <p className="text-sm text-[#6e7379]">Aún no hay productos vendidos.</p>
                                      ) : (
                                        summary.topProducts.map((product, index) => (
                                          <div
                                            key={product.productId}
                                            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-xs"
                                          >
                                            <span className="min-w-0 truncate font-semibold text-[#1f2328]">
                                              {index + 1}. {product.name}
                                            </span>
                                            <span className="shrink-0 font-semibold text-[var(--admin-accent)]">
                                              {formatNumber(product.quantitySold)} vendidos
                                            </span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="admin-fade-up space-y-6">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#16384f]">Pedidos</h2>
                <p className="mt-1 text-sm text-[#6e7379]">
                  Gestiona y monitorea todos los pedidos y envíos de tu negocio.
                </p>
              </div>

              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8d91]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.4-3.4" />
                </svg>
                <input
                  type="search"
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="Buscar por pedido, cliente o producto..."
                  className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-[#1f2328] shadow-[0_8px_20px_rgba(15,23,42,0.05)] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setOrderShippingFilter("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                    orderShippingFilter === "all"
                      ? "bg-[#16384f] text-white"
                      : "border border-black/10 bg-white text-[#5d6167] hover:bg-[#fafaf9]"
                  }`}
                >
                  Todos {orderStatusCounts.all}
                </button>
                {shippingStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderShippingFilter(status)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      orderShippingFilter === status
                        ? "bg-[#16384f] text-white"
                        : "border border-black/10 bg-white text-[#5d6167] hover:bg-[#fafaf9]"
                    }`}
                  >
                    {getShippingStatusLabel(status)} {orderStatusCounts[status]}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-label="Ver pedidos anteriores"
                  onClick={() => orderCardsScrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
                  className="absolute -left-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#5d6167] shadow-[0_8px_18px_rgba(15,23,42,0.1)] hover:text-[var(--admin-accent)] md:flex"
                >
                  ‹
                </button>
                <div
                  ref={orderCardsScrollRef}
                  className="flex gap-3 overflow-x-auto scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {isLoadingOrders ? (
                    <p className="py-4 text-sm text-[#6e7379]">Cargando pedidos...</p>
                  ) : filteredOrders.length === 0 ? (
                    <p className="py-4 text-sm text-[#6e7379]">
                      Aún no hay pedidos que coincidan con los filtros actuales.
                    </p>
                  ) : (
                    filteredOrders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setOrderForm(getOrderEditState(order));
                        }}
                        className={`w-[190px] shrink-0 rounded-2xl border bg-white p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition-colors duration-200 ${
                          selectedOrderId === order.id
                            ? "border-[var(--admin-accent)] ring-2 ring-[var(--admin-accent)]/15"
                            : "border-black/8 hover:border-black/16"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#16384f]">
                            {formatOrderCode(order.orderNumber)}
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SHIPPING_STATUS_BADGE_CLASS[order.shippingStatus]}`}
                          >
                            {getShippingStatusLabel(order.shippingStatus)}
                          </span>
                        </div>
                        <p className="mt-2 truncate text-xs font-medium text-[#5d6167]">
                          {order.customerName}
                        </p>
                        <p className="mt-0.5 text-xs text-[#8b8d91]">
                          {order.city} · {formatCurrency(order.subtotal + order.shippingCost)}
                        </p>
                        {isOrderDelayed(order) && (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                            ⚠ Atrasado
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Ver más pedidos"
                  onClick={() => orderCardsScrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
                  className="absolute -right-3 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-[#5d6167] shadow-[0_8px_18px_rgba(15,23,42,0.1)] hover:text-[var(--admin-accent)] md:flex"
                >
                  ›
                </button>
              </div>

              {!selectedOrder || !selectedOrderPreview ? (
                <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-8 text-center text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  Selecciona un pedido para ver su detalle y actualizar su envío.
                </div>
              ) : (
                <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.65fr)_360px]">
                  <div className="min-w-0 space-y-6">
                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-[#16384f]">
                            Pedido {formatOrderCode(selectedOrderPreview.orderNumber)}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${SHIPPING_STATUS_BADGE_CLASS[selectedOrderPreview.shippingStatus]}`}
                          >
                            {getShippingStatusLabel(selectedOrderPreview.shippingStatus)}
                          </span>
                          {isOrderDelayed(selectedOrderPreview) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                              ⚠ Pedido atrasado
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          title="Imprimir pedido"
                          aria-label="Imprimir pedido"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-[#5d6167] transition-colors duration-200 hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]"
                        >
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9V3h12v6" />
                            <rect x="4" y="9" width="16" height="8" rx="1.5" />
                            <path d="M6 15h12v6H6z" />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-[#5d6167]">
                        <p className="flex items-center gap-2.5 [overflow-wrap:anywhere]">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="8" r="3.5" />
                            <path d="M5 20c1.2-3.5 4-5.5 7-5.5s5.8 2 7 5.5" />
                          </svg>
                          {selectedOrderPreview.customerName}
                        </p>
                        <p className="flex items-center gap-2.5 [overflow-wrap:anywhere]">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m4 7 8 6 8-6" />
                          </svg>
                          {selectedOrderPreview.customerEmail}
                        </p>
                        {selectedOrderPreview.customerPhone && (
                          <p className="flex items-center gap-2.5 [overflow-wrap:anywhere]">
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
                            </svg>
                            <a
                              href={`tel:${selectedOrderPreview.customerPhone.replace(/[^\d+]/g, "")}`}
                              className="transition-colors hover:text-[var(--admin-accent)] hover:underline"
                            >
                              {selectedOrderPreview.customerPhone}
                            </a>
                            {toWhatsAppNumber(selectedOrderPreview.customerPhone) && (
                              <a
                                href={`https://wa.me/${toWhatsAppNumber(selectedOrderPreview.customerPhone)}?text=${encodeURIComponent(
                                  `Hola ${selectedOrderPreview.customerName}, te escribimos de ${adminBrand.label} sobre tu pedido ${formatOrderCode(selectedOrderPreview.orderNumber)}.`,
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#1ebe5a]"
                              >
                                <svg aria-hidden="true" viewBox="0 0 32 32" className="h-3.5 w-3.5 fill-white">
                                  <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.352.615 4.646 1.784 6.667L2.667 29.333l6.83-1.766a13.28 13.28 0 0 0 6.507 1.706h.006c7.362 0 13.333-5.97 13.333-13.333S23.366 2.667 16.004 2.667Zm7.82 18.81c-.332.933-1.65 1.71-2.694 1.933-.716.153-1.652.276-4.802-1.032-4.03-1.67-6.626-5.75-6.828-6.014-.194-.267-1.64-2.183-1.64-4.166 0-1.982 1.036-2.955 1.404-3.36.368-.406.803-.507 1.07-.507.267 0 .535.003.767.014.246.011.577-.093.902.688.332.798 1.128 2.767 1.226 2.968.098.2.164.435.033.7-.13.267-.196.434-.39.667-.196.234-.41.522-.586.7-.196.196-.4.408-.172.8.229.392 1.017 1.68 2.183 2.72 1.5 1.34 2.764 1.755 3.156 1.95.392.196.62.164.85-.1.229-.267.98-1.144 1.243-1.535.264-.392.527-.327.884-.196.36.13 2.28 1.075 2.672 1.27.392.196.653.294.751.457.098.163.098.947-.234 1.88Z" />
                                </svg>
                                WhatsApp
                              </a>
                            )}
                          </p>
                        )}
                        {selectedOrderPreview.company && (
                          <p className="flex items-center gap-2.5 [overflow-wrap:anywhere]">
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3" />
                            </svg>
                            {selectedOrderPreview.company}
                          </p>
                        )}
                        <p className="flex items-center gap-2.5 [overflow-wrap:anywhere]">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
                            <circle cx="12" cy="10" r="2.5" />
                          </svg>
                          {selectedOrderPreview.department}, {selectedOrderPreview.city} · {selectedOrderPreview.addressLine1}
                          {selectedOrderPreview.addressLine2 ? ` · ${selectedOrderPreview.addressLine2}` : ""}
                        </p>
                        <p className="flex items-center gap-2.5 [overflow-wrap:anywhere]">
                          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4.5" width="18" height="16" rx="2" />
                            <path d="M3 9h18M8 3v3M16 3v3" />
                          </svg>
                          Creado: {new Date(selectedOrderPreview.createdAt).toLocaleString("es-CO")}
                        </p>
                      </div>

                      {selectedOrderDestinations.length > 0 && (
                        <div className="mt-5 border-t border-black/8 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-accent)]">
                            Envío a {selectedOrderDestinations.length} direcciones
                          </p>
                          <div className="mt-3 space-y-3">
                            {selectedOrderDestinations.map((destination, index) => (
                              <div
                                key={`${destination.label}-${index}`}
                                className="rounded-[1rem] border border-black/8 bg-[#fafaf9] px-4 py-3 text-sm"
                              >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <p className="font-semibold text-[#16384f]">{destination.label}</p>
                                  <p className="text-xs text-[#8b8d91]">
                                    Envío {formatCurrency(destination.shippingCost)}
                                  </p>
                                </div>
                                <p className="mt-1 text-[#5d6167] [overflow-wrap:anywhere]">
                                  {formatShippingDestinationAddress(destination)}
                                </p>
                                <ul className="mt-2 space-y-0.5 text-[#1f2328]">
                                  {destination.items.map((item) => (
                                    <li key={item.cartItemId} className="flex justify-between gap-3">
                                      <span className="min-w-0 truncate">{item.name}</span>
                                      <span className="shrink-0 font-semibold">× {item.quantity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedOrderPreview.notes && (
                        <div className="mt-5 border-t border-black/8 pt-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                            Notas del cliente
                          </p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#5d6167]">
                            {selectedOrderPreview.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                          Resumen del pedido
                        </p>
                        <span className="rounded-full bg-[#fafaf9] px-3 py-1 text-xs font-semibold text-[#16384f]">
                          {selectedOrderPreview.totalItems} producto
                          {selectedOrderPreview.totalItems === 1 ? "" : "s"}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {selectedOrderPreview.items.map((item) => (
                          <div
                            key={`summary-${item.id}`}
                            className="flex items-center gap-3 rounded-[1rem] border border-black/8 px-3 py-3"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 shrink-0 rounded-lg border border-black/8 object-contain"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#1f2328]">{item.name}</p>
                              {item.variantSku && (
                                <p className="mt-0.5 text-xs text-[#8b8d91]">Código: {item.variantSku}</p>
                              )}
                              {item.ownerDivision && item.ownerDivision !== item.division && (
                                <p className="mt-1 inline-flex rounded-full bg-[#fff6e5] px-2 py-0.5 text-[11px] font-semibold text-[#9a6200]">
                                  Compartido · producto de {ADMIN_BRAND_CONFIG[item.ownerDivision].label}, vendido en{" "}
                                  {ADMIN_BRAND_CONFIG[item.division].label}
                                </p>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-xs text-[#8b8d91]">
                                {item.quantity} × {formatCurrency(item.unitPrice)}
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-[var(--admin-accent)]">
                                {formatCurrency(item.lineTotal)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 space-y-1.5 border-t border-black/8 pt-4 text-sm">
                        <div className="flex items-center justify-between text-[#6e7379]">
                          <span>Subtotal</span>
                          <span>{formatCurrency(selectedOrderPreview.subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[#6e7379]">
                          <span>Envío</span>
                          <span>{formatCurrency(selectedOrderPreview.shippingCost)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 text-base font-semibold text-[#16384f]">
                          <span>Total del pedido</span>
                          <span>
                            {formatCurrency(selectedOrderPreview.subtotal + selectedOrderPreview.shippingCost)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <AdminOrderProgress order={selectedOrderPreview} />
                    </div>

                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <label className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                          Notas internas
                        </span>
                        <textarea
                          name="adminNotes"
                          value={orderForm.adminNotes}
                          onChange={handleOrderFieldChange}
                          rows={3}
                          placeholder="Ej. Sale hoy en la tarde, cliente pidió entregar en portería..."
                          className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleSaveOrder}
                        disabled={isSavingOrder}
                        className="inline-flex rounded-full bg-[#16384f] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSavingOrder ? "Guardando..." : "Actualizar pedido"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void loadOrders()}
                        className="inline-flex rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                      >
                        Recargar pedidos
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-6">
                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                        Información logística
                      </p>
                      <div className="mt-4 space-y-4">
                        <label className="space-y-1.5">
                          <span className="text-sm font-medium text-[#4f545a]">Estado de envío</span>
                          <select
                            name="shippingStatus"
                            value={orderForm.shippingStatus}
                            onChange={handleOrderFieldChange}
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          >
                            {shippingStatuses.map((status) => (
                              <option key={status} value={status}>
                                {getShippingStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-sm font-medium text-[#4f545a]">Transportadora</span>
                          <input
                            name="carrier"
                            value={orderForm.carrier}
                            onChange={handleOrderFieldChange}
                            placeholder="Ej. Coordinadora, Servientrega..."
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-sm font-medium text-[#4f545a]">Número de guía</span>
                          <input
                            name="trackingNumber"
                            value={orderForm.trackingNumber}
                            onChange={handleOrderFieldChange}
                            placeholder="Ej. 123456789"
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>
                        <label className="space-y-1.5">
                          <span className="text-sm font-medium text-[#4f545a]">Fecha estimada de entrega</span>
                          <input
                            type="date"
                            name="estimatedDeliveryAt"
                            value={orderForm.estimatedDeliveryAt}
                            onChange={handleOrderFieldChange}
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                          <span className="block text-xs text-[#8b8d91]">
                            El cliente la ve en Mi cuenta y en el correo de envío.
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                        Historial del pedido
                      </p>
                      <ul className="mt-4 space-y-4">
                        <li className="flex gap-3">
                          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-accent)]" />
                          <div>
                            <p className="text-xs text-[#8b8d91]">
                              {new Date(selectedOrderPreview.createdAt).toLocaleString("es-CO")}
                            </p>
                            <p className="text-sm font-semibold text-[#1f2328]">Pedido creado</p>
                            <p className="text-sm text-[#6e7379]">El pedido quedó registrado correctamente.</p>
                          </div>
                        </li>
                        {selectedOrderPreview.shippedAt && (
                          <li className="flex gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-accent)]" />
                            <div>
                              <p className="text-xs text-[#8b8d91]">
                                {new Date(selectedOrderPreview.shippedAt).toLocaleString("es-CO")}
                              </p>
                              <p className="text-sm font-semibold text-[#1f2328]">Pedido enviado</p>
                            </div>
                          </li>
                        )}
                        {selectedOrderPreview.deliveredAt && (
                          <li className="flex gap-3">
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--admin-accent)]" />
                            <div>
                              <p className="text-xs text-[#8b8d91]">
                                {new Date(selectedOrderPreview.deliveredAt).toLocaleString("es-CO")}
                              </p>
                              <p className="text-sm font-semibold text-[#1f2328]">Pedido entregado</p>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "customers" && (
            <div className="admin-fade-up space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#16384f]">Clientes</h2>
                  <p className="mt-1 text-sm text-[#6e7379]">
                    Todas las cuentas creadas en la tienda y lo que cada cliente ha comprado en {adminBrand.label}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadCustomers()}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#5d6167] transition-colors duration-200 hover:bg-[#fafaf9]"
                >
                  Actualizar
                </button>
              </div>

              <div className="relative">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8d91]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.4-3.4" />
                </svg>
                <input
                  type="search"
                  value={customerSearch}
                  onChange={(event) => setCustomerSearch(event.target.value)}
                  placeholder="Buscar por nombre, correo, teléfono, empresa o ciudad..."
                  className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-[#1f2328] shadow-[0_8px_20px_rgba(15,23,42,0.05)] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(["all", ...CUSTOMER_STATUS_ORDER] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setCustomerStatusFilter(status)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                      customerStatusFilter === status
                        ? "bg-[#16384f] text-white"
                        : "border border-black/10 bg-white text-[#5d6167] hover:bg-[#fafaf9]"
                    }`}
                  >
                    {status === "all" ? "Todos" : CUSTOMER_STATUS_META[status].label} {customerStatusCounts[status]}
                  </button>
                ))}
              </div>

              <div className="overflow-hidden rounded-2xl border border-black/8 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.05)]">
                <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_90px_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-black/8 bg-[#fafaf9] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8b8d91] lg:grid">
                  <span>Cliente</span>
                  <span>Ciudad</span>
                  <span>Registro</span>
                  <span className="text-right">Pedidos</span>
                  <span className="text-right">Total comprado</span>
                  <span className="text-right">Estado</span>
                </div>

                {isLoadingCustomers && customers.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-[#6e7379]">Cargando clientes...</p>
                ) : filteredCustomers.length === 0 ? (
                  <p className="px-5 py-6 text-sm text-[#6e7379]">
                    Aún no hay clientes que coincidan con los filtros actuales.
                  </p>
                ) : (
                  <ul className="divide-y divide-black/6">
                    {filteredCustomers.map((customer) => {
                      const isExpanded = expandedCustomerId === customer.id;
                      const statusMeta = CUSTOMER_STATUS_META[customer.status];

                      return (
                        <li key={customer.id}>
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedCustomerId(isExpanded ? null : customer.id)}
                            className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 px-5 py-4 text-left transition-colors duration-200 hover:bg-[#fafaf9] lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_90px_minmax(0,1fr)_minmax(0,1fr)] lg:items-center ${
                              isExpanded ? "bg-[#fafaf9]" : ""
                            }`}
                          >
                            <span className="min-w-0">
                              <span className="flex items-center gap-2">
                                <span className="truncate text-sm font-semibold text-[#16384f]">
                                  {customer.fullName || "Sin nombre"}
                                </span>
                                {!customer.active && (
                                  <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                    Desactivado
                                  </span>
                                )}
                              </span>
                              <span className="block truncate text-xs text-[#8b8d91]">{customer.email}</span>
                            </span>
                            <span className="text-right lg:hidden">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </span>
                            </span>
                            <span className="hidden truncate text-sm text-[#5d6167] lg:block">
                              {[customer.city, customer.department].filter(Boolean).join(", ") || "—"}
                            </span>
                            <span className="hidden text-sm text-[#5d6167] lg:block">
                              {formatShortDate(customer.createdAt)}
                            </span>
                            <span className="hidden text-right text-sm font-semibold text-[#16384f] lg:block">
                              {customer.paidOrdersCount}
                            </span>
                            <span className="hidden text-right text-sm font-semibold text-[#16384f] lg:block">
                              {formatCurrency(customer.totalSpent)}
                            </span>
                            <span className="col-span-2 text-xs text-[#8b8d91] lg:hidden">
                              {customer.paidOrdersCount} pedido{customer.paidOrdersCount === 1 ? "" : "s"} pagado
                              {customer.paidOrdersCount === 1 ? "" : "s"} · {formatCurrency(customer.totalSpent)} · desde{" "}
                              {formatShortDate(customer.createdAt)}
                            </span>
                            <span className="hidden text-right lg:block">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}
                              >
                                {statusMeta.label}
                              </span>
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="space-y-4 border-t border-black/6 bg-[#fafaf9] px-5 pb-5 pt-4">
                              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                  <dt className="text-xs text-[#8b8d91]">Teléfono</dt>
                                  <dd className="font-medium text-[#1f2328]">{customer.phone || "—"}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-[#8b8d91]">Empresa</dt>
                                  <dd className="font-medium text-[#1f2328]">{customer.company || "—"}</dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-[#8b8d91]">Última compra</dt>
                                  <dd className="font-medium text-[#1f2328]">
                                    {customer.lastPurchaseAt ? formatShortDate(customer.lastPurchaseAt) : "—"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs text-[#8b8d91]">Productos en el carrito</dt>
                                  <dd className="font-medium text-[#1f2328]">{customer.cartItemsCount}</dd>
                                </div>
                              </dl>

                              {customer.orders.length === 0 ? (
                                <p className="text-sm text-[#6e7379]">
                                  Este cliente aún no tiene pedidos en {adminBrand.label}.
                                </p>
                              ) : (
                                <ul className="space-y-2">
                                  {customer.orders.map((order) => (
                                    <li
                                      key={order.id}
                                      className="rounded-xl border border-black/8 bg-white p-4"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-sm font-semibold text-[#16384f]">
                                            {formatOrderCode(order.orderNumber)}
                                          </span>
                                          <span className="text-xs text-[#8b8d91]">
                                            {formatShortDate(order.createdAt)}
                                          </span>
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                              order.paymentStatus === "PAID"
                                                ? "bg-emerald-50 text-emerald-700"
                                                : order.paymentStatus === "FAILED"
                                                  ? "bg-red-50 text-red-700"
                                                  : "bg-amber-50 text-amber-700"
                                            }`}
                                          >
                                            {getPaymentStatusLabel(order.paymentStatus)}
                                          </span>
                                          <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${SHIPPING_STATUS_BADGE_CLASS[order.shippingStatus]}`}
                                          >
                                            {getShippingStatusLabel(order.shippingStatus)}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm font-semibold text-[#16384f]">
                                            {formatCurrency(order.total)}
                                          </span>
                                          {canAccessTool("orders") && (
                                            <button
                                              type="button"
                                              onClick={() => openOrderFromCustomer(order.id, order.orderNumber)}
                                              className="text-xs font-semibold text-[var(--admin-accent)] hover:underline"
                                            >
                                              Ver pedido →
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      <ul className="mt-2 space-y-0.5 text-xs text-[#5d6167]">
                                        {order.items.map((item) => (
                                          <li key={item.id} className="flex justify-between gap-3">
                                            <span className="truncate">
                                              {item.quantity} × {item.name}
                                            </span>
                                            <span className="shrink-0">{formatCurrency(item.lineTotal)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}

          {activeTab === "quotes" && (
            <div className="admin-fade-up space-y-6">
              <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">Cotizaciones</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                  Solicitudes de evaluación técnica
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                  Estas solicitudes las envían los clientes desde el asistente &quot;Hablemos de tu proyecto&quot; del sitio.
                  Arrastra una tarjeta a otra columna para cambiar su estado, o haz clic para ver el detalle y responder.
                </p>
              </div>

              {isLoadingQuotes ? (
                <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  Cargando cotizaciones...
                </div>
              ) : quotes.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                  Aún no hay solicitudes de cotización.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {quoteColumns.map(({ status, items }) => {
                    const theme = QUOTE_STATUS_THEME[status];
                    return (
                      <div
                        key={status}
                        onDragOver={(event) => {
                          if (!draggingQuoteId) return;
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          if (quoteDropStatus !== status) setQuoteDropStatus(status);
                        }}
                        onDragLeave={(event) => {
                          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                            setQuoteDropStatus((current) => (current === status ? null : current));
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const id = event.dataTransfer.getData("text/plain") || draggingQuoteId;
                          setDraggingQuoteId(null);
                          setQuoteDropStatus(null);
                          if (id) void moveQuoteToStatus(id, status);
                        }}
                        className={`flex flex-col gap-3 rounded-[1.5rem] p-4 transition-colors duration-150 ${
                          quoteDropStatus === status ? "bg-[var(--admin-accent-soft)] ring-2 ring-[var(--admin-accent)]/40" : "bg-[#f0f1ee]"
                        }`}
                      >
                        <div className="flex items-center justify-between px-1">
                          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#5d6167]">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.dot }} />
                            {getQuoteStatusLabel(status)}
                          </span>
                          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#8b8d91] shadow-sm">
                            {items.length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {items.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-black/10 p-4 text-center text-xs text-[#9a9da2]">
                              {draggingQuoteId ? "Suelta aquí" : "Sin solicitudes"}
                            </div>
                          ) : (
                            items.map((quote) => (
                              <button
                                key={quote.id}
                                type="button"
                                draggable
                                onDragStart={(event) => {
                                  event.dataTransfer.setData("text/plain", quote.id);
                                  event.dataTransfer.effectAllowed = "move";
                                  setDraggingQuoteId(quote.id);
                                }}
                                onDragEnd={() => {
                                  setDraggingQuoteId(null);
                                  setQuoteDropStatus(null);
                                }}
                                onClick={() => setSelectedQuoteId(quote.id)}
                                className={`block w-full cursor-grab rounded-2xl border border-black/8 bg-white p-4 text-left shadow-[0_8px_18px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.1)] active:cursor-grabbing ${
                                  draggingQuoteId === quote.id ? "opacity-40" : ""
                                }`}
                              >
                                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a9da2]">
                                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.dot }} />
                                  {new Date(quote.createdAt).toLocaleDateString("es-CO")}
                                </span>
                                <p className="mt-2 text-base font-bold leading-tight text-[#16384f]">{quote.company}</p>
                                <p className="mt-1 text-xs text-[#6e7379]">{quote.fullName}</p>
                                {quote.requestType && (
                                  <span className="mt-3 inline-flex rounded-full bg-[#fafaf9] px-2.5 py-1 text-[11px] font-semibold text-[#5d6167]">
                                    {quote.requestType}
                                  </span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedQuote && (
                <div
                  className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 px-4 py-8"
                  onClick={() => setSelectedQuoteId(null)}
                >
                  <div
                    className="w-full max-w-3xl rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_30px_80px_rgba(2,6,23,0.25)] md:p-8"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-3xl font-bold tracking-[-0.04em] text-[#16384f]">
                          {selectedQuote.company}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.04em] ${
                            selectedQuote.status === "CLOSED"
                              ? "bg-[#effaf2] text-[#1f6b39]"
                              : selectedQuote.status === "CONTACTED"
                                ? "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"
                                : "bg-[#fff4e5] text-[#a15c00]"
                          }`}
                        >
                          {getQuoteStatusLabel(selectedQuote.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={selectedQuote.status}
                          disabled={isSavingQuoteStatus}
                          onChange={(event) =>
                            void handleQuoteStatusChange(
                              selectedQuote.id,
                              event.target.value as QuoteStatusValue,
                            )
                          }
                          className="rounded-full border border-black/10 bg-[#fafaf9] px-4 py-2 text-xs font-semibold text-[#4f545a] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                        >
                          {quoteStatuses.map((status) => (
                            <option key={status} value={status}>
                              Marcar como {getQuoteStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label="Cerrar"
                          onClick={() => setSelectedQuoteId(null)}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-lg font-semibold text-[#8b8d91] transition-colors duration-200 hover:bg-[#fafaf9]"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-[#8b8d91]">
                      {selectedQuote.fullName} · {selectedQuote.requestType} ·{" "}
                      {new Date(selectedQuote.createdAt).toLocaleString("es-CO")}
                    </p>

                    {(() => {
                        const details = selectedQuote.details ?? {};
                        const getDetail = (key: string) => details[key]?.trim() ?? "";
                        const hasFormDetails = Object.keys(details).length > 0;

                        const yesNoFields: Array<{ label: string; key: string; extraKey?: string; filesKey?: string }> = [
                          { label: "Adjunta plano del producto", key: "Adjunta plano del producto", filesKey: "Plano del producto · archivos" },
                          { label: "Adjunta muestra física", key: "Adjunta muestra física", filesKey: "Fotos de la muestra · archivos" },
                          { label: "Realiza dibujo del producto", key: "Realiza dibujo del producto", filesKey: "Dibujo del producto · archivos" },
                          {
                            label: "Cliente suministra material",
                            key: "Cliente suministra material",
                            extraKey: "Cliente suministra material · cuál",
                          },
                        ];
                        const conditionFields = [
                          { label: "Hidrocarburos", key: "Hidrocarburos" },
                          { label: "Impacto", key: "Impacto" },
                          { label: "Abrasión", key: "Abrasión" },
                          { label: "Uso externo", key: "Uso externo" },
                          { label: "Presión de trabajo", key: "Presión de trabajo", extraKey: "Presión de trabajo · cuál" },
                          {
                            label: "Temperatura de trabajo",
                            key: "Temperatura de trabajo",
                            extraKey: "Temperatura de trabajo · cuál",
                          },
                          { label: "Requisito legal", key: "Requisito legal", extraKey: "Requisito legal · cuál" },
                          { label: "Grado alimenticio", key: "Grado alimenticio" },
                        ];

                        const Card = ({ title, className, children }: { title: string; className?: string; children: ReactNode }) => (
                          <section className={`rounded-2xl border border-black/6 bg-white p-5 sm:p-6 ${className ?? ""}`}>
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9a9da2]">{title}</h4>
                            <dl className="mt-3 divide-y divide-black/6">{children}</dl>
                          </section>
                        );

                        const Row = ({ label, children }: { label: string; children: ReactNode }) => (
                          <div className="flex items-start justify-between gap-6 py-2.5 first:pt-0 last:pb-0">
                            <dt className="w-40 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9a9da2]">
                              {label}
                            </dt>
                            <dd className="flex-1 text-sm font-semibold leading-6 text-[#1f2328]">{children}</dd>
                          </div>
                        );

                        const Empty = () => <span className="font-normal text-[#c1c3c6]">—</span>;

                        const YesNoValue = ({ value, extra }: { value: string; extra?: string }) => {
                          if (!value) return <Empty />;
                          const isYes = value === "SI";
                          return (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${isYes ? "bg-[#1f9d55]" : "bg-[#d5d7da]"}`} />
                                <span className={isYes ? "text-[#1f9d55]" : "text-[#9a9da2]"}>{isYes ? "Sí" : "No"}</span>
                              </span>
                              {extra && <p className="text-xs font-normal text-[#6e7379]">{extra}</p>}
                            </div>
                          );
                        };

                        return (
                          <div className="mt-6 space-y-4">
                            <Card title="Datos de la solicitud">
                              <Row label="Producto">{getDetail("Producto") || <Empty />}</Row>
                              <Row label="Tipo de solicitud">
                                {(() => {
                                  const tipo = getDetail("Tipo de solicitud") || selectedQuote.requestType;
                                  return tipo ? (
                                    <span className="inline-flex rounded-full bg-[var(--admin-accent-soft)] px-3 py-1 text-xs font-bold uppercase tracking-[0.04em] text-[var(--admin-accent)]">
                                      {tipo}
                                    </span>
                                  ) : (
                                    <Empty />
                                  );
                                })()}
                              </Row>
                              {selectedQuote.process.length > 0 && (
                                <Row label="Proceso solicitado">
                                  <div className="flex flex-wrap gap-1.5">
                                    {selectedQuote.process.map((item) => (
                                      <span
                                        key={item}
                                        className="rounded-full bg-[var(--admin-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--admin-accent)]"
                                      >
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </Row>
                              )}
                              <Row label="Descripción">
                                <span className="font-normal">
                                  {getDetail("Descripción de la solicitud") || selectedQuote.productDetails || <Empty />}
                                </span>
                              </Row>
                            </Card>

                            {hasFormDetails ? (
                              <div className="grid gap-4 lg:grid-cols-2">
                                <Card title="Información del producto">
                                  <Row label="Color">{getDetail("Color del producto") || <Empty />}</Row>
                                  {yesNoFields.map(({ label, key, extraKey, filesKey }) => {
                                    const files = filesKey ? getDetail(filesKey).split("\n").filter(Boolean) : [];
                                    return (
                                      <Row key={key} label={label}>
                                        <YesNoValue value={getDetail(key)} extra={extraKey ? getDetail(extraKey) : ""} />
                                        {files.length > 0 && (
                                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                                            {files.map((url, index) => (
                                              <a
                                                key={url}
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-accent-soft)] px-2.5 py-1 text-xs font-bold text-[var(--admin-accent)] hover:underline"
                                              >
                                                📎 {/\.pdf$/i.test(url) ? "PDF" : "Imagen"} {index + 1}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </Row>
                                    );
                                  })}
                                  <Row label="Material sugerido">{getDetail("Material sugerido") || <Empty />}</Row>
                                  <Row label="Dureza">{getDetail("Dureza") || <Empty />}</Row>
                                </Card>

                                <Card title="Condiciones de trabajo">
                                  {conditionFields.map(({ label, key, extraKey }) => (
                                    <Row key={key} label={label}>
                                      <YesNoValue value={getDetail(key)} extra={extraKey ? getDetail(extraKey) : ""} />
                                    </Row>
                                  ))}
                                  <Row label="Otro">
                                    <span className="font-normal">{getDetail("Otro") || <Empty />}</span>
                                  </Row>
                                </Card>
                              </div>
                            ) : (
                              selectedQuote.conditions.length > 0 && (
                                <Card title="Condiciones de trabajo">
                                  <Row label="Condiciones">
                                    <div className="flex flex-wrap gap-1.5">
                                      {selectedQuote.conditions.map((item) => (
                                        <span
                                          key={item}
                                          className="rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-semibold text-[#c53b3b]"
                                        >
                                          {item}
                                        </span>
                                      ))}
                                    </div>
                                  </Row>
                                </Card>
                              )
                            )}

                            <Card title="Información comercial">
                              <Row label="NIT">{selectedQuote.nit || <Empty />}</Row>
                              <Row label="Teléfono">{selectedQuote.phone || <Empty />}</Row>
                              <Row label="Cantidad / entrega">
                                {getDetail("Cantidad") || selectedQuote.quantityAndDeadline || <Empty />}
                              </Row>
                            </Card>
                          </div>
                        );
                      })()}

                      <div className="mt-6 border-l-4 border-[var(--admin-accent)]/30 pl-5">
                        <label className="block space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
                            Respuesta para el cliente
                          </span>
                          <textarea
                            value={quoteNotesDraft}
                            onChange={(event) => setQuoteNotesDraft(event.target.value)}
                            rows={3}
                            placeholder="Ej. Ya revisamos tu solicitud, te contactamos por WhatsApp con la cotización el jueves..."
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                        </label>
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-[#8b8d91]">
                            El cliente ve este texto en la pestaña &quot;Cotizaciones&quot; de su cuenta.
                          </p>
                          <button
                            type="button"
                            onClick={() => void handleSaveQuoteNotes(selectedQuote.id)}
                            disabled={isSavingQuoteNotes}
                            className="inline-flex rounded-full bg-[#16384f] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {isSavingQuoteNotes ? "Guardando..." : "Guardar respuesta"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {activeTab === "categories" && (
            <div className="admin-fade-up space-y-6">
              <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">Categorías</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                  Categorías de {DIVISION_BRAND[adminDivision].label}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                  Renombra, crea, elimina o reordena las categorías que aparecen en el menú, el carrusel y los
                  filtros de productos. Al renombrar una categoría, los productos que la usan se actualizan
                  automáticamente.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void handleCreateCategory();
                    }}
                    placeholder="Nombre de la nueva categoría"
                    className="min-w-[240px] flex-1 rounded-full border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleCreateCategory()}
                    disabled={isCreatingCategory || !newCategoryName.trim()}
                    className="inline-flex shrink-0 rounded-full bg-[#16384f] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingCategory ? "Creando..." : "Agregar categoría"}
                  </button>
                </div>

                <div className="mt-6 space-y-2">
                  {getCategoryRecordsForDivision(adminDivision).length === 0 ? (
                    <p className="rounded-[1.25rem] border border-dashed border-black/12 p-5 text-sm leading-7 text-[#6e7379]">
                      Aún no hay categorías para esta unidad.
                    </p>
                  ) : (
                    getCategoryRecordsForDivision(adminDivision).map((category, index, list) => {
                      const isEditing = editingCategoryId === category.id;
                      const isSaving = savingCategoryId === category.id;

                      return (
                        <div
                          key={category.id}
                          className="flex flex-wrap items-center gap-3 rounded-[1.25rem] border border-black/8 bg-[#fafaf9] px-4 py-3"
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                            aria-hidden="true"
                          />
                          <span className="shrink-0 text-base" aria-hidden="true">
                            {category.icon}
                          </span>

                          {isEditing ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingCategoryName}
                              onChange={(event) => setEditingCategoryName(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") void handleRenameCategory(category.id);
                                if (event.key === "Escape") setEditingCategoryId(null);
                              }}
                              className="min-w-[200px] flex-1 rounded-full border border-[var(--admin-accent)] bg-white px-3 py-1.5 text-sm text-[#1f2328] outline-none"
                            />
                          ) : (
                            <span className="flex-1 text-sm font-semibold text-[#1f2328]">{category.name}</span>
                          )}

                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => void handleMoveCategory(category.id, "up")}
                              disabled={index === 0 || isSaving}
                              aria-label="Subir"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#5d6167] transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleMoveCategory(category.id, "down")}
                              disabled={index === list.length - 1 || isSaving}
                              aria-label="Bajar"
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 text-[#5d6167] transition-colors duration-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              ↓
                            </button>

                            {isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleRenameCategory(category.id)}
                                  disabled={isSaving}
                                  className="rounded-full bg-[var(--admin-accent)] px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isSaving ? "Guardando..." : "Guardar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(null)}
                                  className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold text-[#5d6167] hover:bg-white"
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryId(category.id);
                                    setEditingCategoryName(category.name);
                                  }}
                                  className="rounded-full border border-black/10 px-4 py-1.5 text-xs font-semibold text-[#5d6167] hover:bg-white"
                                >
                                  Renombrar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteCategory(category.id, category.name)}
                                  disabled={isSaving}
                                  className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && !isServiceAdmin && inventoryEdit && inventoryEditProduct && (
            <div
              className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0f172a]/45 px-4 backdrop-blur-[2px]"
              onClick={() => !isSavingInventoryEdit && setInventoryEdit(null)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && !isSavingInventoryEdit) setInventoryEdit(null);
              }}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="inventory-edit-title"
                onClick={(event) => event.stopPropagation()}
                className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.28)]"
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inventoryEditProduct.imagen}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-black/8 bg-[#fafaf9] object-contain"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">
                      Editar inventario
                    </p>
                    <h2 id="inventory-edit-title" className="mt-0.5 text-lg font-semibold leading-6 text-[#16384f]">
                      {inventoryEditProduct.nombre}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#8b8d91]">SKU: {inventoryEditProduct.sku || "Sin SKU"}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={() => setInventoryEdit(null)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#5d6167] hover:bg-[#f3f4f6]"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const hasVariants = (inventoryEditProduct.variantes?.length ?? 0) > 0;
                  const delta =
                    Math.max(0, Math.trunc(Number(inventoryEdit.stock) || 0)) - (inventoryEditProduct.stock ?? 0);
                  return (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f545a]">Stock actual</span>
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          autoFocus={!hasVariants}
                          disabled={hasVariants}
                          value={inventoryEdit.stock}
                          onChange={(event) =>
                            setInventoryEdit((current) => current && { ...current, stock: event.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-lg font-semibold text-[#16384f] outline-none focus:border-[var(--admin-accent)] disabled:opacity-60"
                        />
                        <span className="mt-1 block text-xs text-[#8b8d91]">
                          {hasVariants
                            ? "Se maneja por medidas: ajústalo en el editor completo."
                            : delta === 0
                              ? `Actual: ${inventoryEditProduct.stock ?? 0}`
                              : `Actual: ${inventoryEditProduct.stock ?? 0} · Cambio: ${delta > 0 ? "+" : ""}${delta}`}
                        </span>
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-[#4f545a]">Stock mínimo</span>
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={inventoryEdit.stockMinimo}
                          onChange={(event) =>
                            setInventoryEdit((current) => current && { ...current, stockMinimo: event.target.value })
                          }
                          className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-lg font-semibold text-[#16384f] outline-none focus:border-[var(--admin-accent)]"
                        />
                        <span className="mt-1 block text-xs text-[#8b8d91]">Por debajo se marca “Stock bajo”.</span>
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-sm font-medium text-[#4f545a]">Motivo del cambio (opcional)</span>
                        <input
                          type="text"
                          value={inventoryEdit.note}
                          onChange={(event) =>
                            setInventoryEdit((current) => current && { ...current, note: event.target.value })
                          }
                          placeholder="Ej: conteo físico, llegada de mercancía…"
                          className="mt-1.5 w-full rounded-xl border border-black/10 bg-[#fafaf9] px-4 py-2.5 text-sm text-[#1f2328] outline-none focus:border-[var(--admin-accent)]"
                        />
                      </label>
                    </div>
                  );
                })()}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const slug = inventoryEdit.slug;
                      setInventoryEdit(null);
                      handleEditProduct(slug);
                    }}
                    className="text-sm font-semibold text-[#5d6167] underline-offset-4 hover:text-[#16384f] hover:underline"
                  >
                    Abrir editor completo
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInventoryEdit(null)}
                      className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-semibold text-[#16384f] hover:bg-[#f3f4f6]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isSavingInventoryEdit}
                      onClick={() => void handleSaveInventoryEdit()}
                      className="rounded-xl bg-[#16384f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2a3b] disabled:opacity-60"
                    >
                      {isSavingInventoryEdit ? "Guardando…" : "Guardar"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && !isServiceAdmin && (
            <div className="admin-fade-up space-y-8">
              {/* minmax(0,1fr): sin esto los nombres largos de categoría ensanchan la columna y en móvil se corta todo. */}
              <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="min-w-0 space-y-4">
                  <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8b8d91]">
                          Inventario
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#16384f]">
                          Control rápido
                        </h2>
                      </div>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6] text-[#16384f]">
                        <InventoryBoxIcon className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#6e7379]">
                      Ajusta existencias sin abrir el editor completo y revisa los últimos movimientos del stock.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-black/8 bg-white p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <h3 className="px-2 pt-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#16384f]">
                      Categorías
                    </h3>
                    <div className="mt-3 space-y-1">
                      {(["Todas", ...categoryOptions] as const).map((categoria) => {
                        const isActive = editCategoryFilter === categoria;
                        const count =
                          categoria === "Todas" ? adminProducts.length : inventoryCategoryCounts[categoria] ?? 0;
                        return (
                          <button
                            key={categoria}
                            type="button"
                            onClick={() => {
                              setEditCategoryFilter(categoria);
                              setInventoryPage(1);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors duration-200 ${
                              isActive
                                ? "bg-[#16384f] text-white shadow-[0_10px_20px_rgba(22,56,79,0.18)]"
                                : "text-[#5d6167] hover:bg-[#f3f4f6]"
                            }`}
                          >
                            <InventoryBoxIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-[#8b8d91]"}`} />
                            <span className="min-w-0 flex-1 truncate">{categoria}</span>
                            <span className={`text-xs tabular-nums ${isActive ? "text-white/80" : "text-[#8b8d91]"}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 space-y-4">
                  <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Buscar por nombre, marca o SKU
                      </span>
                      <span className="relative block">
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b8d91]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                          type="search"
                          value={editSearch}
                          onChange={(event) => {
                            setEditSearch(event.target.value);
                            setInventoryPage(1);
                          }}
                          placeholder="Ej: sello, Universal de Cauchos, CAUCHO001..."
                          className="w-full rounded-xl border border-black/10 bg-[#fafaf9] py-3 pl-11 pr-4 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                        />
                      </span>
                    </label>

                    <p className="mt-3 text-sm text-[#6e7379]">
                      Mostrando {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} para control de stock.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(
                        [
                          ["all", "Todos", "bg-[#16384f] text-white", "border border-black/10 bg-white text-[#5d6167] hover:bg-[#f3f4f6]"],
                          ["low-stock", "Solo stock bajo", "bg-[#e0a100] text-white", "border border-[#e0a100]/30 bg-[#fff6e5] text-[#9a6200] hover:bg-[#ffedc7]"],
                          ["out-of-stock", "Solo agotados", "bg-[#c53b3b] text-white", "border border-[#c53b3b]/25 bg-[#fff1f1] text-[#c53b3b] hover:bg-[#ffe2e2]"],
                        ] as const
                      ).map(([value, label, activeClass, idleClass]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setInventoryStatusFilter(value);
                            setInventoryPage(1);
                          }}
                          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 ${
                            inventoryStatusFilter === value ? activeClass : idleClass
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {inventoryPageProducts.length === 0 && (
                      <p className="rounded-[1.25rem] border border-dashed border-black/12 bg-white p-8 text-center text-sm text-[#6e7379]">
                        No hay productos con estos filtros.
                      </p>
                    )}
                    {inventoryPageProducts.map((product) => {
                      const inventoryTone = getInventoryTone(product.estadoInventario);
                      const adjustmentValue = inventoryAdjustments[product.slug] || "";
                      const adjustment = Number(adjustmentValue) || 0;
                      const isLow = product.estadoInventario === "low-stock" || product.estadoInventario === "out-of-stock";
                      const setAdjustment = (value: string) =>
                        setInventoryAdjustments((current) => ({ ...current, [product.slug]: value }));

                      return (
                        <article
                          key={`inventory-${product.slug}`}
                          className="grid gap-4 rounded-[1.25rem] border border-black/8 bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-center"
                        >
                          <div className="flex min-w-0 items-center gap-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.imagen}
                              alt=""
                              className="h-16 w-16 shrink-0 rounded-xl border border-black/8 bg-[#fafaf9] object-contain"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">
                                {product.categoria} · {product.marca}
                              </p>
                              <h3 className="mt-0.5 truncate text-base font-semibold text-[#1f2328]">
                                {product.nombre}
                              </h3>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f3f4f6] px-2.5 py-1 text-[#5d6167]">
                                  SKU: {product.sku || "Sin SKU"}
                                  {product.sku && (
                                    <button
                                      type="button"
                                      aria-label={`Copiar SKU ${product.sku}`}
                                      onClick={() => {
                                        void navigator.clipboard?.writeText(product.sku ?? "");
                                        setToast({ tone: "success", message: `SKU ${product.sku} copiado.` });
                                      }}
                                      className="text-[#8b8d91] transition-colors hover:text-[#16384f]"
                                    >
                                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="11" height="11" rx="2" />
                                        <path d="M5 15V6a2 2 0 0 1 2-2h8" />
                                      </svg>
                                    </button>
                                  )}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${inventoryTone.className}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${inventoryTone.dot}`} />
                                  {inventoryTone.label}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-black/6 pt-3 2xl:flex-nowrap 2xl:border-t-0 2xl:pt-0">
                            <div className="w-28 2xl:border-l 2xl:border-black/8 2xl:pl-5">
                              <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                                Stock actual
                              </p>
                              <p className={`mt-1 text-2xl font-semibold tabular-nums ${isLow ? "text-[#c53b3b]" : "text-[#16384f]"}`}>
                                {product.stock ?? 0}
                              </p>
                            </div>
                            <div className="w-28 2xl:border-l 2xl:border-black/8 2xl:pl-5">
                              <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                                Stock mínimo
                              </p>
                              <p className="mt-1 text-2xl font-semibold tabular-nums text-[#16384f]">
                                {product.stockMinimo ?? 0}
                              </p>
                            </div>
                            <div className="2xl:border-l 2xl:border-black/8 2xl:pl-5">
                              <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                                Ajuste
                              </p>
                              <div className="mt-1 flex items-center gap-1.5">
                                <button
                                  type="button"
                                  aria-label="Restar una unidad al ajuste"
                                  onClick={() => setAdjustment(String(adjustment - 1))}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f6] text-lg font-semibold text-[#16384f] transition-colors hover:bg-[#e5e7eb]"
                                >
                                  −
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  aria-label={`Ajuste de stock para ${product.nombre}`}
                                  value={adjustmentValue}
                                  onChange={(event) => setAdjustment(event.target.value)}
                                  placeholder="0"
                                  className="h-9 w-14 rounded-lg border border-black/10 bg-white text-center text-sm font-semibold text-[#1f2328] outline-none [appearance:textfield] focus:border-[var(--admin-accent)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  aria-label="Sumar una unidad al ajuste"
                                  onClick={() => setAdjustment(String(adjustment + 1))}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f4f6] text-lg font-semibold text-[#16384f] transition-colors hover:bg-[#e5e7eb]"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 2xl:ml-2">
                              <button
                                type="button"
                                disabled={adjustment === 0}
                                onClick={() => handleQuickInventoryAdjust(product.slug, adjustment)}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#16384f] px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m5 12 5 5L20 7" />
                                </svg>
                                Aplicar
                              </button>
                              <button
                                type="button"
                                aria-label={`Editar ${product.nombre}`}
                                title="Editar inventario"
                                onClick={() => openInventoryEdit(product.slug)}
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                              >
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {filteredProducts.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                      <p className="text-sm text-[#6e7379]">
                        Mostrando {(currentInventoryPage - 1) * INVENTORY_PAGE_SIZE + 1}–
                        {Math.min(currentInventoryPage * INVENTORY_PAGE_SIZE, filteredProducts.length)} de{" "}
                        {filteredProducts.length} productos
                      </p>
                      {inventoryTotalPages > 1 && (
                        <nav aria-label="Páginas de inventario" className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label="Página anterior"
                            disabled={currentInventoryPage === 1}
                            onClick={() => setInventoryPage(currentInventoryPage - 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-[#16384f] disabled:opacity-40"
                          >
                            ‹
                          </button>
                          {getPageList(currentInventoryPage, inventoryTotalPages).map((page, index) =>
                            page === "gap" ? (
                              <span key={`gap-${index}`} className="px-1 text-sm text-[#8b8d91]">…</span>
                            ) : (
                              <button
                                key={page}
                                type="button"
                                aria-current={page === currentInventoryPage ? "page" : undefined}
                                onClick={() => setInventoryPage(page)}
                                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold ${
                                  page === currentInventoryPage
                                    ? "bg-[#16384f] text-white"
                                    : "text-[#16384f] hover:bg-[#f3f4f6]"
                                }`}
                              >
                                {page}
                              </button>
                            ),
                          )}
                          <button
                            type="button"
                            aria-label="Página siguiente"
                            disabled={currentInventoryPage === inventoryTotalPages}
                            onClick={() => setInventoryPage(currentInventoryPage + 1)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-[#16384f] disabled:opacity-40"
                          >
                            ›
                          </button>
                        </nav>
                      )}
                    </div>
                  )}

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
                          Movimientos
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                          Últimos cambios de inventario
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => void loadInventoryMovements()}
                        className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                      >
                        Recargar
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      {isLoadingInventory ? (
                        <p className="text-sm text-[#6e7379]">Cargando movimientos...</p>
                      ) : inventoryMovements.length === 0 ? (
                        <p className="text-sm text-[#6e7379]">
                          Aún no hay movimientos recientes para mostrar.
                        </p>
                      ) : (
                        inventoryMovements.map((movement) => (
                          <div
                            key={movement.id}
                            className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[#1f2328]">
                                  {movement.productName}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                  {movement.productSku || "Sin SKU"} · {INVENTORY_MOVEMENT_LABELS[movement.type] ?? movement.type}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-semibold ${movement.quantity >= 0 ? "text-[#1f6b39]" : "text-[var(--admin-accent)]"}`}>
                                  {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                                </p>
                                <p className="mt-1 text-xs text-[#6e7379]">
                                  Stock final: {movement.stockAfter}
                                </p>
                              </div>
                            </div>
                            {movement.note && (
                              <p className="mt-3 text-sm text-[#5d6167]">{movement.note}</p>
                            )}
                            <p className="mt-2 text-xs text-[#8b8d91]">
                              {new Date(movement.createdAt).toLocaleString("es-CO")}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && settingsSection === "images" && canAccessTool("images") && (
            <div className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Contenido del sitio
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Editar imágenes
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7379]">
                    Sube o reemplaza las imágenes o videos del sitio público. JPG · PNG · WEBP · MP4 · WEBM · MOV · máx. 4 MB.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void loadContentVersions();
                      setIsHistoryModalOpen(true);
                    }}
                    className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Historial
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadSiteImages()}
                    className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Recargar
                  </button>
                </div>
              </div>

              {imageError && (
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {imageError}
                </p>
              )}

              {publishNotice && (
                <p className="mb-6 rounded-xl bg-[#effaf2] px-4 py-3 text-sm font-semibold text-[#1f6b39]">
                  {publishNotice}
                </p>
              )}

              {myContentDrafts.length > 0 && (
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[#f3d9b1] bg-[#fff8ef] px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#92400e]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#b45309]" />
                    {myContentDrafts.length} cambio{myContentDrafts.length === 1 ? "" : "s"} sin publicar
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(true)}
                    className="inline-flex rounded-full bg-[#16384f] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0e2536]"
                  >
                    Publicar cambios
                  </button>
                </div>
              )}

              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
                  Editando · <span className="text-[#16384f]">{adminBrand.label}</span>
                </p>
                <div className="inline-flex rounded-full border border-black/10 bg-[#f5f5f4] p-1">
                  {(
                    [
                      { mode: "web" as const, label: "Web" },
                      { mode: "movil" as const, label: "📱 Móvil" },
                    ]
                  ).map((tab) => (
                    <button
                      key={tab.mode}
                      type="button"
                      onClick={() => {
                        setImageViewMode(tab.mode);
                        setSelectedImageGroup(null);
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                        imageViewMode === tab.mode
                          ? "bg-[#16384f] text-white shadow-sm"
                          : "text-[#6e7379] hover:text-[#16384f]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {imageViewMode === "movil" && (
                <p className="-mt-4 mb-8 max-w-2xl text-sm leading-6 text-[#6e7379]">
                  Estas son las imágenes que se ven en celulares para los banners anchos. Si dejas alguna sin subir, se usa automáticamente su versión de escritorio.
                </p>
              )}

              {(() => {
                const isMobileTab = imageViewMode === "movil";
                return isLoadingImages ? (
                <p className="text-sm text-[#6e7379]">Cargando imágenes...</p>
              ) : !selectedImageGroup ? (
                (() => {
                  const divisionSlots = IMAGE_SLOTS.filter(
                    (slot) => slot.division === imageDivisionFilter && Boolean(slot.isMobile) === isMobileTab,
                  );
                  const divisionGroups = Array.from(new Set(divisionSlots.map((slot) => slot.group)));
                  const sections = [
                    ...IMAGE_GROUP_SECTIONS.map((section) => ({
                      label: section.label,
                      groups: section.groups.filter((group) => divisionGroups.includes(group)),
                    })),
                    {
                      label: "Otros",
                      groups: divisionGroups.filter(
                        (group) => !IMAGE_GROUP_SECTIONS.some((section) => section.groups.includes(group)),
                      ),
                    },
                  ].filter((section) => section.groups.length > 0);

                  if (isMobileTab && sections.length === 0) {
                    return (
                      <p className="rounded-[1.2rem] border border-dashed border-black/12 bg-[#fafaf9] px-6 py-10 text-center text-sm text-[#6e7379]">
                        Esta división todavía no tiene banners con versión móvil.
                      </p>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      {sections.map((section) => (
                        <section key={section.label} className="rounded-2xl border border-black/8 bg-white">
                          <header className="flex items-center justify-between gap-3 border-b border-black/6 px-5 py-3.5">
                            <h3 className="text-sm font-semibold text-[#16384f]">{section.label}</h3>
                            <span className="text-xs text-[#8b8d91]">
                              {section.groups.length} {section.groups.length === 1 ? "grupo" : "grupos"}
                            </span>
                          </header>
                          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                            {section.groups.map((group) => {
                              const groupSlots = divisionSlots.filter((slot) => slot.group === group);
                              const previews = groupSlots.map((slot) => {
                                const src = resolveAdminImageSrc(slot.key, slot.defaultSrc);
                                return { key: slot.key, src, isVideo: Boolean(src) && isVideoUrl(src ?? "") };
                              });
                              const cover = previews.find((preview) => preview.src && !preview.isVideo);
                              const videoCount = previews.filter((preview) => preview.isVideo).length;

                              return (
                                <button
                                  key={group}
                                  type="button"
                                  onClick={() => setSelectedImageGroup(group)}
                                  className="group flex items-center gap-4 rounded-xl border border-black/8 bg-white p-2.5 pr-4 text-left transition-colors duration-200 hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)]"
                                >
                                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#f0f2f4] to-[#e5e8eb]">
                                    {cover ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={cover.src} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="flex h-full w-full items-center justify-center text-[#c3c8cd]">
                                        <span className="h-6 w-6">{IMAGE_GROUP_ICON}</span>
                                      </span>
                                    )}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-[#1f2328]">{group}</span>
                                    <span className="mt-0.5 block text-xs text-[#8b8d91]">
                                      {groupSlots.length} {groupSlots.length === 1 ? "imagen" : "imágenes"}
                                      {videoCount > 0 && ` · ${videoCount} ${videoCount === 1 ? "video" : "videos"}`}
                                    </span>
                                    {previews.length > 1 && (
                                      <span className="mt-2 flex items-center gap-1">
                                        {previews.slice(0, 3).map((preview) => (
                                          <span
                                            key={preview.key}
                                            className="h-4 w-6 overflow-hidden rounded-[3px] bg-[#e5e8eb] ring-1 ring-black/5"
                                          >
                                            {preview.src && !preview.isVideo && (
                                              // eslint-disable-next-line @next/next/no-img-element
                                              <img src={preview.src} alt="" className="h-full w-full object-cover" />
                                            )}
                                          </span>
                                        ))}
                                        {previews.length > 3 && (
                                          <span className="text-[10px] font-semibold text-[#8b8d91]">+{previews.length - 3}</span>
                                        )}
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    aria-hidden="true"
                                    className="shrink-0 text-lg text-[#b4b7bb] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--admin-accent)]"
                                  >
                                    ›
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      ))}
                    </div>
                  );
                })()
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedImageGroup(null)}
                    className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-accent)] hover:underline"
                  >
                    <span aria-hidden="true">‹</span> Volver a categorías
                  </button>
                  <div className="mb-8 last:mb-0">
                    <h3 className="mb-4 text-base font-semibold text-[#16384f]">{selectedImageGroup}</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                      {IMAGE_SLOTS.filter(
                        (slot) =>
                          slot.group === selectedImageGroup &&
                          slot.division === imageDivisionFilter &&
                          Boolean(slot.isMobile) === isMobileTab,
                      ).map((slot) => {
                        const currentSrc = resolveAdminImageSrc(slot.key, slot.defaultSrc);
                        const hasDraft = Boolean(contentDrafts[slot.key]);
                        const isUploading = uploadingImageKey === slot.key;
                        const isSaved = savedImageKey === slot.key;
                        const slotLabel = isMobileTab
                          ? slot.label.replace(/\s*\(versión móvil\)\s*$/i, "")
                          : slot.label;
                        return (
                          <div
                            key={slot.key}
                            className="overflow-hidden rounded-xl border border-black/8 bg-white"
                          >
                            <div
                              className="relative overflow-hidden border-b border-black/6 bg-[#f4f5f6]"
                              style={{ paddingBottom: "56.25%" }}
                            >
                              {isVideoUrl(currentSrc) ? (
                                <video
                                  src={currentSrc}
                                  muted
                                  loop
                                  autoPlay
                                  playsInline
                                  className="absolute inset-0 h-full w-full object-contain"
                                />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={currentSrc}
                                  alt={slotLabel}
                                  className="absolute inset-0 h-full w-full object-contain"
                                />
                              )}
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-white border-t-transparent" />
                                </div>
                              )}
                              {isSaved && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="rounded-full bg-white/90 p-2">
                                    <svg
                                      viewBox="0 0 24 24"
                                      className="h-5 w-5 text-green-600"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                    >
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                              {hasDraft && (
                                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-[#b45309] px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                                  ● Sin publicar
                                </span>
                              )}
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-xs font-semibold text-[#1f2328]">
                                  {slotLabel}
                                </p>
                                {hasDraft && (
                                  <button
                                    type="button"
                                    onClick={() => void handleDiscardDraft(slot.key)}
                                    className="shrink-0 text-[10px] font-semibold text-[#8b8d91] hover:text-[var(--admin-accent)]"
                                  >
                                    ↺ Deshacer
                                  </button>
                                )}
                              </div>
                              <p className="mt-1 text-[10px] font-semibold text-[#8b8d91]">
                                {slot.dims}
                              </p>
                              <label
                                className={`mt-2 flex cursor-pointer items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold transition-colors ${
                                  isSaved
                                    ? "bg-[#effaf2] text-[#1f6b39]"
                                    : "bg-[var(--admin-accent)] text-white hover:bg-[#054eb3]"
                                } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                              >
                                {isSaved ? "✓ Guardado" : isUploading ? "Subiendo..." : "Cambiar imagen o video"}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                                  className="sr-only"
                                  disabled={isUploading}
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) void handleSiteImageUpload(slot.key, file);
                                    event.target.value = "";
                                  }}
                                />
                              </label>
                              {(() => {
                                const historyEntries = (imageHistory[slot.key] ?? []).filter(
                                  (entry) => entry.url !== currentSrc,
                                );
                                if (historyEntries.length === 0) return null;
                                return (
                                <div className="mt-2">
                                  <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#8b8d91]">
                                    Historial
                                  </p>
                                  <div className="flex gap-1.5">
                                    {historyEntries.map((entry) => (
                                      <button
                                        key={entry.url + entry.createdAt}
                                        type="button"
                                        title="Usar esta imagen"
                                        disabled={isUploading || restoringHistoryKey === slot.key}
                                        onClick={() => void handleRestoreFromHistory(slot.key, entry.url)}
                                        className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-black/10 bg-[#f0f2f4] transition-colors duration-150 hover:border-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isVideoUrl(entry.url) ? (
                                          <span className="flex h-full w-full items-center justify-center text-[8px] font-semibold text-[#8b8d91]">
                                            Video
                                          </span>
                                        ) : (
                                          // eslint-disable-next-line @next/next/no-img-element
                                          <img src={entry.url} alt="" className="h-full w-full object-cover" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                );
                              })()}
                              {(selectedImageGroup === "Ofertas" || selectedImageGroup === "Marcas destacadas") && (
                                <div className="mt-2">
                                  <label className="mb-1 block text-[10px] font-semibold text-[#8b8d91]">
                                    Enlace al hacer clic (opcional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="/producto/nombre-del-producto"
                                    value={siteImageLinks[slot.key] ?? resolveAdminImageLink(slot.key)}
                                    onChange={(event) =>
                                      setSiteImageLinks((current) => ({
                                        ...current,
                                        [slot.key]: event.target.value,
                                      }))
                                    }
                                    onBlur={(event) =>
                                      void handleSiteImageLinkSave(slot.key, event.target.value)
                                    }
                                    className="w-full rounded-lg border border-black/10 bg-[#fafaf9] px-2.5 py-1.5 text-xs text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                                  />
                                  {savingLinkKey === slot.key && (
                                    <p className="mt-1 text-[10px] font-semibold text-[#8b8d91]">Guardando...</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          )}

          {activeTab === "settings" && settingsSection === "texts" && canAccessTool("settings") && (
            <div className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Contenido del sitio
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Textos del sitio
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7379]">
                    Títulos, párrafos y botones de la página.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void loadContentVersions();
                      setIsHistoryModalOpen(true);
                    }}
                    className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Historial
                  </button>
                </div>
              </div>

              <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--admin-accent)]/20 bg-[var(--admin-accent-soft)] px-5 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#16384f]">Edita directamente sobre la página</p>
                  <p className="mt-0.5 text-sm text-[#6e7379]">
                    Navega por el sitio, haz clic en cualquier texto resaltado y cámbialo ahí mismo. Arriba verás un aviso para guardar y publicar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void startLiveTextEdit()}
                  disabled={isStartingLiveTextEdit}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-8px_rgba(var(--admin-accent-rgb),0.7)] transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: adminBrand.accent }}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
                  </svg>
                  {isStartingLiveTextEdit ? "Abriendo…" : "Editar textos en tiempo real"}
                </button>
              </div>

              <div>
                {publishNotice && (
                  <p className="mb-6 rounded-xl bg-[#effaf2] px-4 py-3 text-sm font-semibold text-[#1f6b39]">
                    {publishNotice}
                  </p>
                )}

                {myContentDrafts.length > 0 && (
                  <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[#f3d9b1] bg-[#fff8ef] px-5 py-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#92400e]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#b45309]" />
                      {myContentDrafts.length} cambio{myContentDrafts.length === 1 ? "" : "s"} sin publicar
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPublishModalOpen(true)}
                      className="inline-flex rounded-full bg-[#16384f] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0e2536]"
                    >
                      Publicar cambios
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {activeTab === "settings" && settingsSection === "colors" && canAccessTool("settings") && (
            <div className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    Contenido del sitio
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Colores
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7379]">
                    Color principal de la marca en botones, enlaces y acentos del sitio. Los cambios se
                    guardan al salir del campo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void loadContentVersions();
                      setIsHistoryModalOpen(true);
                    }}
                    className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Historial
                  </button>
                  <button
                    type="button"
                    onClick={() => void loadSiteColors()}
                    className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Recargar
                  </button>
                </div>
              </div>

              {colorsError && (
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{colorsError}</p>
              )}

              {publishNotice && (
                <p className="mb-6 rounded-xl bg-[#effaf2] px-4 py-3 text-sm font-semibold text-[#1f6b39]">
                  {publishNotice}
                </p>
              )}

              {myContentDrafts.length > 0 && (
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-[#f3d9b1] bg-[#fff8ef] px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-[#92400e]">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#b45309]" />
                    {myContentDrafts.length} cambio{myContentDrafts.length === 1 ? "" : "s"} sin publicar
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(true)}
                    className="inline-flex rounded-full bg-[#16384f] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0e2536]"
                  >
                    Publicar cambios
                  </button>
                </div>
              )}

              {isLoadingColors ? (
                <p className="text-sm text-[#6e7379]">Cargando colores...</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {COLOR_SLOTS.filter((slot) => slot.division === adminDivision).map((slot) => {
                    const value = resolveAdminColor(slot.key, slot.defaultValue);
                    const isSaving = savingColorKey === slot.key;
                    const isSaved = savedColorKey === slot.key;
                    const hasDraft = Boolean(contentDrafts[slot.key]);

                    return (
                      <div
                        key={slot.key}
                        className="rounded-[1.2rem] border border-black/8 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#8b8d91]">
                          <span className="flex items-center gap-2">
                            {slot.label}
                            {hasDraft && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309] px-2 py-0.5 text-[9px] font-bold normal-case text-white">
                                ● Sin publicar
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-2">
                            {isSaving && <span className="normal-case text-[#8b8d91]">Guardando...</span>}
                            {isSaved && <span className="normal-case text-[#1f6b39]">✓ Guardado</span>}
                            {hasDraft && !isSaving && (
                              <button
                                type="button"
                                onClick={() => void handleDiscardDraft(slot.key)}
                                className="normal-case text-[#8b8d91] hover:text-[var(--admin-accent)]"
                              >
                                ↺ Deshacer
                              </button>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={value}
                            onChange={(event) => void handleSaveColor(slot.key, event.target.value)}
                            className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                            aria-label={`Selector de color para ${slot.label}`}
                          />
                          <input
                            key={`${slot.key}:${value}`}
                            type="text"
                            defaultValue={value}
                            onBlur={(event) => {
                              if (/^#[0-9a-fA-F]{6}$/.test(event.target.value) && event.target.value !== value) {
                                void handleSaveColor(slot.key, event.target.value);
                              }
                            }}
                            className="w-full rounded-lg border border-black/10 bg-[#fafaf9] px-3 py-2 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
                          {value !== slot.defaultValue && (
                            <button
                              type="button"
                              onClick={() => void handleSaveColor(slot.key, slot.defaultValue)}
                              className="shrink-0 whitespace-nowrap text-xs font-semibold text-[#8b8d91] hover:text-[var(--admin-accent)]"
                            >
                              Usar original
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && settingsSection === "whatsapp" && canAccessTool("settings") && (
            <div className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                  Contenido del sitio
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                  Número de WhatsApp
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7379]">
                  Número de WhatsApp del botón flotante y los enlaces de compra de{" "}
                  {ADMIN_BRAND_CONFIG[adminDivision].label}. Si lo dejas vacío, se usa el número
                  general de GEU en su lugar; si tampoco hay uno general, el botón no se muestra.
                </p>
              </div>

              {settingsError && (
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {settingsError}
                </p>
              )}

              <div className="max-w-md">
                <input
                  type="text"
                  disabled={isLoadingSettings}
                  placeholder="Ej. 573001234567 (código de país + número, sin espacios ni +)"
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-[#fafaf9] px-3.5 py-2.5 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                />
                <p className="mt-1.5 text-xs text-[#8b8d91]">
                  Formato internacional sin &quot;+&quot; (código de país + número). Ej. Colombia: 57 + número.
                  Vacío = usar el número general.
                </p>
                <button
                  type="button"
                  disabled={isSavingSettings || isLoadingSettings}
                  onClick={() => void handleSaveWhatsAppNumber()}
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    settingsSaved
                      ? "bg-[#effaf2] text-[#1f6b39]"
                      : "bg-[var(--admin-accent)] text-white hover:bg-[#054eb3]"
                  } ${isSavingSettings || isLoadingSettings ? "pointer-events-none opacity-60" : ""}`}
                >
                  {settingsSaved ? "✓ Guardado" : isSavingSettings ? "Guardando..." : "Guardar número"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "settings" &&
            settingsSection === "salesMode" &&
            canAccessTool("settings") &&
            !isServiceDivision(adminDivision) && (
              <div className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
                <div className="mb-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                    {adminBrand.label}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                    Modo de venta
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7379]">
                    En modo Precios, el sitio funciona como una tienda normal: los clientes agregan
                    productos al carrito y pagan en línea. En modo WhatsApp, el precio se sigue
                    mostrando pero el botón de compra y el carrito se reemplazan por un contacto
                    directo por WhatsApp — útil si prefieres cerrar las ventas por chat.
                  </p>
                </div>

                {settingsError && (
                  <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {settingsError}
                  </p>
                )}

                <div className="flex max-w-md flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    disabled={isSavingSalesMode || isLoadingSettings}
                    onClick={() => void handleChangeCauchosSalesMode("precios")}
                    className={`flex-1 rounded-2xl border-2 px-5 py-4 text-left transition-colors duration-200 ${
                      cauchosSalesMode === "precios"
                        ? "border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]"
                        : "border-black/10 hover:border-black/20"
                    } ${isSavingSalesMode || isLoadingSettings ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <span className="block text-sm font-black uppercase tracking-[0.06em] text-[#16384f]">
                      Precios
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#6e7379]">
                      Carrito y checkout normales.
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={isSavingSalesMode || isLoadingSettings}
                    onClick={() => void handleChangeCauchosSalesMode("whatsapp")}
                    className={`flex-1 rounded-2xl border-2 px-5 py-4 text-left transition-colors duration-200 ${
                      cauchosSalesMode === "whatsapp"
                        ? "border-[#25D366] bg-[#f0fdf4]"
                        : "border-black/10 hover:border-black/20"
                    } ${isSavingSalesMode || isLoadingSettings ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <span className="block text-sm font-black uppercase tracking-[0.06em] text-[#16384f]">
                      WhatsApp
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#6e7379]">
                      Contacto por WhatsApp, sin carrito ni checkout.
                    </span>
                  </button>
                </div>

                {settingsSaved && (
                  <p className="mt-4 text-sm font-semibold text-[#1f6b39]">✓ Modo de venta guardado</p>
                )}
              </div>
            )}
        </div>
      </section>
        </div>
      </div>

      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-[1.4rem] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-[#16384f]">
              Estás a punto de publicar {myContentDrafts.length} cambio{myContentDrafts.length === 1 ? "" : "s"}
            </h3>
            <p className="mt-1 text-sm text-[#6e7379]">
              Estos cambios se verán de inmediato en el sitio público.
            </p>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-black/8 bg-[#fafaf9] p-3">
              {myContentDrafts.map(([key, draft]) => {
                const label =
                  draft.kind === "image"
                    ? IMAGE_SLOTS.find((s) => s.key === key)?.label ?? key
                    : draft.kind === "color"
                      ? COLOR_SLOTS.find((s) => s.key === key)?.label ?? key
                      : TEXT_SLOTS.find((s) => s.key === key)?.label ?? key;
                const kindLabel =
                  draft.kind === "image" ? "Imagen" : draft.kind === "color" ? "Color" : "Texto";
                return (
                  <p key={key} className="text-sm text-[#1f2328]">
                    <span className="font-semibold">{kindLabel}</span> · {label}
                  </p>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                disabled={isPublishing}
                className="rounded-full border border-black/10 px-5 py-2 text-sm font-semibold text-[#4f545a] transition-colors duration-200 hover:bg-[#f5f5f4] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handlePublishDrafts()}
                disabled={isPublishing}
                className="rounded-full bg-[#16384f] px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0e2536] disabled:opacity-50"
              >
                {isPublishing ? "Publicando..." : "Publicar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-[1.4rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#16384f]">Historial de publicaciones</h3>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-xl text-[#8b8d91] hover:text-[#16384f]"
                aria-label="Cerrar historial"
              >
                ×
              </button>
            </div>
            <div className="mt-4 max-h-96 space-y-3 overflow-y-auto">
              {isLoadingVersions ? (
                <p className="text-sm text-[#6e7379]">Cargando historial...</p>
              ) : contentVersions.length === 0 ? (
                <p className="text-sm text-[#6e7379]">Todavía no hay publicaciones registradas.</p>
              ) : (
                contentVersions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-[#fafaf9] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1f2328]">
                        {version.label ?? "Publicación"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#8b8d91]">
                        {new Date(version.createdAt).toLocaleString("es-CO")}
                        {version.createdBy ? ` · ${version.createdBy}` : ""} · {version.changedCount}{" "}
                        {version.changedCount === 1 ? "elemento" : "elementos"}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={restoringVersionId === version.id}
                      onClick={() => {
                        if (window.confirm("¿Restaurar el sitio al estado de esta versión?")) {
                          void handleRestoreVersion(version.id);
                        }
                      }}
                      className="shrink-0 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white disabled:opacity-50"
                    >
                      {restoringVersionId === version.id ? "Restaurando..." : "Restaurar"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
