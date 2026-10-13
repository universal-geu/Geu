"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import PasswordVisibilityToggle from "../components/password-visibility-toggle";

const ACCENT = "#075ed8";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(token ? "" : "El enlace no es válido. Pide uno nuevo.");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(payload.error || "No fue posible actualizar la contraseña.");
        setIsSubmitting(false);
        return;
      }

      // Signed in by the API; a full navigation picks up the new session everywhere.
      window.location.href = "/mi-cuenta";
    } catch {
      setError("No fue posible actualizar la contraseña. Revisa tu conexión.");
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-11 text-slate-950 outline-none transition-colors duration-200 placeholder:text-slate-500 focus:border-[#075ed8]";

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
          <h1 className="mt-2 text-3xl font-bold text-[#16384f]">Crea una nueva contraseña</h1>
          <p className="mt-3 text-sm text-slate-600">Usa al menos 8 caracteres.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                disabled={!token}
                className={inputClass}
              />
              <PasswordVisibilityToggle
                visible={showPassword}
                onToggle={() => setShowPassword((current) => !current)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
              Confirma la contraseña
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              disabled={!token}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-[#075ed8]/20 bg-[#075ed8]/[0.08] px-4 py-3 text-sm font-medium text-[#075ed8]">
              <p>{error}</p>
              {error.includes("nuevo") && (
                <Link href="/olvide-contrasena" className="mt-1 inline-block font-semibold underline">
                  Pedir un enlace nuevo
                </Link>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full rounded-xl bg-[#075ed8] px-4 py-3 font-semibold text-white transition-colors duration-200 hover:bg-[#064bb0] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </section>
    </main>
  );
}
