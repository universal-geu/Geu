"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const ACCENT = "#075ed8";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(payload.error || "No fue posible enviar el enlace.");
        return;
      }

      setMessage(payload.message || "Revisa tu correo.");
    } catch {
      setError("No fue posible enviar el enlace. Revisa tu conexión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center px-6 py-16"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.58), rgba(255,255,255,0.58)), url('/geu-home-texture.jpg')",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <section className="w-full max-w-md rounded-[10px] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <Link href="/login" className="text-sm font-semibold uppercase tracking-wide text-[#16384f]">
          Volver a iniciar sesión
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            GEU
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#16384f]">¿Olvidaste tu contraseña?</h1>
          <p className="mt-3 text-sm text-slate-600">
            Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva. Si compraste
            antes sin crear contraseña, también sirve para activar tu cuenta.
          </p>
        </div>

        {message ? (
          <p className="mt-8 rounded-xl border border-[#1f8b45]/20 bg-[#effaf2] px-4 py-3 text-sm font-medium text-[#1f6b39]">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-[#075ed8]"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-[#075ed8]/20 bg-[#075ed8]/[0.08] px-4 py-3 text-sm font-medium text-[#075ed8]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#075ed8] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#064bb0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Enviando..." : "Enviar enlace"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
