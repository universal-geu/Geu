"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  label: string;
  name: string;
  value: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
  /** What to call a new entry in the "+ Crear nueva ___" prompt, e.g. "categoría". */
  entityName?: string;
  /** When true, locks the field to `options` only — no free-text typing, no "+ Crear" entry. */
  strict?: boolean;
  onChange: (value: string) => void;
};

export default function CategoryComboBox({
  label,
  name,
  value,
  options,
  placeholder,
  required,
  entityName = "opción",
  strict = false,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  // Tracks what the user has typed since the dropdown opened, separate from
  // the field's actual value, so focusing a pre-filled field shows the full
  // option list instead of only entries matching the existing value.
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedValue = value.trim().toLowerCase();
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = useMemo(
    () =>
      normalizedSearch.length === 0
        ? options
        : options.filter((option) => option.toLowerCase().includes(normalizedSearch)),
    [options, normalizedSearch],
  );
  const hasExactMatch = options.some((option) => option.toLowerCase() === normalizedValue);
  // While the user is actively typing a value that doesn't match anything yet,
  // confirm exactly what will be created. Otherwise (idle, or an existing
  // option is selected) keep a generic prompt visible so creating a new entry
  // is always reachable, not just when the field happens to be empty.
  const isTypingNewValue = search.trim().length > 0 && !hasExactMatch;

  return (
    <label className="relative space-y-2" ref={containerRef}>
      <span className="text-sm font-medium text-[#4f545a]">{label}</span>
      <input
        ref={inputRef}
        name={name}
        value={value}
        onChange={(event) => {
          if (strict) return;
          onChange(event.target.value);
          setSearch(event.target.value);
        }}
        onFocus={() => {
          setSearch("");
          setOpen(true);
        }}
        readOnly={strict}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        className={`w-full rounded-2xl border border-black/10 bg-[#fafaf9] px-4 py-3 text-sm text-[#1f2328] outline-none transition-colors duration-200 focus:border-[#075ed8] ${
          strict ? "cursor-pointer" : ""
        }`}
      />
      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(option);
                setOpen(false);
              }}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[#f2f4f7] ${
                option.toLowerCase() === normalizedValue
                  ? "bg-[#eef4ff] font-semibold text-[#075ed8]"
                  : "text-[#1f2328]"
              }`}
            >
              {option}
            </button>
          ))}
          {!strict &&
            (isTypingNewValue ? (
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setOpen(false);
                }}
                className="mt-0.5 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#075ed8] hover:bg-[#f2f4f7]"
              >
                + Crear &quot;{search.trim()}&quot;
              </button>
            ) : (
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange("");
                  setSearch("");
                  requestAnimationFrame(() => inputRef.current?.focus());
                }}
                className="mt-0.5 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#075ed8] hover:bg-[#f2f4f7]"
              >
                + Crear nueva {entityName}
              </button>
            ))}
        </div>
      )}
    </label>
  );
}
