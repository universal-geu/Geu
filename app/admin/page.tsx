"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "../components/products-provider";
import CategoryComboBox from "./category-combobox";
import {
  cauchosCategorySubcategories,
  getCategoriasForDivision,
  type Categoria,
  type ProductoCatalogo,
  type ProductoEspecificacion,
} from "../data/catalog";
import type { InventoryMovementSummary, StoreProduct } from "@/lib/products";
import type { DashboardMetrics, SalesReport, ShippingStatus } from "@/lib/orders";
import { formatOrderCode } from "@/lib/format-order";
import { IMAGE_SLOTS, isVideoUrl } from "@/lib/image-slots";
import { TEXT_SLOTS } from "@/lib/text-slots";
import { getDivisionFromBrandParam, isServiceDivision, type DivisionName } from "@/lib/divisions";
import {
  ADMIN_TOOL_KEYS,
  ADMIN_TOOL_LABELS,
  hasAdminPermission,
  type AdminToolKey,
} from "@/lib/admin-permissions";

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
    label: "GEU Innovation",
    eyebrow: "GEU INNOVATION",
    title: "Panel maestro GEU Innovation",
    description:
      "Desde aquí puedes crear y editar las fichas de servicio de GEU Innovation para que aparezcan en el sitio.",
    logo: "/logo-geu-innovation.png",
    logoAlt: "GEU Innovation",
    siteHref: "/innovation",
    productsHref: "/innovation#productos",
    contactHref: "/innovation#contacto",
    accent: "#0498b4",
    accentHover: "#037c92",
    sessionLabel: "Administrador GEU Innovation",
  },
  Energy: {
    label: "GEU Energy",
    eyebrow: "GEU ENERGY",
    title: "Panel maestro GEU Energy",
    description:
      "Desde aquí puedes crear y editar las fichas de servicio de GEU Energy para que aparezcan en el sitio.",
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

type FormState = {
  sku: string;
  oemReferencia: string;
  referenciasAlternas: string;
  categoria: string;
  subcategoria: string;
  categoriaMenor: string;
  categoriasAdicionales: AdditionalCategoryFormItem[];
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
  subcategoria: "",
  categoriaMenor: "",
  categoriasAdicionales: [],
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
const paymentStatuses: Array<"PENDING" | "PAID" | "FAILED"> = [
  "PENDING",
  "PAID",
  "FAILED",
];
type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

type AdminOrder = {
  id: string;
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
  shippedAt: string | Date | null;
  deliveredAt: string | Date | null;
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

type TeamAccount = {
  id: string;
  fullName: string;
  email: string;
  division: DivisionName | null;
  permissions: string[];
  active: boolean;
  createdAt: string | Date;
};

function getQuoteStatusLabel(status: QuoteStatusValue) {
  if (status === "CONTACTED") return "Contactado";
  if (status === "CLOSED") return "Cerrado";
  return "Nueva";
}

type ProductImageChoice = {
  label: string;
  image: string | null;
};

function getInventoryTone(
  status?: ProductoCatalogo["estadoInventario"],
) {
  if (status === "out-of-stock") {
    return {
      label: "Agotado",
      className: "bg-[#fff1f1] text-[#c53b3b]",
    };
  }

  if (status === "low-stock") {
    return {
      label: "Stock bajo",
      className: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]",
    };
  }

  return {
    label: "En stock",
    className: "bg-[#effaf2] text-[#1f6b39]",
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

function getPaymentStatusLabel(status: "PENDING" | "PAID" | "FAILED") {
  if (status === "PAID") return "Pago confirmado";
  if (status === "FAILED") return "Pago fallido";
  return "Pago pendiente";
}

function getOrderEditState(order: AdminOrder): OrderEditState {
  return {
    shippingStatus: order.shippingStatus,
    paymentStatus: order.paymentStatus,
    carrier: order.carrier || "",
    trackingNumber: order.trackingNumber || "",
    adminNotes: order.adminNotes || "",
  };
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
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 z-0">
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

function getSubcategoryOptionsFor(categoria: string, adminProducts: StoreProduct[]) {
  const normalizedCategoria = normalizeMatchKey(categoria);
  const menuGroups = cauchosCategorySubcategories[categoria] ?? [];
  const fromMenu = menuGroups.map((group) => group.name);
  const fromProducts = adminProducts
    .filter((product) => normalizeMatchKey(product.categoria) === normalizedCategoria)
    .map((product) => product.subcategoria)
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set([...fromMenu, ...fromProducts]));
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
        normalizeMatchKey(product.subcategoria) === normalizedSubcategoria,
    )
    .map((product) => product.categoriaMenor)
    .filter((value): value is string => Boolean(value));

  return Array.from(new Set([...fromMenu, ...fromProducts]));
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
                label="Categoría"
                name={`categoriaAdicional-${item.id}`}
                value={item.categoria}
                options={categoryOptions}
                entityName="categoría"
                strict={strictCategory}
                onChange={(value) =>
                  updateItem(item.id, { categoria: value, subcategoria: "", categoriaMenor: "" })
                }
              />

              {!strictCategory && (
                <>
                  <CategoryComboBox
                    label="Sub categoría"
                    name={`subcategoriaAdicional-${item.id}`}
                    value={item.subcategoria}
                    options={getSubcategoryOptionsFor(item.categoria, adminProducts)}
                    entityName="subcategoría"
                    onChange={(value) => updateItem(item.id, { subcategoria: value, categoriaMenor: "" })}
                  />

                  <CategoryComboBox
                    label="Categoría menor"
                    name={`categoriaMenorAdicional-${item.id}`}
                    value={item.categoriaMenor}
                    options={getCategoriaMenorOptionsFor(item.categoria, item.subcategoria, adminProducts)}
                    entityName="categoría menor"
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

function splitCommaSeparatedValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

function AccountsIcon() {
  return (
    <SidebarIconShell>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.3c2.6.5 4.4 2.6 4.4 5.2" />
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

function WhatsAppSubIcon() {
  return (
    <SidebarIconShell>
      <path d="M4 20l1.4-4.1A8 8 0 1 1 8.9 19Z" />
      <path d="M8.6 8.8c-.2.9.4 2.2 1.4 3.2s2.3 1.6 3.2 1.4" />
    </SidebarIconShell>
  );
}

const SETTINGS_SUB_ICONS: Record<"images" | "texts" | "whatsapp", () => React.JSX.Element> = {
  images: ImagesSubIcon,
  texts: TextsSubIcon,
  whatsapp: WhatsAppSubIcon,
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

const SIDEBAR_ICONS: Partial<Record<AdminToolKey | "dashboard", () => React.JSX.Element>> = {
  dashboard: DashboardIcon,
  create: CreateIcon,
  edit: EditIcon,
  inventory: InventoryIcon,
  orders: OrdersIcon,
  quotes: QuotesIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
  accounts: AccountsIcon,
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
  } = useProducts();
  const adminProducts = useMemo(
    () => allAdminProducts.filter((product) => product.division === adminDivision),
    [allAdminProducts, adminDivision],
  );
  const [activeTab, setActiveTab] = useState<
    | "create"
    | "edit"
    | "inventory"
    | "orders"
    | "quotes"
    | "reports"
    | "settings"
    | "accounts"
    | null
  >(null);
  const imageDivisionFilter = adminDivision;
  const [siteImages, setSiteImages] = useState<Record<string, string>>({});
  const [siteImageLinks, setSiteImageLinks] = useState<Record<string, string>>({});
  const [savingLinkKey, setSavingLinkKey] = useState<string | null>(null);
  const [selectedImageGroup, setSelectedImageGroup] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [uploadingImageKey, setUploadingImageKey] = useState<string | null>(null);
  const [savedImageKey, setSavedImageKey] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [siteTextsAdmin, setSiteTextsAdmin] = useState<Record<string, string>>({});
  const [isLoadingTexts, setIsLoadingTexts] = useState(false);
  const [textsError, setTextsError] = useState<string | null>(null);
  const [savingTextKey, setSavingTextKey] = useState<string | null>(null);
  const [savedTextKey, setSavedTextKey] = useState<string | null>(null);
  const [selectedTextGroup, setSelectedTextGroup] = useState<string | null>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<"images" | "texts" | "whatsapp" | null>(null);
  const [editSearch, setEditSearch] = useState("");
  const [editCategoryFilter, setEditCategoryFilter] = useState<"Todas" | Categoria>("Todas");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<
    "all" | "low-stock" | "out-of-stock"
  >("all");
  const [orderSearch, setOrderSearch] = useState("");
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
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [teamAccounts, setTeamAccounts] = useState<TeamAccount[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [newAccountForm, setNewAccountForm] = useState({
    fullName: "",
    email: "",
    password: "",
    permissions: [] as AdminToolKey[],
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [savingAccountId, setSavingAccountId] = useState<string | null>(null);
  const [inventoryAdjustments, setInventoryAdjustments] = useState<Record<string, string>>({});
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovementSummary[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [quotes, setQuotes] = useState<AdminQuote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<"all" | QuoteStatusValue>("all");
  const [isSavingQuoteStatus, setIsSavingQuoteStatus] = useState(false);
  const [quoteNotesDraft, setQuoteNotesDraft] = useState("");
  const [prevSelectedQuoteId, setPrevSelectedQuoteId] = useState<string | null>(null);
  const [isSavingQuoteNotes, setIsSavingQuoteNotes] = useState(false);
  const [salesReport, setSalesReport] = useState<SalesReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderForm, setOrderForm] = useState<OrderEditState>({
    shippingStatus: "PENDING",
    paymentStatus: "PENDING",
    carrier: "",
    trackingNumber: "",
    adminNotes: "",
  });
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const editFormRef = useRef<HTMLFormElement | null>(null);
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
  // Only this division's official categories are selectable here — they're
  // the ones that actually appear in the storefront's category navigation.
  // Legacy seed products carry older category strings (e.g. "Mangueras",
  // "Sellos y empaques") that predate this taxonomy and aren't real nav
  // categories, so they're intentionally excluded from the picker.
  const assignableToolKeys = useMemo(
    () => ADMIN_TOOL_KEYS.filter((key) => key !== "inventory" || !isServiceAdmin),
    [isServiceAdmin],
  );
  const categoryOptions = useMemo(() => getCategoriasForDivision(adminDivision), [adminDivision]);
  const subcategoryOptions = useMemo(() => {
    const normalizedCategoria = normalizeMatchKey(form.categoria);
    const menuGroups = cauchosCategorySubcategories[form.categoria] ?? [];
    const fromMenu = menuGroups.map((group) => group.name);
    const fromProducts = adminProducts
      .filter((product) => normalizeMatchKey(product.categoria) === normalizedCategoria)
      .map((product) => product.subcategoria)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...fromMenu, ...fromProducts]));
  }, [adminProducts, form.categoria]);
  const categoriaMenorOptions = useMemo(() => {
    const normalizedCategoria = normalizeMatchKey(form.categoria);
    const normalizedSubcategoria = normalizeMatchKey(form.subcategoria);
    const menuGroups = cauchosCategorySubcategories[form.categoria] ?? [];
    const fromMenu =
      menuGroups.find((group) => normalizeMatchKey(group.name) === normalizedSubcategoria)
        ?.items ?? [];
    const fromProducts = adminProducts
      .filter(
        (product) =>
          normalizeMatchKey(product.categoria) === normalizedCategoria &&
          normalizeMatchKey(product.subcategoria) === normalizedSubcategoria,
      )
      .map((product) => product.categoriaMenor)
      .filter((value): value is string => Boolean(value));

    return Array.from(new Set([...fromMenu, ...fromProducts]));
  }, [adminProducts, form.categoria, form.subcategoria]);
  const stockAlerts = useMemo(() => {
    const divisionProducts = adminProducts.filter((product) => product.division === adminDivision);
    return {
      lowStock: divisionProducts.filter((product) => product.estadoInventario === "low-stock").length,
      outOfStock: divisionProducts.filter((product) => product.estadoInventario === "out-of-stock").length,
    };
  }, [adminProducts, adminDivision]);
  const filteredProducts = useMemo(() => {
    const search = editSearch.trim().toLowerCase();

    return adminProducts.filter((product) => {
      const matchesCategory =
        editCategoryFilter === "Todas" || product.categoria === editCategoryFilter;
      const matchesSearch =
        search.length === 0 ||
        product.nombre.toLowerCase().includes(search) ||
        product.marca.toLowerCase().includes(search) ||
        (product.sku || "").toLowerCase().includes(search);
      const matchesInventory =
        inventoryStatusFilter === "all" ||
        product.estadoInventario === inventoryStatusFilter;

      return matchesCategory && matchesSearch && matchesInventory;
    });
  }, [adminProducts, editCategoryFilter, editSearch, inventoryStatusFilter]);
  const filteredOrders = useMemo(() => {
    const search = orderSearch.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesFilter =
        orderShippingFilter === "all" || order.shippingStatus === orderShippingFilter;
      const matchesSearch =
        search.length === 0 ||
        order.id.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        order.city.toLowerCase().includes(search) ||
        (order.trackingNumber || "").toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [orderSearch, orderShippingFilter, orders]);

  const filteredQuotes = useMemo(() => {
    return quotes.filter(
      (quote) => quoteStatusFilter === "all" || quote.status === quoteStatusFilter,
    );
  }, [quoteStatusFilter, quotes]);

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
        const permissions = payload.user.permissions ?? [];
        setIsAuthenticated(true);
        setAdminName(payload.user.fullName);
        setAdminDivision(payload.user.division);
        setAdminPermissions(permissions);

        const canAccess = (tool: AdminToolKey) => hasAdminPermission(permissions, tool);

        if (canAccess("dashboard")) {
          void loadDashboardMetrics();
        } else {
          const fallback: Array<[AdminToolKey, () => void]> = [
            ["create", openCreateView],
            ["edit", openEditView],
            ...(isServiceDivision(payload.user.division)
              ? []
              : ([["inventory", openInventoryView]] as Array<[AdminToolKey, () => void]>)),
            ["orders", openOrdersView],
            ["quotes", openQuotesView],
            ["reports", openReportsView],
            ["images", () => openSettingsSection("images")],
            ["settings", () => openSettingsSection("texts")],
            ["accounts", openAccountsView],
          ];
          const firstAllowed = fallback.find(([tool]) => canAccess(tool));
          firstAllowed?.[1]();
        }

        if (canAccess("quotes")) {
          void loadQuotes();
        }
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

  const uploadProductImage = async (
    file: File,
    productName: string,
    fallbackUrl: string | null = adminBrand.logo,
  ) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("productName", productName);

    const uploadResponse = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData,
    });

    const uploadPayload = (await uploadResponse.json()) as {
      error?: string;
      publicUrl?: string;
    };

    if (!uploadResponse.ok || !uploadPayload.publicUrl) {
      if (isStorageConfigurationError(uploadPayload.error)) {
        return {
          publicUrl: fallbackUrl,
          usedFallback: true,
        };
      }

      throw new Error(
        uploadPayload.error || "No fue posible subir la imagen a Supabase Storage.",
      );
    }

    return {
      publicUrl: uploadPayload.publicUrl,
      usedFallback: false,
    };
  };

  const uploadPdf = async (file: File, productName: string) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("productName", productName);

    const uploadResponse = await fetch("/api/uploads", {
      method: "POST",
      body: uploadData,
    });

    const uploadPayload = (await uploadResponse.json()) as {
      error?: string;
      publicUrl?: string;
    };

    if (!uploadResponse.ok || !uploadPayload.publicUrl) {
      throw new Error(uploadPayload.error || "No fue posible subir la ficha técnica.");
    }

    return uploadPayload.publicUrl;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProduct(true);
    setRequestError("");
    setToast(null);
    const isEditing = Boolean(editingSlug);

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

      const payload = {
        sku: form.sku,
        oemReferencia: form.oemReferencia,
        referenciasAlternas: splitCommaSeparatedValues(form.referenciasAlternas),
        categoria: form.categoria,
        subcategoria: form.subcategoria,
        categoriaMenor: form.categoriaMenor,
        categoriasAdicionales: form.categoriasAdicionales
          .filter((item) => item.categoria.trim())
          .map((item) => ({
            categoria: item.categoria.trim(),
            subcategoria: item.subcategoria.trim() || undefined,
            categoriaMenor: item.categoriaMenor.trim() || undefined,
          })),
        nombre: form.nombre,
        marca: form.marca,
        division: adminDivision,
        precioValor: isServiceAdmin ? 1 : Number(form.precioValor),
        precioAnteriorValor: isServiceAdmin
          ? 1
          : Number(form.precioAnteriorValor || form.precioValor),
        displayPriceOverride: isServiceAdmin ? form.displayPriceOverride : undefined,
        displaySecondaryLabel: isServiceAdmin ? form.displaySecondaryLabel : undefined,
        stock: isServiceAdmin ? 0 : Number(form.stock),
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
      subcategoria: product.subcategoria || "",
      categoriaMenor: product.categoriaMenor || "",
      categoriasAdicionales: (product.categoriasAdicionales || []).map((entry) =>
        createAdditionalCategoryItem(entry),
      ),
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

  async function loadOrders() {
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

    if (!selectedOrderId && payload.orders[0]) {
      setSelectedOrderId(payload.orders[0].id);
      setOrderForm(getOrderEditState(payload.orders[0]));
    }
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

    if (!selectedQuoteId && payload.quotes[0]) {
      setSelectedQuoteId(payload.quotes[0].id);
    }
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

  async function loadSalesReport() {
    setIsLoadingReport(true);

    const response = await fetch("/api/admin/reports");
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

  async function loadDashboardMetrics() {
    setIsLoadingDashboard(true);

    const response = await fetch("/api/admin/dashboard");
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

  const openQuotesView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setQuoteStatusFilter("all");
    setActiveTab("quotes");
    void loadQuotes();
  };

  const openReportsView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("reports");
    void loadSalesReport();
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

  const handleSiteImageLinkSave = async (slotKey: string, link: string) => {
    setSavingLinkKey(slotKey);
    setImageError(null);
    try {
      const response = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slotKey, link }),
      });
      if (!response.ok) {
        throw new Error("No se pudo guardar el enlace.");
      }
      setSiteImageLinks((current) => ({ ...current, [slotKey]: link.trim() }));
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
      const payload = (await response.json()) as { whatsappNumber?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No fue posible cargar la configuración.");
      }
      setWhatsappNumber(payload.whatsappNumber ?? "");
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

  const loadSiteTexts = async () => {
    setIsLoadingTexts(true);
    setTextsError(null);
    try {
      const response = await fetch("/api/admin/texts");
      const payload = (await response.json()) as { texts?: Record<string, string>; error?: string };
      if (!response.ok || !payload.texts) {
        throw new Error(payload.error || "No fue posible cargar los textos.");
      }
      setSiteTextsAdmin(payload.texts);
    } catch (error) {
      setTextsError(error instanceof Error ? error.message : "No fue posible cargar los textos.");
    } finally {
      setIsLoadingTexts(false);
    }
  };

  const handleSaveText = async (key: string, value: string) => {
    setSavingTextKey(key);
    setTextsError(null);
    try {
      const response = await fetch("/api/admin/texts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const payload = (await response.json()) as { value?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error || "No se pudo guardar el texto.");
      }
      setSiteTextsAdmin((current) => ({ ...current, [key]: payload.value ?? value }));
      setSavedTextKey(key);
      setTimeout(() => setSavedTextKey((current) => (current === key ? null : current)), 1500);
    } catch (error) {
      setTextsError(error instanceof Error ? error.message : "No se pudo guardar el texto.");
    } finally {
      setSavingTextKey(null);
    }
  };

  const openSettingsSection = (section: "images" | "texts" | "whatsapp") => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("settings");
    setIsSettingsMenuOpen(true);
    setSettingsSection(section);
    setSelectedImageGroup(null);
    setSelectedTextGroup(null);
    if (section === "images") void loadSiteImages();
    if (section === "texts") void loadSiteTexts();
    if (section === "whatsapp") void loadSiteSettings();
  };

  const openSettingsView = () => {
    if (canAccessTool("images")) {
      openSettingsSection("images");
    } else {
      openSettingsSection("texts");
    }
  };

  const loadTeamAccounts = async () => {
    setIsLoadingTeam(true);
    setTeamError("");
    try {
      const response = await fetch("/api/admin/team");
      const payload = (await response.json()) as {
        accounts?: TeamAccount[];
        error?: string;
      };

      if (!response.ok || !payload.accounts) {
        throw new Error(payload.error || "No fue posible cargar las cuentas.");
      }

      setTeamAccounts(payload.accounts);
    } catch (error) {
      setTeamError(
        error instanceof Error ? error.message : "No fue posible cargar las cuentas.",
      );
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const openAccountsView = () => {
    setSelectedImage(null);
    setRequestError("");
    setPrimaryImageIndex(0);
    setEditingSlug(null);
    setActiveTab("accounts");
    void loadTeamAccounts();
  };

  const toggleNewAccountPermission = (tool: AdminToolKey) => {
    setNewAccountForm((current) => ({
      ...current,
      permissions: current.permissions.includes(tool)
        ? current.permissions.filter((item) => item !== tool)
        : [...current.permissions, tool],
    }));
  };

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingAccount(true);
    setTeamError("");

    try {
      const response = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAccountForm),
      });
      const payload = (await response.json()) as {
        account?: TeamAccount;
        error?: string;
      };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error || "No fue posible crear la cuenta.");
      }

      setTeamAccounts((current) => [...current, payload.account!]);
      setNewAccountForm({ fullName: "", email: "", password: "", permissions: [] });
      setToast({ tone: "success", message: "Cuenta creada correctamente." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No fue posible crear la cuenta.";
      setTeamError(message);
      setToast({ tone: "error", message });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleToggleAccountPermission = async (account: TeamAccount, tool: AdminToolKey) => {
    const nextPermissions = account.permissions.includes(tool)
      ? account.permissions.filter((item) => item !== tool)
      : [...account.permissions, tool];

    setSavingAccountId(account.id);
    try {
      const response = await fetch(`/api/admin/team/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: nextPermissions }),
      });
      const payload = (await response.json()) as {
        account?: TeamAccount;
        error?: string;
      };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error || "No fue posible actualizar los permisos.");
      }

      setTeamAccounts((current) =>
        current.map((item) => (item.id === account.id ? payload.account! : item)),
      );
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "No fue posible actualizar los permisos.",
      });
    } finally {
      setSavingAccountId(null);
    }
  };

  const handleToggleAccountActive = async (account: TeamAccount) => {
    setSavingAccountId(account.id);
    try {
      const response = await fetch(`/api/admin/team/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !account.active }),
      });
      const payload = (await response.json()) as {
        account?: TeamAccount;
        error?: string;
      };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error || "No fue posible actualizar la cuenta.");
      }

      setTeamAccounts((current) =>
        current.map((item) => (item.id === account.id ? payload.account! : item)),
      );
      setToast({
        tone: "success",
        message: payload.account.active ? "Cuenta activada." : "Cuenta desactivada.",
      });
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "No fue posible actualizar la cuenta.",
      });
    } finally {
      setSavingAccountId(null);
    }
  };

  const handleDeleteAccount = async (account: TeamAccount) => {
    if (!window.confirm(`¿Eliminar la cuenta de ${account.fullName}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setSavingAccountId(account.id);
    try {
      const response = await fetch(`/api/admin/team/${account.id}`, { method: "DELETE" });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "No fue posible eliminar la cuenta.");
      }

      setTeamAccounts((current) => current.filter((item) => item.id !== account.id));
      setToast({ tone: "success", message: "Cuenta eliminada correctamente." });
    } catch (error) {
      setToast({
        tone: "error",
        message: error instanceof Error ? error.message : "No fue posible eliminar la cuenta.",
      });
    } finally {
      setSavingAccountId(null);
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

      const saveResponse = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: slotKey, url: uploadPayload.publicUrl }),
      });
      if (!saveResponse.ok) {
        throw new Error("No se pudo guardar la imagen.");
      }

      setSiteImages((current) => ({ ...current, [slotKey]: uploadPayload.publicUrl! }));
      setSavedImageKey(slotKey);
      window.setTimeout(() => setSavedImageKey(null), 2500);
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    } finally {
      setUploadingImageKey(null);
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
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setIsAuthenticated(false);
    setAdminName("");
    router.refresh();
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

  const canAccessTool = (tool: AdminToolKey) => hasAdminPermission(adminPermissions, tool);

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
      { key: "quotes", label: "Cotizaciones", active: activeTab === "quotes", onClick: openQuotesView, count: pendingQuotesCount },
      { key: "reports", label: "Informes", active: activeTab === "reports", onClick: openReportsView },
      {
        key: "settings",
        label: "Configuración",
        active: activeTab === "settings",
        onClick: openSettingsView,
      },
      { key: "accounts", label: "Cuentas", active: activeTab === "accounts", onClick: openAccountsView },
    ] as Array<{
      key: AdminToolKey;
      label: string;
      active: boolean;
      onClick: () => void;
      count?: number;
    }>
  ).filter((item) =>
    item.key === "settings"
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
            key: "whatsapp" as const,
            label: "WhatsApp",
            active: activeTab === "settings" && settingsSection === "whatsapp",
            onClick: () => openSettingsSection("whatsapp"),
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

      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
          <Link href={adminBrand.siteHref} className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
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

          <nav className="flex-1 overflow-y-auto px-3 py-4">
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

          <div className="border-t border-slate-200 p-3">
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
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-w-max items-center border-b-2 border-transparent px-3 py-3 text-[11px] font-black uppercase tracking-[0.04em] text-red-600 transition-colors duration-200"
                >
                  Cerrar sesión
                </button>
              </div>
            </nav>
          </header>

          <section className="mx-auto w-full max-w-[1440px] px-6 py-12">
        {activeTab && (
          <div className="mb-10">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#8b8d91]">
              {adminBrand.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#4f545a] md:text-6xl">
              {adminBrand.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#6e7379]">
              {adminBrand.description}
            </p>
            {adminName && (
              <p className="mt-3 text-sm font-medium text-[#16384f]">
                Sesión activa: {adminName || adminBrand.sessionLabel}
              </p>
            )}
          </div>
        )}

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

              {isLoadingDashboard && !dashboardMetrics ? (
                <p className="text-sm text-[#6e7379]">Cargando métricas...</p>
              ) : !dashboardMetrics || !salesReport ? (
                <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-[#fafaf9] p-8 text-center text-sm leading-7 text-[#6e7379]">
                  Aún no hay datos suficientes para mostrar el dashboard.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {[
                      {
                        label: "Vendido hoy",
                        value: formatCurrency(dashboardMetrics.todayRevenue),
                        helper: `${formatNumber(dashboardMetrics.todayOrders)} pedidos hoy`,
                        Icon: DashboardMetricRevenueIcon,
                      },
                      {
                        label: "Vendido esta semana",
                        value: formatCurrency(dashboardMetrics.weekRevenue),
                        helper: `${formatNumber(dashboardMetrics.weekOrders)} pedidos esta semana`,
                        Icon: DashboardMetricRevenueIcon,
                      },
                      {
                        label: "Vendido este mes",
                        value: formatCurrency(dashboardMetrics.monthRevenue),
                        helper: `${formatNumber(dashboardMetrics.monthOrders)} pedidos este mes`,
                        Icon: DashboardMetricRevenueIcon,
                      },
                      {
                        label: "Pedidos totales",
                        value: formatNumber(salesReport.totals.orders),
                        helper: `${formatNumber(salesReport.totals.paidOrders)} pagados`,
                        Icon: DashboardMetricOrdersIcon,
                      },
                      {
                        label: "Ticket promedio",
                        value: formatCurrency(salesReport.totals.averageOrderValue),
                        helper: "Promedio por pedido",
                        Icon: DashboardMetricTicketIcon,
                      },
                      {
                        label: "Clientes nuevos",
                        value: formatNumber(dashboardMetrics.newCustomersThisMonth),
                        helper: "Compradores nuevos este mes",
                        Icon: DashboardMetricCustomersIcon,
                      },
                      {
                        label: "Pedidos pendientes",
                        value: formatNumber(salesReport.totals.pendingOrders),
                        helper: `${formatNumber(salesReport.totals.cancelledOrders)} cancelados`,
                        Icon: DashboardMetricClockIcon,
                      },
                      {
                        label: "Alertas de stock",
                        value: formatNumber(stockAlerts.lowStock + stockAlerts.outOfStock),
                        helper: `${formatNumber(stockAlerts.outOfStock)} agotados`,
                        Icon: DashboardMetricAlertIcon,
                      },
                    ].map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-[1.5rem] border border-black/8 bg-[#fafaf9] px-5 py-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-shadow duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                            {metric.label}
                          </p>
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `rgba(${adminAccentRgb}, 0.1)`, color: adminBrand.accent }}
                          >
                            <metric.Icon />
                          </span>
                        </div>
                        <p
                          className="mt-3 text-3xl font-semibold tracking-[-0.04em]"
                          style={{ color: adminBrand.accent }}
                        >
                          {metric.value}
                        </p>
                        <p className="mt-2 text-sm text-[#6e7379]">{metric.helper}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8b8d91]">
                      Destacados del mes
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div
                        className="rounded-[1.75rem] border border-black/8 p-6 text-white shadow-[0_18px_35px_rgba(15,23,42,0.18)]"
                        style={{ backgroundColor: adminBrand.accent }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                            Producto más vendido
                          </p>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                            <DashboardTrophyIcon />
                          </span>
                        </div>
                        {salesReport.topProduct ? (
                          <>
                            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                              {salesReport.topProduct.name}
                            </h3>
                            <p className="mt-2 text-sm text-white/72">
                              {formatNumber(salesReport.topProduct.quantitySold)} unidades vendidas
                            </p>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-white/72">Aún no hay ventas registradas.</p>
                        )}
                      </div>

                      <div className="rounded-[1.75rem] border border-black/8 bg-[#fafaf9] p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-shadow duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
                            Categoría más vendida
                          </p>
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `rgba(${adminAccentRgb}, 0.1)`, color: adminBrand.accent }}
                          >
                            <DashboardTagIcon />
                          </span>
                        </div>
                        {dashboardMetrics.topCategory ? (
                          <>
                            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#1f2328]">
                              {dashboardMetrics.topCategory.category}
                            </h3>
                            <p className="mt-2 text-sm text-[#6e7379]">
                              {formatNumber(dashboardMetrics.topCategory.quantitySold)} unidades este mes
                            </p>
                          </>
                        ) : (
                          <p className="mt-3 text-sm text-[#6e7379]">Sin ventas este mes todavía.</p>
                        )}
                      </div>

                      <div className="rounded-[1.75rem] border border-black/8 bg-[#fafaf9] p-6 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-shadow duration-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91]">
                            Clientes atendidos
                          </p>
                          <span
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `rgba(${adminAccentRgb}, 0.1)`, color: adminBrand.accent }}
                          >
                            <DashboardMetricCustomersIcon />
                          </span>
                        </div>
                        <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-[#1f2328]">
                          {formatNumber(dashboardMetrics.customersThisMonth)}
                        </h3>
                        <p className="mt-2 text-sm text-[#6e7379]">Compradores distintos este mes</p>
                      </div>
                    </div>
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

                <div className="grid gap-5 md:grid-cols-2">
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

                  <CategoryComboBox
                    label={adminDivision === "Import" || adminDivision === "Plastic" ? "Categoría" : "Crear categoría"}
                    name="categoria"
                    value={form.categoria}
                    options={categoryOptions}
                    placeholder="Ej. Transporte, logística y puertos marítimos"
                    required
                    entityName="categoría"
                    strict={adminDivision === "Import" || adminDivision === "Plastic"}
                    onChange={(value) => setForm((current) => ({ ...current, categoria: value }))}
                  />

                  {adminDivision !== "Import" && adminDivision !== "Plastic" && (
                    <>
                      <CategoryComboBox
                        label="Sub categoría"
                        name="subcategoria"
                        value={form.subcategoria}
                        options={subcategoryOptions}
                        placeholder="Ej. O-rings, Neopreno, EPDM"
                        entityName="subcategoría"
                        onChange={(value) => setForm((current) => ({ ...current, subcategoria: value }))}
                      />

                      <CategoryComboBox
                        label="Categoría menor"
                        name="categoriaMenor"
                        value={form.categoriaMenor}
                        options={categoriaMenorOptions}
                        placeholder="Ej. Pintura para interior"
                        entityName="categoría menor"
                        onChange={(value) => setForm((current) => ({ ...current, categoriaMenor: value }))}
                      />
                    </>
                  )}

                  <AdditionalCategoriesEditor
                    items={form.categoriasAdicionales}
                    categoryOptions={categoryOptions}
                    adminProducts={adminProducts}
                    strictCategory={adminDivision === "Import" || adminDivision === "Plastic"}
                    onChange={(items) => setForm((current) => ({ ...current, categoriasAdicionales: items }))}
                  />

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
                      <input
                        name="stock"
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
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

                  <div className="grid gap-5 md:grid-cols-2">
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

                    <CategoryComboBox
                      label={adminDivision === "Import" || adminDivision === "Plastic" ? "Categoría" : "Crear categoría"}
                      name="categoria"
                      value={form.categoria}
                      options={categoryOptions}
                      placeholder="Ej. Transporte, logística y puertos marítimos"
                      required
                      entityName="categoría"
                      strict={adminDivision === "Import" || adminDivision === "Plastic"}
                      onChange={(value) => setForm((current) => ({ ...current, categoria: value }))}
                    />

                    {adminDivision !== "Import" && adminDivision !== "Plastic" && (
                      <>
                        <CategoryComboBox
                          label="Sub categoría"
                          name="subcategoria"
                          value={form.subcategoria}
                          options={subcategoryOptions}
                          placeholder="Ej. O-rings, Neopreno, EPDM"
                          entityName="subcategoría"
                          onChange={(value) => setForm((current) => ({ ...current, subcategoria: value }))}
                        />

                        <CategoryComboBox
                          label="Categoría menor"
                          name="categoriaMenor"
                          value={form.categoriaMenor}
                          options={categoriaMenorOptions}
                          placeholder="Ej. Pintura para interior"
                          entityName="categoría menor"
                          onChange={(value) => setForm((current) => ({ ...current, categoriaMenor: value }))}
                        />
                      </>
                    )}

                    <AdditionalCategoriesEditor
                      items={form.categoriasAdicionales}
                      categoryOptions={categoryOptions}
                      adminProducts={adminProducts}
                      strictCategory={adminDivision === "Import" || adminDivision === "Plastic"}
                      onChange={(items) => setForm((current) => ({ ...current, categoriasAdicionales: items }))}
                    />

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
                          <input
                            name="stock"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                          />
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
            <div className="admin-fade-up space-y-8">
              <div className="rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Informes
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Métricas de ventas
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6e7379]">
                      Datos calculados desde los pedidos reales: unidades vendidas, productos líderes, ingresos y estado de pagos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadSalesReport()}
                    className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                  >
                    Recargar informes
                  </button>
                </div>

                {isLoadingReport ? (
                  <p className="mt-8 text-sm text-[#6e7379]">Cargando métricas...</p>
                ) : !salesReport ? (
                  <div className="mt-8 rounded-[1.75rem] border border-dashed border-black/12 bg-[#fafaf9] p-8 text-center text-sm leading-7 text-[#6e7379]">
                    Aún no se ha cargado el informe. Usa el botón para consultar las métricas.
                  </div>
                ) : (
                  <div className="mt-8 space-y-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Unidades vendidas",
                          value: formatNumber(salesReport.totals.productsSold),
                          helper: `${formatNumber(salesReport.totals.orders)} pedidos no cancelados`,
                        },
                        {
                          label: "Ingresos confirmados",
                          value: formatCurrency(salesReport.totals.paidRevenue),
                          helper: `${formatNumber(salesReport.totals.paidOrders)} pagos confirmados`,
                        },
                        {
                          label: "Ticket promedio",
                          value: formatCurrency(salesReport.totals.averageOrderValue),
                          helper: "Promedio sobre pedidos activos",
                        },
                        {
                          label: "Pendientes",
                          value: formatNumber(salesReport.totals.pendingOrders),
                          helper: `${formatNumber(salesReport.totals.cancelledOrders)} cancelados`,
                        },
                      ].map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-[1.5rem] border border-black/8 bg-[#fafaf9] px-5 py-5"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                            {metric.label}
                          </p>
                          <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--admin-accent)]">
                            {metric.value}
                          </p>
                          <p className="mt-2 text-sm text-[#6e7379]">{metric.helper}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                      <div className="rounded-[1.75rem] border border-black/8 bg-[#16384f] p-6 text-white shadow-[0_18px_35px_rgba(22,56,79,0.18)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/58">
                          Producto más vendido
                        </p>
                        {salesReport.topProduct ? (
                          <>
                            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em]">
                              {salesReport.topProduct.name}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-white/72">
                              {salesReport.topProduct.category}
                            </p>
                            <div className="mt-6 grid grid-cols-2 gap-3">
                              <div className="rounded-[1.2rem] bg-white/10 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-white/58">
                                  Vendidos
                                </p>
                                <p className="mt-2 text-2xl font-semibold">
                                  {formatNumber(salesReport.topProduct.quantitySold)}
                                </p>
                              </div>
                              <div className="rounded-[1.2rem] bg-white/10 px-4 py-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-white/58">
                                  Ingresos
                                </p>
                                <p className="mt-2 text-xl font-semibold">
                                  {formatCurrency(salesReport.topProduct.revenue)}
                                </p>
                              </div>
                            </div>
                            <p className="mt-5 text-sm text-white/68">
                              Stock actual: {salesReport.topProduct.stock ?? "Sin dato"}
                            </p>
                          </>
                        ) : (
                          <p className="mt-4 text-sm leading-7 text-white/72">
                            Todavía no hay ventas registradas para identificar un producto líder.
                          </p>
                        )}
                      </div>

                      <div className="rounded-[1.75rem] border border-black/8 bg-[#fafaf9] p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
                              Ranking
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                              Top productos
                            </h3>
                          </div>
                          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0f766e] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                            Top 5
                          </span>
                        </div>

                        <div className="mt-5 space-y-3">
                          {salesReport.topProducts.length === 0 ? (
                            <p className="text-sm text-[#6e7379]">Aún no hay productos vendidos.</p>
                          ) : (
                            salesReport.topProducts.map((product, index) => {
                              const maxSold = salesReport.topProducts[0]?.quantitySold || 1;
                              const progress = Math.max(
                                8,
                                Math.round((product.quantitySold / maxSold) * 100),
                              );

                              return (
                                <div
                                  key={product.productId}
                                  className="rounded-[1.15rem] border border-black/8 bg-white px-4 py-4"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-[#1f2328]">
                                        {index + 1}. {product.name}
                                      </p>
                                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b8d91]">
                                        {product.category}
                                      </p>
                                    </div>
                                    <div className="text-right text-sm">
                                      <p className="font-semibold text-[var(--admin-accent)]">
                                        {formatNumber(product.quantitySold)} vendidos
                                      </p>
                                      <p className="mt-1 text-[#6e7379]">
                                        {formatCurrency(product.revenue)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5e7eb]">
                                    <span
                                      className="block h-full rounded-full bg-[#0f766e]"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                          Ventas por categoría
                        </h3>
                        <div className="mt-5 space-y-3">
                          {salesReport.categories.length === 0 ? (
                            <p className="text-sm text-[#6e7379]">Aún no hay categorías con ventas.</p>
                          ) : (
                            salesReport.categories.map((category) => (
                              <div
                                key={category.category}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-4"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-[#1f2328]">
                                    {category.category}
                                  </p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b8d91]">
                                    {formatNumber(category.quantitySold)} unidades
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-[var(--admin-accent)]">
                                  {formatCurrency(category.revenue)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                          Pedidos recientes
                        </h3>
                        <div className="mt-5 space-y-3">
                          {salesReport.recentOrders.length === 0 ? (
                            <p className="text-sm text-[#6e7379]">Aún no hay pedidos registrados.</p>
                          ) : (
                            salesReport.recentOrders.map((order) => (
                              <div
                                key={order.id}
                                className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-[#1f2328]">
                                      {order.customerName}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8b8d91]">
                                      {formatOrderCode(order.id)}
                                    </p>
                                    <p className="mt-2 text-xs text-[#6e7379]">
                                      {new Date(order.createdAt).toLocaleString("es-CO")}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="rounded-full border border-[var(--admin-accent)]/18 bg-[var(--admin-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--admin-accent)]">
                                      {getPaymentStatusLabel(order.paymentStatus)}
                                    </span>
                                    <p className="mt-3 text-sm font-semibold text-[#16384f]">
                                      {formatCurrency(order.subtotal)}
                                    </p>
                                    <p className="mt-1 text-xs text-[#6e7379]">
                                      {order.totalItems} producto
                                      {order.totalItems === 1 ? "" : "s"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#8b8d91]">
                      Actualizado: {new Date(salesReport.generatedAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="admin-fade-up space-y-8">
              <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Pedidos
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Gestión de envíos
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Aquí controlas el estado logístico del pedido, la transportadora y el número de guía que verá el cliente.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-[#4f545a]">
                        Buscar por pedido, cliente o guía
                      </span>
                      <input
                        type="search"
                        value={orderSearch}
                        onChange={(event) => setOrderSearch(event.target.value)}
                        placeholder="Ej: cm..., Brandon, 12345..."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setOrderShippingFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          orderShippingFilter === "all"
                            ? "bg-[#16384f] text-white"
                            : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todos
                      </button>
                      {shippingStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setOrderShippingFilter(status)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                            orderShippingFilter === status
                              ? "bg-[#6366f1] text-white"
                              : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                          }`}
                        >
                          {getShippingStatusLabel(status)}
                        </button>
                      ))}
                    </div>

                    <p className="mt-5 text-sm text-[#6e7379]">
                      Mostrando {filteredOrders.length} pedido{filteredOrders.length === 1 ? "" : "s"}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {isLoadingOrders ? (
                      <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        Cargando pedidos...
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        Aún no hay pedidos que coincidan con los filtros actuales.
                      </div>
                    ) : (
                      filteredOrders.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setOrderForm(getOrderEditState(order));
                          }}
                          className={`block w-full rounded-[1.4rem] border p-5 text-left shadow-[0_14px_28px_rgba(15,23,42,0.05)] transition-all duration-200 ${
                            selectedOrderId === order.id
                              ? "border-[#16384f] bg-[#16384f] text-white"
                              : "border-black/8 bg-white hover:-translate-y-0.5 hover:border-[#16384f]/18"
                          }`}
                        >
                          <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${selectedOrderId === order.id ? "text-white/72" : "text-[#8b8d91]"}`}>
                            Pedido
                          </p>
                          <p className="mt-2 text-lg font-semibold">{formatOrderCode(order.id)}</p>
                          <p className={`mt-2 text-sm ${selectedOrderId === order.id ? "text-white/78" : "text-[#5d6167]"}`}>
                            {order.customerName} · {order.city}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedOrderId === order.id ? "bg-white/14 text-white" : "bg-[#effaf2] text-[#1f6b39]"}`}>
                              {getShippingStatusLabel(order.shippingStatus)}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedOrderId === order.id ? "bg-white/14 text-white" : "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"}`}>
                              {getPaymentStatusLabel(order.paymentStatus)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </aside>

                <div className="space-y-8">
                  {!selectedOrder || !selectedOrderPreview ? (
                    <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-8 text-center text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      Selecciona un pedido para editar su envío, guía y notas internas.
                    </div>
                  ) : (
                    <>
                      <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8b8d91]">
                              Pedido seleccionado
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                              {selectedOrderPreview.id}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                              {selectedOrderPreview.customerName} · {selectedOrderPreview.customerEmail} · {selectedOrderPreview.customerPhone}
                            </p>
                            <p className="text-sm leading-7 text-[#6e7379]">
                              {selectedOrderPreview.department}, {selectedOrderPreview.city} · {selectedOrderPreview.addressLine1}
                              {selectedOrderPreview.addressLine2 ? ` · ${selectedOrderPreview.addressLine2}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-[#16384f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                              {selectedOrderPreview.status}
                            </span>
                            <span className="rounded-full border border-[var(--admin-accent)]/18 bg-[var(--admin-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--admin-accent)]">
                              {getPaymentStatusLabel(selectedOrderPreview.paymentStatus)}
                            </span>
                            <span className="rounded-full border border-[#1f8b45]/18 bg-[#effaf2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f6b39]">
                              {getShippingStatusLabel(selectedOrderPreview.shippingStatus)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                          <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] p-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b8d91]">
                                  Resumen del pedido
                                </p>
                                <p className="mt-2 text-sm text-[#6e7379]">
                                  Revisa qué compró el cliente antes de actualizar envío y guía.
                                </p>
                              </div>
                              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#16384f] shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
                                {selectedOrderPreview.totalItems} producto
                                {selectedOrderPreview.totalItems === 1 ? "" : "s"}
                              </span>
                            </div>

                            <div className="mt-5 space-y-3">
                              {selectedOrderPreview.items.map((item) => (
                                <div
                                  key={`summary-${item.id}`}
                                  className="rounded-[1rem] border border-black/8 bg-white px-4 py-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-semibold text-[#1f2328]">
                                        {item.name}
                                      </p>
                                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                        Cantidad
                                      </p>
                                      <p className="mt-1 text-sm font-medium text-[#5d6167]">
                                        {item.quantity}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                        Precio unidad
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-[#16384f]">
                                        {formatCurrency(item.unitPrice)}
                                      </p>
                                      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8b8d91]">
                                        Subtotal
                                      </p>
                                      <p className="mt-1 text-sm font-semibold text-[var(--admin-accent)]">
                                        {formatCurrency(item.lineTotal)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-3">
                            <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Total del pedido
                              </p>
                              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--admin-accent)]">
                                {formatCurrency(selectedOrderPreview.subtotal + selectedOrderPreview.shippingCost)}
                              </p>
                              <p className="mt-2 text-xs text-[#6e7379]">
                                Subtotal {formatCurrency(selectedOrderPreview.subtotal)} + envío{" "}
                                {formatCurrency(selectedOrderPreview.shippingCost)}
                              </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Transportadora actual
                              </p>
                              <p className="mt-2 text-sm font-semibold text-[#16384f]">
                                {selectedOrderPreview.carrier || "Por definir"}
                              </p>
                            </div>
                            <div className="rounded-[1.4rem] border border-black/8 bg-[#fafaf9] px-5 py-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                Guía actual
                              </p>
                              <p className="mt-2 text-sm font-semibold text-[#16384f]">
                                {selectedOrderPreview.trackingNumber || "Aún no asignada"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <AdminOrderProgress order={selectedOrderPreview} />
                        </div>

                        <div className="mt-6 grid gap-5 md:grid-cols-2">
                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Estado de envío</span>
                            <select
                              name="shippingStatus"
                              value={orderForm.shippingStatus}
                              onChange={handleOrderFieldChange}
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                            >
                              {shippingStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {getShippingStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Estado de pago</span>
                            <select
                              name="paymentStatus"
                              value={orderForm.paymentStatus}
                              onChange={handleOrderFieldChange}
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                            >
                              {paymentStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {getPaymentStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Transportadora</span>
                            <input
                              name="carrier"
                              value={orderForm.carrier}
                              onChange={handleOrderFieldChange}
                              placeholder="Ej. Coordinadora, Servientrega..."
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                            />
                          </label>

                          <label className="space-y-2">
                            <span className="text-sm font-medium text-[#4f545a]">Número de guía</span>
                            <input
                              name="trackingNumber"
                              value={orderForm.trackingNumber}
                              onChange={handleOrderFieldChange}
                              placeholder="Ej. 123456789"
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                            />
                          </label>

                          <label className="space-y-2 md:col-span-2">
                            <span className="text-sm font-medium text-[#4f545a]">Notas internas del envío</span>
                            <textarea
                              name="adminNotes"
                              value={orderForm.adminNotes}
                              onChange={handleOrderFieldChange}
                              rows={4}
                              placeholder="Ej. Sale hoy en la tarde, cliente pidió entregar en portería..."
                              className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                            />
                          </label>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
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

                      <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                          Productos del pedido
                        </h3>
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {selectedOrder.items.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-4"
                            >
                              <p className="text-sm font-semibold text-[#1f2328]">{item.name}</p>
                              <div className="mt-2 flex items-center justify-between text-sm text-[#6e7379]">
                                <span>Cantidad: {item.quantity}</span>
                                <span className="font-semibold text-[#16384f]">
                                  {formatCurrency(item.unitPrice)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/8 pt-4 text-sm">
                          <span className="text-[#6e7379]">
                            {selectedOrder.totalItems} producto{selectedOrder.totalItems === 1 ? "" : "s"} + envío{" "}
                            {formatCurrency(selectedOrder.shippingCost)}
                          </span>
                          <span className="text-lg font-semibold text-[var(--admin-accent)]">
                            {formatCurrency(selectedOrder.subtotal + selectedOrder.shippingCost)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "quotes" && (
            <div className="admin-fade-up space-y-8">
              <div className="grid gap-8 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Cotizaciones
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Solicitudes de evaluación técnica
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Estas solicitudes las envían los clientes desde el asistente &quot;Hablemos de tu proyecto&quot; del sitio.
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setQuoteStatusFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          quoteStatusFilter === "all"
                            ? "bg-[#16384f] text-white"
                            : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todas
                      </button>
                      {quoteStatuses.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setQuoteStatusFilter(status)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                            quoteStatusFilter === status
                              ? "bg-[#6366f1] text-white"
                              : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                          }`}
                        >
                          {getQuoteStatusLabel(status)}
                        </button>
                      ))}
                    </div>

                    <p className="mt-5 text-sm text-[#6e7379]">
                      Mostrando {filteredQuotes.length} solicitud{filteredQuotes.length === 1 ? "" : "es"}.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {isLoadingQuotes ? (
                      <div className="rounded-[1.5rem] border border-black/8 bg-white p-5 text-sm text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        Cargando cotizaciones...
                      </div>
                    ) : filteredQuotes.length === 0 ? (
                      <div className="rounded-[1.5rem] border border-dashed border-black/12 bg-white p-5 text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                        Aún no hay solicitudes que coincidan con los filtros actuales.
                      </div>
                    ) : (
                      filteredQuotes.map((quote) => (
                        <button
                          key={quote.id}
                          type="button"
                          onClick={() => setSelectedQuoteId(quote.id)}
                          className={`block w-full rounded-[1.4rem] border p-5 text-left shadow-[0_14px_28px_rgba(15,23,42,0.05)] transition-all duration-200 ${
                            selectedQuoteId === quote.id
                              ? "border-[#16384f] bg-[#16384f] text-white"
                              : "border-black/8 bg-white hover:-translate-y-0.5 hover:border-[#16384f]/18"
                          }`}
                        >
                          <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${selectedQuoteId === quote.id ? "text-white/72" : "text-[#8b8d91]"}`}>
                            {new Date(quote.createdAt).toLocaleDateString("es-CO")}
                          </p>
                          <p className="mt-2 text-lg font-semibold">{quote.company}</p>
                          <p className={`mt-2 text-sm ${selectedQuoteId === quote.id ? "text-white/78" : "text-[#5d6167]"}`}>
                            {quote.fullName} · {quote.requestType}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedQuoteId === quote.id ? "bg-white/14 text-white" : "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"}`}>
                              {getQuoteStatusLabel(quote.status)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </aside>

                <div className="space-y-8">
                  {!selectedQuote ? (
                    <div className="rounded-[1.75rem] border border-dashed border-black/12 bg-white p-8 text-center text-sm leading-7 text-[#6e7379] shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                      Selecciona una solicitud para ver el detalle completo.
                    </div>
                  ) : (
                    <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)] md:p-8">
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
                      </div>

                      <p className="mt-2 text-sm text-[#8b8d91]">
                        {selectedQuote.fullName} · {selectedQuote.requestType} ·{" "}
                        {new Date(selectedQuote.createdAt).toLocaleString("es-CO")}
                      </p>

                      <p className="mt-6 text-base leading-7 text-[#1f2328]">{selectedQuote.productDetails}</p>

                      {(selectedQuote.process.length > 0 || selectedQuote.conditions.length > 0) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedQuote.process.map((item) => (
                            <span key={item} className="rounded-full bg-[var(--admin-accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--admin-accent)]">
                              {item}
                            </span>
                          ))}
                          {selectedQuote.conditions.map((item) => (
                            <span key={item} className="rounded-full bg-[#fff1f1] px-3 py-1 text-xs font-semibold text-[#c53b3b]">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}

                      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t border-black/6 pt-5 text-sm">
                        <div className="flex items-baseline gap-1.5">
                          <dt className="font-semibold text-[#8b8d91]">NIT / Tel.</dt>
                          <dd className="font-semibold text-[#1f2328]">
                            {selectedQuote.nit || "—"} · {selectedQuote.phone || "—"}
                          </dd>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <dt className="font-semibold text-[#8b8d91]">Cantidad / entrega</dt>
                          <dd className="font-semibold text-[#1f2328]">{selectedQuote.quantityAndDeadline || "—"}</dd>
                        </div>
                      </dl>

                      {selectedQuote.details && Object.keys(selectedQuote.details).length > 0 && (
                        <details className="mt-5 border-t border-black/6 pt-5">
                          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.22em] text-[#8b8d91] hover:text-[var(--admin-accent)]">
                            Ver todos los campos del formulario
                          </summary>
                          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                            {Object.entries(selectedQuote.details)
                              .filter(([, value]) => value?.trim())
                              .map(([label, value]) => (
                                <div key={label}>
                                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                                    {label}
                                  </dt>
                                  <dd className="mt-0.5 text-sm font-semibold text-[#1f2328]">{value}</dd>
                                </div>
                              ))}
                          </dl>
                        </details>
                      )}

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
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && !isServiceAdmin && (
            <div className="admin-fade-up space-y-8">
              <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">
                <aside className="space-y-5">
                  <div className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_14px_28px_rgba(15,23,42,0.05)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                      Inventario
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#16384f]">
                      Control rápido
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#6e7379]">
                      Ajusta existencias sin abrir el editor completo y revisa los últimos movimientos del stock.
                    </p>
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
                        Buscar por nombre, marca o SKU
                      </span>
                      <input
                        type="search"
                        value={editSearch}
                        onChange={(event) => setEditSearch(event.target.value)}
                        placeholder="Ej: sello, Universal de Cauchos, CAUCHO001..."
                        className="w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                      />
                    </label>

                    <p className="mt-4 text-sm text-[#6e7379]">
                      Mostrando {filteredProducts.length} producto{filteredProducts.length === 1 ? "" : "s"} para control de stock.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setInventoryStatusFilter("all")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          inventoryStatusFilter === "all"
                            ? "bg-[#16384f] text-white"
                            : "border border-black/10 bg-[#fafaf9] text-[#5d6167] hover:bg-[#ececea]"
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryStatusFilter("low-stock")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          inventoryStatusFilter === "low-stock"
                            ? "bg-[var(--admin-accent)] text-white"
                            : "border border-[var(--admin-accent)]/20 bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] hover:bg-[#dbeafe]"
                        }`}
                      >
                        Solo stock bajo
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventoryStatusFilter("out-of-stock")}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                          inventoryStatusFilter === "out-of-stock"
                            ? "bg-[#c53b3b] text-white"
                            : "border border-[#c53b3b]/20 bg-[#fff1f1] text-[#c53b3b] hover:bg-[#ffe2e2]"
                        }`}
                      >
                        Solo agotados
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {filteredProducts.map((product) => {
                      const inventoryTone = getInventoryTone(product.estadoInventario);
                      const adjustmentValue = inventoryAdjustments[product.slug] || "";

                      return (
                        <article
                          key={`inventory-${product.slug}`}
                          className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#8b8d91]">
                                {product.categoria} · {product.marca}
                              </p>
                              <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#1f2328]">
                                {product.nombre}
                              </h3>
                              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                                <span className="rounded-full border border-black/8 bg-[#fafaf9] px-3 py-1 text-[#5d6167]">
                                  SKU: {product.sku || "Sin SKU"}
                                </span>
                                <span className={`rounded-full px-3 py-1 font-semibold ${inventoryTone.className}`}>
                                  {inventoryTone.label}
                                </span>
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[540px]">
                              <div className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Stock actual
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#16384f]">
                                  {product.stock ?? 0}
                                </p>
                              </div>

                              <div className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Stock mínimo
                                </p>
                                <p className="mt-2 text-2xl font-semibold text-[#16384f]">
                                  {product.stockMinimo ?? 0}
                                </p>
                              </div>

                              <div className="rounded-[1.1rem] border border-black/8 bg-[#fafaf9] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b8d91]">
                                  Ajuste rápido
                                </p>
                                <input
                                  type="number"
                                  value={adjustmentValue}
                                  onChange={(event) =>
                                    setInventoryAdjustments((current) => ({
                                      ...current,
                                      [product.slug]: event.target.value,
                                    }))
                                  }
                                  placeholder="+5 o -2"
                                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInventoryAdjust(
                                  product.slug,
                                  Number(adjustmentValue || 0),
                                )
                              }
                              className="inline-flex rounded-full bg-[#16384f] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#0f2a3b]"
                            >
                              Aplicar ajuste
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInventoryAdjust(
                                  product.slug,
                                  1,
                                  "Entrada rápida de una unidad",
                                )
                              }
                              className="inline-flex rounded-full border border-[#1f8b45]/20 bg-[#effaf2] px-5 py-3 text-sm font-semibold text-[#1f6b39] transition-colors duration-200 hover:bg-[#dcf5e4]"
                            >
                              +1 unidad
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickInventoryAdjust(
                                  product.slug,
                                  -1,
                                  "Salida rápida de una unidad",
                                )
                              }
                              className="inline-flex rounded-full border border-[var(--admin-accent)]/20 bg-[var(--admin-accent-soft)] px-5 py-3 text-sm font-semibold text-[var(--admin-accent)] transition-colors duration-200 hover:bg-[#dbeafe]"
                            >
                              -1 unidad
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product.slug)}
                              className="inline-flex rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                            >
                              Editar completo
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>

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
                                  {movement.productSku || "Sin SKU"} · {movement.type}
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
                <button
                  type="button"
                  onClick={() => void loadSiteImages()}
                  className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                >
                  Recargar
                </button>
              </div>

              {imageError && (
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {imageError}
                </p>
              )}

              <div className="mb-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#16384f] bg-[#16384f] px-4 py-2 text-sm font-semibold text-white">
                  {imageDivisionFilter}
                </span>
              </div>

              {isLoadingImages ? (
                <p className="text-sm text-[#6e7379]">Cargando imágenes...</p>
              ) : !selectedImageGroup ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from(
                    new Set(
                      IMAGE_SLOTS.filter(
                        (slot) => slot.division === imageDivisionFilter,
                      ).map((slot) => slot.group),
                    ),
                  ).map((group) => {
                    const groupSlots = IMAGE_SLOTS.filter(
                      (slot) => slot.group === group && slot.division === imageDivisionFilter,
                    );
                    const previewSrc = siteImages[groupSlots[0]?.key] ?? groupSlots[0]?.defaultSrc;

                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setSelectedImageGroup(group)}
                        className="flex items-center gap-4 overflow-hidden rounded-[1.2rem] border border-black/8 bg-white p-4 text-left shadow-sm transition-colors duration-200 hover:border-[var(--admin-accent)] hover:bg-[#f5f9ff]"
                      >
                        <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f0f2f4]">
                          {previewSrc && !isVideoUrl(previewSrc) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewSrc}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[#1f2328]">
                            {group}
                          </span>
                          <span className="mt-0.5 block text-xs font-semibold text-[#8b8d91]">
                            {groupSlots.length} {groupSlots.length === 1 ? "imagen" : "imágenes"}
                          </span>
                        </span>
                        <span aria-hidden="true" className="shrink-0 text-xl text-[#8b8d91]">
                          ›
                        </span>
                      </button>
                    );
                  })}
                </div>
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
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">
                      {selectedImageGroup}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {IMAGE_SLOTS.filter(
                        (slot) => slot.group === selectedImageGroup && slot.division === imageDivisionFilter,
                      ).map((slot) => {
                        const currentSrc = siteImages[slot.key] ?? slot.defaultSrc;
                        const isUploading = uploadingImageKey === slot.key;
                        const isSaved = savedImageKey === slot.key;
                        return (
                          <div
                            key={slot.key}
                            className="overflow-hidden rounded-[1.2rem] border border-black/8 bg-white shadow-sm"
                          >
                            <div
                              className="relative overflow-hidden bg-[#f0f2f4]"
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
                                  alt={slot.label}
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
                            </div>
                            <div className="p-3">
                              <p className="truncate text-xs font-semibold text-[#1f2328]">
                                {slot.label}
                              </p>
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
                              {(selectedImageGroup === "Ofertas" || selectedImageGroup === "Marcas destacadas") && (
                                <div className="mt-2">
                                  <label className="mb-1 block text-[10px] font-semibold text-[#8b8d91]">
                                    Enlace al hacer clic (opcional)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="/producto/nombre-del-producto"
                                    value={siteImageLinks[slot.key] ?? ""}
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
              )}
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
                    Títulos, párrafos y botones de la página. Los cambios se guardan al salir del campo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void loadSiteTexts()}
                  className="inline-flex rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                >
                  Recargar
                </button>
              </div>

              <div>
                {textsError && (
                  <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {textsError}
                  </p>
                )}

                {isLoadingTexts ? (
                  <p className="text-sm text-[#6e7379]">Cargando textos...</p>
                ) : !selectedTextGroup ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from(
                      new Set(
                        TEXT_SLOTS.filter(
                          (slot) => slot.division === adminDivision || slot.division === "Global",
                        ).map((slot) => slot.group),
                      ),
                    ).map((group) => {
                      const groupSlots = TEXT_SLOTS.filter(
                        (slot) =>
                          slot.group === group &&
                          (slot.division === adminDivision || slot.division === "Global"),
                      );

                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => setSelectedTextGroup(group)}
                          className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-black/8 bg-white p-4 text-left shadow-sm transition-colors duration-200 hover:border-[var(--admin-accent)] hover:bg-[#f5f9ff]"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-[#1f2328]">
                              {group}
                            </span>
                            <span className="mt-0.5 block text-xs font-semibold text-[#8b8d91]">
                              {groupSlots.length} {groupSlots.length === 1 ? "campo" : "campos"}
                            </span>
                          </span>
                          <span aria-hidden="true" className="shrink-0 text-xl text-[#8b8d91]">
                            ›
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => setSelectedTextGroup(null)}
                      className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--admin-accent)] hover:underline"
                    >
                      <span aria-hidden="true">‹</span> Volver a grupos
                    </button>
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#8b8d91]">
                      {selectedTextGroup}
                    </h4>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {TEXT_SLOTS.filter(
                        (slot) =>
                          slot.group === selectedTextGroup &&
                          (slot.division === adminDivision || slot.division === "Global"),
                      ).map((slot) => {
                        const value = siteTextsAdmin[slot.key] ?? slot.defaultValue;
                        const isSaving = savingTextKey === slot.key;
                        const isSaved = savedTextKey === slot.key;

                        return (
                          <div key={slot.key} className="rounded-[1.2rem] border border-black/8 bg-white p-4 shadow-sm">
                            <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#8b8d91]">
                              {slot.label}
                              {isSaving && <span className="normal-case text-[#8b8d91]">Guardando...</span>}
                              {isSaved && <span className="normal-case text-[#1f6b39]">✓ Guardado</span>}
                            </label>
                            {slot.multiline ? (
                              <textarea
                                defaultValue={value}
                                rows={3}
                                onBlur={(event) => {
                                  if (event.target.value !== value) void handleSaveText(slot.key, event.target.value);
                                }}
                                className="w-full rounded-lg border border-black/10 bg-[#fafaf9] px-3 py-2 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                              />
                            ) : (
                              <input
                                type="text"
                                defaultValue={value}
                                onBlur={(event) => {
                                  if (event.target.value !== value) void handleSaveText(slot.key, event.target.value);
                                }}
                                className="w-full rounded-lg border border-black/10 bg-[#fafaf9] px-3 py-2 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
                  Este número alimenta el botón flotante de WhatsApp visible en todo el sitio.
                  Cuando lo dejes vacío, el botón no se muestra.
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

          {activeTab === "accounts" && (
            <div className="admin-fade-up rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_16px_35px_rgba(15,23,42,0.05)] md:p-8">
              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8b8d91]">
                  Equipo
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#16384f]">
                  Cuentas del equipo
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e7379]">
                  Crea cuentas para tu equipo de {adminBrand.label} y elige qué herramientas del
                  panel puede usar cada una.
                </p>
              </div>

              {teamError && (
                <p className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {teamError}
                </p>
              )}

              <form
                onSubmit={handleCreateAccount}
                className="mb-10 rounded-[1.5rem] border border-black/8 bg-[#fafaf9] p-6"
              >
                <h3 className="text-sm font-semibold text-[#4f545a]">Nueva cuenta</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                      Nombre completo
                    </span>
                    <input
                      required
                      value={newAccountForm.fullName}
                      onChange={(event) =>
                        setNewAccountForm((current) => ({
                          ...current,
                          fullName: event.target.value,
                        }))
                      }
                      placeholder="Nombre y apellido"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                      Correo
                    </span>
                    <input
                      required
                      type="email"
                      value={newAccountForm.email}
                      onChange={(event) =>
                        setNewAccountForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      placeholder="correo@geu.com.co"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                      Contraseña
                    </span>
                    <input
                      required
                      type="password"
                      minLength={8}
                      value={newAccountForm.password}
                      onChange={(event) =>
                        setNewAccountForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[var(--admin-accent)]"
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b8d91]">
                    Herramientas habilitadas
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {assignableToolKeys.map((tool) => {
                      const checked = newAccountForm.permissions.includes(tool);
                      return (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => toggleNewAccountPermission(tool)}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
                            checked
                              ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
                              : "border-black/10 bg-white text-[#4f545a] hover:border-[var(--admin-accent)]"
                          }`}
                        >
                          {ADMIN_TOOL_LABELS[tool]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[#8b8d91]">
                    Marca "Cuentas" solo si esta persona también debe poder crear o editar otras
                    cuentas del equipo.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isCreatingAccount || newAccountForm.permissions.length === 0}
                  className="mt-6 inline-flex rounded-full bg-[var(--admin-accent)] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--admin-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreatingAccount ? "Creando..." : "Crear cuenta"}
                </button>
              </form>

              <h3 className="mb-4 text-sm font-semibold text-[#4f545a]">Cuentas existentes</h3>

              {isLoadingTeam ? (
                <p className="text-sm text-[#6e7379]">Cargando cuentas...</p>
              ) : teamAccounts.length === 0 ? (
                <div className="rounded-[1.2rem] border border-dashed border-black/12 bg-white px-4 py-5 text-sm text-[#6e7379]">
                  Todavía no has creado cuentas adicionales para tu equipo.
                </div>
              ) : (
                <div className="space-y-4">
                  {teamAccounts.map((account) => {
                    const isSaving = savingAccountId === account.id;
                    return (
                      <div
                        key={account.id}
                        className="rounded-[1.2rem] border border-black/8 bg-white p-5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[#1f2328]">
                              {account.fullName}
                            </p>
                            <p className="text-xs text-[#8b8d91]">{account.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                account.active
                                  ? "bg-[#effaf2] text-[#1f6b39]"
                                  : "bg-[#fff1f1] text-[#c53b3b]"
                              }`}
                            >
                              {account.active ? "Activa" : "Desactivada"}
                            </span>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => void handleToggleAccountActive(account)}
                              className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {account.active ? "Desactivar" : "Activar"}
                            </button>
                            <button
                              type="button"
                              disabled={isSaving}
                              onClick={() => void handleDeleteAccount(account)}
                              className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {assignableToolKeys.map((tool) => {
                            const checked = account.permissions.includes(tool);
                            return (
                              <button
                                key={tool}
                                type="button"
                                disabled={isSaving}
                                onClick={() => void handleToggleAccountPermission(account, tool)}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                                  checked
                                    ? "border-[var(--admin-accent)] bg-[var(--admin-accent)] text-white"
                                    : "border-black/10 bg-white text-[#4f545a] hover:border-[var(--admin-accent)]"
                                }`}
                              >
                                {ADMIN_TOOL_LABELS[tool]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
        </div>
      </div>
    </main>
  );
}
