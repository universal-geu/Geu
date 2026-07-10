"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  className?: string;
  basePath?: string;
  placeholder?: string;
};

export default function CauchosSearchForm({
  className,
  basePath = "/cauchos",
  placeholder = "Buscar laminas, sellos, mangueras, empaques...",
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        const query = value.trim();
        router.push(query ? `${basePath}/buscar?q=${encodeURIComponent(query)}` : basePath);
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Buscar productos"
        className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="flex w-14 items-center justify-center border-l border-slate-200 text-xl text-slate-800"
        aria-label="Buscar"
      >
        ⌕
      </button>
    </form>
  );
}
