"use client";

import { useState } from "react";

const OTHER_CITY = "__otra__";

// Lista desplegable de ciudades del departamento elegido. En celular el
// <datalist> anterior solo mostraba sugerencias sobre el teclado; un <select>
// abre la lista nativa. Como la lista solo trae las ciudades principales de
// cada departamento, "Otra ciudad…" deja escribirla a mano.
// Usar con key={departamento} para que el modo "otra" se reinicie al cambiar
// de departamento.
export default function CitySelect({
  id,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  className = "",
}: {
  id?: string;
  value: string;
  onChange: (city: string) => void;
  options: readonly string[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
}) {
  const [otherMode, setOtherMode] = useState(false);
  const isOther = otherMode || (value !== "" && !options.includes(value));

  return (
    <>
      <select
        id={id}
        value={isOther ? OTHER_CITY : value}
        onChange={(event) => {
          const next = event.target.value;
          if (next === OTHER_CITY) {
            setOtherMode(true);
            onChange("");
            return;
          }
          setOtherMode(false);
          onChange(next);
        }}
        disabled={disabled}
        required={required}
        className={`bg-white ${className}`}
      >
        <option value="">{disabled ? "Primero selecciona un departamento" : "Selecciona tu ciudad"}</option>
        {options.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
        <option value={OTHER_CITY}>Otra ciudad…</option>
      </select>
      {isOther && !disabled && (
        <input
          id={id ? `${id}-otra` : undefined}
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          autoFocus={otherMode}
          placeholder="Escribe tu ciudad"
          aria-label="Escribe tu ciudad"
          className={`mt-2 ${className}`}
        />
      )}
    </>
  );
}
