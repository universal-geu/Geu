"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  label: string;
  name: string;
  value: string[];
  options: string[];
  placeholder?: string;
  /** What to call a new entry in the "+ Crear ___" prompt, e.g. "categoría". */
  entityName?: string;
  /** When true, locks the field to `options` only — no free-text typing, no "+ Crear" entry. */
  strict?: boolean;
  onChange: (value: string[]) => void;
};

const normalize = (value: string) => value.trim().toLowerCase();

export default function MultiCategoryComboBox({
  label,
  name,
  value,
  options,
  placeholder,
  entityName = "opción",
  strict = false,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
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

  const normalizedSearch = normalize(search);
  const selectedKeys = useMemo(() => new Set(value.map(normalize)), [value]);

  const filteredOptions = useMemo(
    () =>
      normalizedSearch.length === 0
        ? options
        : options.filter((option) => option.toLowerCase().includes(normalizedSearch)),
    [options, normalizedSearch],
  );

  const canCreate =
    !strict &&
    search.trim().length > 0 &&
    !options.some((option) => normalize(option) === normalizedSearch) &&
    !selectedKeys.has(normalizedSearch);

  const toggle = (option: string) => {
    onChange(
      selectedKeys.has(normalize(option))
        ? value.filter((item) => normalize(item) !== normalize(option))
        : [...value, option],
    );
  };

  const remove = (option: string) => {
    onChange(value.filter((item) => normalize(item) !== normalize(option)));
  };

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <span className="text-sm font-medium text-[#4f545a]">{label}</span>
      <div
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="flex min-h-[3rem] w-full flex-wrap items-center gap-1.5 rounded-2xl border border-black/10 bg-[#fafaf9] px-3 py-2 text-sm text-[#1f2328] transition-colors duration-200 focus-within:border-[#075ed8]"
      >
        {value.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-semibold text-[#075ed8]"
          >
            {item}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                remove(item);
              }}
              className="text-[#075ed8]/70 transition-colors hover:text-[#075ed8]"
              aria-label={`Quitar ${item}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          name={name}
          value={search}
          onChange={(event) => {
            if (strict) return;
            setSearch(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && canCreate) {
              event.preventDefault();
              onChange([...value, search.trim()]);
              setSearch("");
            }
            if (event.key === "Backspace" && search.length === 0 && value.length > 0) {
              remove(value[value.length - 1]);
            }
          }}
          onFocus={() => setOpen(true)}
          readOnly={strict}
          placeholder={value.length === 0 ? placeholder : ""}
          autoComplete="off"
          className={`min-w-[6rem] flex-1 bg-transparent py-1 outline-none ${
            strict ? "cursor-pointer" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
          {filteredOptions.map((option) => {
            const checked = selectedKeys.has(normalize(option));
            return (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  toggle(option);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-[#f2f4f7] ${
                  checked ? "font-semibold text-[#075ed8]" : "text-[#1f2328]"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                    checked
                      ? "border-[#075ed8] bg-[#075ed8] text-white"
                      : "border-black/25 bg-white"
                  }`}
                >
                  {checked ? "✓" : ""}
                </span>
                {option}
              </button>
            );
          })}

          {filteredOptions.length === 0 && !canCreate && (
            <p className="px-3 py-2 text-sm text-[#9aa0a6]">
              {strict
                ? "Sin opciones"
                : `Escribe para crear una ${entityName} nueva`}
            </p>
          )}

          {canCreate && (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange([...value, search.trim()]);
                setSearch("");
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              className="mt-0.5 block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#075ed8] hover:bg-[#f2f4f7]"
            >
              + Crear {entityName} &quot;{search.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
