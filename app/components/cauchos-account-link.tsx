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
};

export default function CauchosAccountLink({ className, brand }: Props) {
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
    return (
      <Link href={user.role === "ADMIN" ? `/admin${brandQuery}` : `/mi-cuenta${brandQuery}`} className={className}>
        Mi cuenta
      </Link>
    );
  }

  return (
    <Link href={`/login?next=/mi-cuenta${brand ? `&brand=${brand}` : ""}`} className={className}>
      Ingresar
    </Link>
  );
}
