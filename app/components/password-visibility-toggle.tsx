"use client";

// Botón del ojito para mostrar u ocultar una contraseña. Va dentro de un
// contenedor `relative` junto al input, que debe tener `pr-11`.
export default function PasswordVisibilityToggle({
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
