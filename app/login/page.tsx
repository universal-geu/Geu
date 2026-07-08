"use client";

import { useEffect, useState, type CSSProperties, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CauchosCartLink from "../components/cauchos-cart-link";

type LoginFormState = {
  email: string;
  password: string;
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

const GUEST_CART_STORAGE_KEY = "geu-cart";
const GUEST_CART_SYNC_KEY = "geu-cart-synced-user";

const initialState: LoginFormState = {
  email: "",
  password: "",
};

async function syncGuestCartAfterLogin(userId: string) {
  if (typeof window === "undefined") return;

  const storedCart = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!storedCart) {
    window.sessionStorage.setItem(`${GUEST_CART_SYNC_KEY}:${userId}`, "done");
    return;
  }

  try {
    const items = JSON.parse(storedCart);

    if (!Array.isArray(items) || items.length === 0) {
      window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      window.sessionStorage.setItem(`${GUEST_CART_SYNC_KEY}:${userId}`, "done");
      return;
    }

    const response = await fetch("/api/cart/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      return;
    }

    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    window.sessionStorage.setItem(`${GUEST_CART_SYNC_KEY}:${userId}`, "done");
  } catch {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isImportLogin = searchParams.get("brand") === "import";
  const accent = isImportLogin ? "#e31313" : "#075ed8";
  const accentHover = isImportLogin ? "#ba1010" : "#064bb0";
  const brandName = isImportLogin ? "GEU Import" : "GEU";
  const [form, setForm] = useState<LoginFormState>(initialState);
  const [adminPin, setAdminPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMasterSubmitting, setIsMasterSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [inlineError, setInlineError] = useState("");
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pendingAdminUserId, setPendingAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    setForm((current) => ({ ...current, [id]: value }));
  };

  const completeLogin = async (payload: {
    message?: string;
    user?: { id: string; role: "CUSTOMER" | "ADMIN" };
  }) => {
    setForm(initialState);
    setAdminPin("");
    setShowAdminPinModal(false);
    setPendingAdminUserId(null);
    setInlineError("");
    setToast({
      tone: "success",
      message: payload.message || "Inicio de sesión correcto.",
    });

    const requestedPath = searchParams.get("next");
    const userId = payload.user?.id;
    const nextPath =
      payload.user?.role === "ADMIN"
        ? isImportLogin
          ? "/admin?brand=import"
          : "/admin"
        : requestedPath === "/admin"
          ? "/mi-cuenta"
          : requestedPath || "/mi-cuenta";

    window.setTimeout(async () => {
      if (userId) {
        await syncGuestCartAfterLogin(userId);
      }
      router.push(nextPath);
      router.refresh();
    }, 500);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError("");
    setToast(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      user?: { id: string; role: "CUSTOMER" | "ADMIN" };
      requiresAdminPin?: boolean;
    };

    setIsSubmitting(false);

    if (response.status === 202 && payload.requiresAdminPin && payload.user?.role === "ADMIN") {
      setPendingAdminUserId(payload.user.id);
      setShowAdminPinModal(true);
      setToast({
        tone: "success",
        message: payload.message || "Confirma el PIN de administrador para continuar.",
      });
      return;
    }

    if (!response.ok) {
      const message = payload.error || "No fue posible iniciar sesión.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    await completeLogin(payload);
  };

  const handleAdminPinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInlineError("");
    setToast(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        adminPin,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      user?: { id: string; role: "CUSTOMER" | "ADMIN" };
    };

    setIsSubmitting(false);

    if (!response.ok) {
      const message = payload.error || "No fue posible validar el PIN.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    await completeLogin(payload);
  };

  const handleMasterLogin = async () => {
    setInlineError("");
    setToast(null);
    setIsMasterSubmitting(true);

    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@geu.com.co",
        password: "123456789",
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      message?: string;
      user?: { id: string; role: "CUSTOMER" | "ADMIN" };
    };

    setIsMasterSubmitting(false);

    if (!response.ok) {
      const message = payload.error || "No fue posible iniciar como usuario maestro.";
      setInlineError(message);
      setToast({ tone: "error", message });
      return;
    }

    setToast({
      tone: "success",
      message: payload.message || "Acceso maestro correcto.",
    });

    window.setTimeout(() => {
      router.push(isImportLogin ? "/admin?brand=import" : "/admin");
      router.refresh();
    }, 350);
  };

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center px-6 ${isImportLogin ? "pb-16 pt-44" : "py-16"}`}
      style={{
        backgroundImage:
          isImportLogin
            ? "linear-gradient(rgba(255,255,255,0.76), rgba(255,255,255,0.76)), url('/geu-import-main-banner.png')"
            : "linear-gradient(rgba(255,255,255,0.58), rgba(255,255,255,0.58)), url('/geu-home-texture.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      {isImportLogin && (
        <header className="absolute inset-x-0 top-0 z-20 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
              <div className="hidden gap-3 md:flex">
                <span>Servicio al cliente 320 88 999 33</span>
                <span className="text-slate-300">|</span>
                <span>Importaciones empresariales</span>
                <span className="text-slate-300">|</span>
                <span>Centro de ayuda</span>
              </div>
              <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
                <Link href="/import#contacto" className="hover:text-[#e31313]">Cotizaciones</Link>
                <Link href="/import#productos" className="hover:text-[#e31313]">Catalogos</Link>
                <Link href="/quienes-somos" className="hover:text-[#e31313]">GEU empresas</Link>
              </div>
            </div>
          </div>

          <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[300px_1fr_auto] md:px-8">
            <Link href="/import" className="inline-flex items-center gap-2 font-[family:var(--font-display)] text-3xl font-black tracking-[0.08em] text-slate-950">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#e31313] text-xs text-[#e31313]">
                GE
              </span>
              GEU
              <span className="text-[#e31313]">Import</span>
            </Link>

            <form className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
              <input
                aria-label="Buscar productos importados"
                className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Buscar luces, motores, mecanizados, referencias..."
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
              <CauchosCartLink accent="red" />
              <Link href="/login?next=/mi-cuenta&brand=import" className="font-bold text-[#e31313]">
                Mi cuenta
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-[1500px] px-5 md:px-8">
              <nav className="flex min-h-14 items-stretch justify-between gap-2 overflow-x-auto text-[11px] font-black uppercase tracking-[0.02em] text-slate-800">
                {[
                  "Luces y direccionales",
                  "Motores",
                  "Mecanizados",
                  "Inyeccion y extrusion",
                  "Linea electrica",
                  "Busqueda global",
                  "Logistica",
                  "Rastreo",
                ].map((item, index) => (
                  <Link
                    key={item}
                    href={index < 6 ? "/import#catalogo-import" : index === 7 ? "/import#rastreo" : "/import#contacto"}
                    className="flex min-w-max items-center border-b-2 border-transparent px-3 text-center hover:border-[#e31313] hover:text-[#e31313]"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>
      )}

      {showAdminPinModal && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0f172a]/45 px-6 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-[1.8rem] border border-black/8 bg-white p-7 shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
            <p
              className="text-sm font-semibold uppercase tracking-[0.2em]"
              style={{ color: accent }}
            >
              Validación extra
            </p>
            <h2 className="mt-3 text-2xl font-bold text-[#16384f]">
              Ingresa el PIN de administrador
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Detectamos una cuenta administrativa. Para entrar al panel, confirma el código adicional.
            </p>

            <form onSubmit={handleAdminPinSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="adminPinModal"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  PIN extra
                </label>
                <input
                  id="adminPinModal"
                  type="password"
                  value={adminPin}
                  onChange={(event) => setAdminPin(event.target.value)}
                  placeholder="Ingresa el código"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-200 placeholder:text-slate-500"
                  style={{ "--tw-ring-color": accent } as CSSProperties}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = accent;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "";
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminPinModal(false);
                    setAdminPin("");
                    setPendingAdminUserId(null);
                  }}
                  className="flex-1 rounded-xl border border-[#16384f]/20 px-4 py-3 font-semibold text-[#16384f] transition-colors duration-200 hover:bg-[#16384f] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !pendingAdminUserId}
                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ backgroundColor: accent }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = accentHover;
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = accent;
                  }}
                >
                  {isSubmitting ? "Validando..." : "Confirmar PIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed right-5 top-5 z-[80] w-[min(92vw,380px)]">
          <div
            className={`rounded-[1.4rem] border px-5 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
              toast.tone === "success"
                ? "border-[#1f8b45]/18 bg-[#effaf2] text-[#1f6b39]"
                : isImportLogin
                  ? "border-[#e31313]/18 bg-[#fff0f0] text-[#e31313]"
                  : "border-[#075ed8]/18 bg-[#eef5ff] text-[#075ed8]"
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

      <section className={`w-full max-w-md rounded-[10px] border bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ${isImportLogin ? "border-[#f0caca]" : "border-slate-200"}`}>
        <Link
          href={isImportLogin ? "/import" : "/"}
          className="text-sm font-semibold uppercase tracking-wide transition-colors duration-200"
          style={{ color: isImportLogin ? "#6f1d1d" : "#16384f" }}
        >
          {isImportLogin ? "Volver a GEU Import" : "Volver al inicio"}
        </Link>

        <div className="mt-6">
          <p
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {brandName}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#16384f]">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {isImportLogin
              ? "Ingresa para consultar tus compras, cotizaciones, importaciones y el estado de tus pedidos de GEU Import."
              : "Ingresa con los mismos datos que usaste para crear tu cuenta. Si tu cuenta tiene permisos de administración, entrarás al panel automáticamente."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-200 placeholder:text-slate-500"
              onFocus={(event) => {
                event.currentTarget.style.borderColor = accent;
              }}
              onBlur={(event) => {
                event.currentTarget.style.borderColor = "";
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-200 placeholder:text-slate-500"
              onFocus={(event) => {
                event.currentTarget.style.borderColor = accent;
              }}
              onBlur={(event) => {
                event.currentTarget.style.borderColor = "";
              }}
            />
          </div>

          {inlineError && (
            <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${isImportLogin ? "border-[#e31313]/20 bg-[#fff0f0] text-[#e31313]" : "border-[#075ed8]/20 bg-[#eef5ff] text-[#075ed8]"}`}>
              {inlineError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isMasterSubmitting}
            className="w-full rounded-xl px-4 py-3 font-semibold text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70"
            style={{ backgroundColor: accent }}
            onMouseEnter={(event) => {
              event.currentTarget.style.backgroundColor = accentHover;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.backgroundColor = accent;
            }}
          >
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void handleMasterLogin()}
          disabled={isSubmitting || isMasterSubmitting}
          className="mt-3 w-full rounded-xl border bg-white px-4 py-3 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70"
          style={{
            borderColor: accent,
            color: accent,
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = accent;
            event.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = "#ffffff";
            event.currentTarget.style.color = accent;
          }}
        >
          {isMasterSubmitting ? "Entrando al panel..." : "Iniciar como usuario maestro"}
        </button>

        <p className="mt-6 text-sm text-slate-600">
          ¿Aún no tienes una cuenta?{" "}
          <Link
            href={isImportLogin ? "/registro?brand=import" : "/registro"}
            className="font-semibold transition-colors duration-200"
            style={{ color: isImportLogin ? "#e31313" : "#16384f" }}
          >
            Regístrate
          </Link>
        </p>
      </section>
    </main>
  );
}
