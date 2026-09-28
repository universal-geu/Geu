"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AccountUser = {
  fullName: string;
  role: "CUSTOMER" | "ADMIN";
};

type Props = {
  className?: string;
  brand?: string;
  // Color del círculo con la inicial cuando hay sesión iniciada.
  accent?: string;
};

export default function CauchosAccountLink({ className, brand, accent = "#0f172a" }: Props) {
  const [user, setUser] = useState<AccountUser | null>(null);
  const brandQuery = brand ? `?brand=${brand}` : "";

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const response = await fetch("/api/account");
      if (!response.ok) return;

      const payload = (await response.json()) as { user?: AccountUser };
      if (!cancelled && payload.user) {
        setUser(payload.user);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (user) {
    const firstName = user.fullName.trim().split(/\s+/)[0] || "Mi cuenta";
    const initial = firstName.charAt(0).toUpperCase();

    return (
      <Link
        href={user.role === "ADMIN" ? `/admin${brandQuery}` : `/mi-cuenta${brandQuery}`}
        className={`${className ?? ""} items-center gap-2`}
        title="Mi cuenta"
      >
        <span
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        >
          {initial}
        </span>
        <span className="max-w-[9rem] truncate">Hola, {firstName}</span>
      </Link>
    );
  }

  return (
    <Link href={`/login?next=/mi-cuenta${brand ? `&brand=${brand}` : ""}`} className={className}>
      Ingresar
    </Link>
  );
}
