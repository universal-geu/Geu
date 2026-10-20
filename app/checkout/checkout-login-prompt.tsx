"use client";

import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordVisibilityToggle from "../components/password-visibility-toggle";
import { DIVISION_BRAND, type DivisionName } from "@/lib/divisions";
import { syncGuestCartAfterLogin } from "@/lib/guest-cart-sync";

// Remembered per tab, so choosing "continuar sin iniciar sesión" isn't asked
// again on every reload of the checkout.
const DISMISSED_KEY = "geu-checkout-login-prompt-dismissed";

/**
 * Shown when a shopper without a session reaches the checkout: sign in
 * right here (the guest cart moves onto the account) or keep going as a guest.
 */
export default function CheckoutLoginPrompt({
  division,
  brand,
}: {
  division: DivisionName;
  brand?: string;
}) {
  const router = useRouter();
  const { accent, accentHover } = DIVISION_BRAND[division];
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const continueAsGuest = useCallback(() => {
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Storage unavailable: closing is enough for this visit.
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Storage unavailable: just ask.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") continueAsGuest();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, continueAsGuest]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as {
        error?: string;
        user?: { id: string };
      };

      if (!response.ok || !payload.user) {
        setError(payload.error || "No fue posible iniciar sesión.");
        setIsSubmitting(false);
        return;
      }

      // Move the guest cart first: the checkout reloads from the account's cart.
      await syncGuestCartAfterLogin(payload.user.id);
      router.refresh();
    } catch {
      setError("No fue posible iniciar sesión.");
      setIsSubmitting(false);
    }
  }

  if (!open) return null;

  const checkoutPath = brand ? `/checkout?brand=${brand}` : "/checkout";
  const registerHref = `/registro?next=${encodeURIComponent(checkoutPath)}${brand ? `&brand=${brand}` : ""}`;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 py-6"
      style={{ "--brand-accent": accent, "--brand-accent-hover": accentHover } as CSSProperties}
      onClick={(event) => {
        if (event.target === event.currentTarget) continueAsGuest();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-login-title"
        className="relative max-h-full w-full max-w-md overflow-y-auto rounded-[14px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.25)] sm:p-8"
      >
        <button
          type="button"
          onClick={continueAsGuest}
          aria-label="Cerrar"
          className="absolute right-4 top-4 text-2xl leading-none text-slate-400 transition-colors duration-200 hover:text-slate-900"
        >
          ×
        </button>

        <h2 id="checkout-login-title" className="text-xl font-bold text-slate-950">
          Inicia sesión
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Usa tus datos guardados y sigue tus pedidos desde tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="checkout-login-email" className="mb-2 block text-sm font-medium text-slate-700">
              Correo
            </label>
            <input
              id="checkout-login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ingresa tu correo"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-colors duration-200 focus:border-[var(--brand-accent)]"
            />
          </div>

          <div>
            <label htmlFor="checkout-login-password" className="mb-2 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="checkout-login-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-slate-900 outline-none transition-colors duration-200 focus:border-[var(--brand-accent)]"
              />
              <PasswordVisibilityToggle
                visible={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
              />
            </div>
          </div>

          <Link
            href="/olvide-contrasena"
            className="inline-block text-sm font-semibold text-[var(--brand-accent)] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-[var(--brand-accent)] px-5 py-3.5 text-base font-semibold text-white transition-colors duration-200 hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <Link
            href={registerHref}
            className="flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3.5 text-base font-semibold text-slate-900 transition-colors duration-200 hover:border-slate-900"
          >
            Crear una cuenta
          </Link>
        </form>

        <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />o<span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full text-center text-sm font-medium text-slate-700 underline underline-offset-4 transition-colors duration-200 hover:text-slate-950"
        >
          Continuar sin iniciar sesión
        </button>
      </div>
    </div>
  );
}
