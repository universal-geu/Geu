"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { departamentosColombia, getCitiesForDepartment } from "@/lib/colombia-locations";
import CauchosCartLink from "../components/cauchos-cart-link";

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

const menuItems = [
  "Laminas y rollos",
  "Sellos y empaques",
  "Mangueras",
  "Pisos industriales",
  "Piezas tecnicas",
  "Fabricacion especial",
];

export default function RegistroPage() {
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [inlineError, setInlineError] = useState("");

  const cityOptions = useMemo(
    () => getCitiesForDepartment(form.department),
    [form.department],
  );
  const fieldClass =
    "w-full rounded-[4px] border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-[#075ed8] focus:ring-2 focus:ring-[#075ed8]/12 disabled:bg-slate-100 disabled:text-slate-400";
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
      body: JSON.stringify(form),
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
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div
            className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]"
                : "border-[#ed8435]/18 bg-[#fff6ee] text-[#b85d12]"
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

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
            <div className="hidden gap-3 md:flex">
              <span>Servicio al cliente 320 88 999 33</span>
              <span className="text-slate-300">|</span>
              <span>Ventas empresariales</span>
              <span className="text-slate-300">|</span>
              <span>Centro de ayuda</span>
            </div>
            <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
              <Link href="/cauchos#contacto" className="hover:text-[#075ed8]">Cotizaciones</Link>
              <Link href="/cauchos#productos" className="hover:text-[#075ed8]">Catalogos</Link>
              <Link href="/quienes-somos" className="hover:text-[#075ed8]">GEU empresas</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[260px_1fr_auto] md:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo-universal-cauchos.png"
              alt="GEU Universal de Cauchos"
              width={2518}
              height={420}
              priority
              className="h-auto object-contain"
              style={{ width: "260px", maxWidth: "100%" }}
            />
          </Link>

          <form className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
            <input
              aria-label="Buscar productos de caucho"
              className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar laminas, sellos, mangueras, empaques..."
            />
            <button
              type="button"
              className="flex w-14 items-center justify-center border-l border-slate-200 text-xl text-slate-800"
              aria-label="Buscar"
            >
              ⌕
            </button>
          </form>

          <div className="flex items-center justify-between gap-5 text-sm text-slate-700 md:justify-end">
            <CauchosCartLink />
            <Link href="/login?next=/mi-cuenta" className="font-bold hover:text-[#075ed8]">Mi cuenta</Link>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1500px] px-5 md:px-8">
            <nav className="flex min-h-14 items-stretch justify-between gap-2 overflow-x-auto text-[11px] font-black uppercase tracking-[0.02em] text-slate-800">
              {menuItems.map((item, index) => (
                <Link
                  key={item}
                  href={index < 6 ? "/cauchos#catalogo-cauchos" : "/cauchos#contacto"}
                  className="flex min-w-max items-center border-b-2 border-transparent px-3 text-center hover:border-[#075ed8] hover:text-[#075ed8]"
                >
                  {item}
                </Link>
              ))}
          </nav>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-10 md:px-8 lg:py-14">
          <div className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(15,23,42,0.1)] md:p-8 lg:p-10">
            <Link
              href="/cauchos"
              className="text-xs font-black uppercase tracking-[0.12em] text-[#075ed8] transition-colors duration-200 hover:text-[#e4002b]"
            >
              Volver a Universal de Cauchos
            </Link>

            <div className="mt-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#e4002b]">
                Universal de Cauchos
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
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              required
              className={fieldClass}
            />
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

          <div>
            <label
              htmlFor="confirmPassword"
              className={labelClass}
            >
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              required
              className={fieldClass}
            />
          </div>

          {inlineError && (
            <p className="rounded-xl border border-[#ed8435]/20 bg-[#fff6ee] px-4 py-3 text-sm font-medium text-[#b85d12] md:col-span-2">
              {inlineError}
            </p>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[4px] bg-[#075ed8] px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#064fb7] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="font-black text-[#075ed8] transition-colors duration-200 hover:text-[#e4002b]"
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
