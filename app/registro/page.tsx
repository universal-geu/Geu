"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { departamentosColombia, getCitiesForDepartment } from "@/lib/colombia-locations";
import CauchosHeader from "../components/cauchos-header";
import { DIVISION_BRAND, getDivisionFromBrandParam } from "@/lib/divisions";

type RegisterFormState = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  password: string;
  confirmPassword: string;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

const initialState: RegisterFormState = {
  fullName: "",
  company: "",
  email: "",
  phone: "",
  department: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  password: "",
  confirmPassword: "",
};

function PasswordVisibilityToggle({
  visible,
  onToggle,
}: {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 hover:text-[var(--brand-accent)]"
    >
      {visible ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
          <path d="M9.9 4.24A10.6 10.6 0 0 1 12 4c6.5 0 10 7 10 7a13.5 13.5 0 0 1-3.13 3.94M6.6 6.6C4.14 8.24 2 11 2 11s3.5 7 10 7c1.16 0 2.24-.18 3.24-.5" />
        </svg>
      )}
    </button>
  );
}

export default function RegistroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const division = getDivisionFromBrandParam(searchParams.get("brand"));
  const brand = DIVISION_BRAND[division];
  const loginHref = division === "Cauchos" ? "/login" : `/login?brand=${division.toLowerCase()}`;
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [inlineError, setInlineError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cityOptions = useMemo(
    () => getCitiesForDepartment(form.department),
    [form.department],
  );
  const fieldClass =
    "w-full rounded-[4px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-[var(--brand-accent)] focus:ring-2 focus:ring-[var(--brand-accent)]/12 disabled:bg-slate-100 disabled:text-slate-400";
  const labelClass = "mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700";

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = event.target;
    setForm((current) => {
      if (id === "department") {
        return { ...current, department: value, city: "" };
      }

      return { ...current, [id]: value };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError("");
    setToast(null);

    if (form.password !== form.confirmPassword) {
      const message = "Las contraseñas no coinciden.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...form, division }),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
    };

    setIsSubmitting(false);

    if (!response.ok) {
      const message = payload.error || "No fue posible crear la cuenta.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setForm(initialState);
    setInlineError("");
    setToast({
      tone: "success",
      message: payload.message || "Cuenta creada correctamente.",
    });

    const nextPath = searchParams.get("next") || "/mi-cuenta";
    window.setTimeout(() => {
      router.push(nextPath);
      router.refresh();
    }, 500);
  };

  return (
    <main
      className="min-h-screen bg-slate-100 text-slate-950"
      style={{ "--brand-accent": brand.accent, "--brand-accent-hover": brand.accentHover } as CSSProperties}
    >
      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div
            className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]"
                : "border-red-200 bg-red-50 text-red-600"
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

      <CauchosHeader division={division} />

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 lg:py-14">
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)] md:p-8 lg:p-10">
            <Link
              href={brand.basePath}
              className="text-xs font-black uppercase tracking-[0.12em] text-[var(--brand-accent)] transition-colors duration-200 hover:text-[#e4002b]"
            >
              Volver a {brand.label}
            </Link>

            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e4002b]">
                {brand.label}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-slate-950 md:text-4xl">
                Datos de cliente
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-500">
                Completa la información para agilizar cotizaciones, pedidos y entregas.
              </p>
            </div>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="fullName"
              className={labelClass}
            >
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="company"
              className={labelClass}
            >
              Empresa o taller
            </label>
            <input
              id="company"
              type="text"
              value={form.company}
              onChange={handleChange}
              placeholder="Nombre de tu negocio"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className={labelClass}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@correo.com"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className={labelClass}
            >
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Tu número"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className={labelClass}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                required
                className={`${fieldClass} pr-11`}
              />
              <PasswordVisibilityToggle
                visible={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className={labelClass}
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                className={`${fieldClass} pr-11`}
              />
              <PasswordVisibilityToggle
                visible={showConfirmPassword}
                onToggle={() => setShowConfirmPassword((current) => !current)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="department"
              className={labelClass}
            >
              Departamento
            </label>
            <select
              id="department"
              value={form.department}
              onChange={handleChange}
              required
              className={fieldClass}
            >
              <option value="">Selecciona un departamento</option>
              {departamentosColombia.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="city"
              className={labelClass}
            >
              Ciudad
            </label>
            <input
              id="city"
              type="text"
              value={form.city}
              onChange={handleChange}
              list="registro-cities"
              placeholder={
                form.department
                  ? "Busca o escribe tu ciudad"
                  : "Primero selecciona un departamento"
              }
              required
              disabled={!form.department}
              className={fieldClass}
            />
            <datalist id="registro-cities">
              {cityOptions.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine1"
              className={labelClass}
            >
              Dirección principal
            </label>
            <input
              id="addressLine1"
              type="text"
              value={form.addressLine1}
              onChange={handleChange}
              placeholder="Calle, carrera, barrio o punto de entrega"
              required
              className={fieldClass}
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="addressLine2"
              className={labelClass}
            >
              Complemento de dirección
            </label>
            <input
              id="addressLine2"
              type="text"
              value={form.addressLine2}
              onChange={handleChange}
              placeholder="Apto, interior, piso, bodega..."
              className={fieldClass}
            />
          </div>

          {inlineError && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 md:col-span-2">
              {inlineError}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[4px] bg-[var(--brand-accent)] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href={loginHref}
            className="font-black text-[var(--brand-accent)] transition-colors duration-200 hover:text-[#e4002b]"
          >
            Inicia sesión
          </Link>
        </p>
          </div>
        </div>
      </section>
    </main>
  );
}
