"use client";

import { useEffect, useState, type FormEvent } from "react";

export default function AccessGate() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(data?.error ?? "No fue posible validar la contraseña.");
        setLoading(false);
        return;
      }

      // Navegación completa para que el proxy vea la cookie recién creada.
      window.location.href = "/";
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Candado semitransparente, esquina inferior derecha */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Acceso privado"
        className="fixed bottom-3 right-3 z-10 rounded-full p-3 text-white/15 transition hover:text-white/50 focus:text-white/50 focus:outline-none"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(event) => event.stopPropagation()}
            onSubmit={handleSubmit}
            className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-white/10 bg-[#0c1530] p-6 shadow-2xl"
          >
            <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
              Acceso privado
            </p>
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Contraseña"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-center text-lg tracking-[0.3em] text-white placeholder:tracking-normal placeholder:text-white/40 focus:border-[#2f6bff] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || code.trim().length === 0}
              className="w-full rounded-lg bg-[#2f6bff] px-4 py-3 font-semibold text-white transition hover:bg-[#1f56e0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Validando…" : "Entrar"}
            </button>
            {error ? (
              <p className="text-center text-sm text-red-300">{error}</p>
            ) : null}
          </form>
        </div>
      ) : null}
    </>
  );
}
