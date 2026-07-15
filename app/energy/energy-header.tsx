import Image from "next/image";
import Link from "next/link";

const navItems = [
  { label: "Catálogos", href: "/energy/catalogo" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "/energy#contacto" },
];

function EnergyMark() {
  return (
    <Image
      src="/logo-geu-energy.png"
      alt="GEU Energy"
      width={2000}
      height={452}
      priority
      className="h-auto w-[245px] max-w-full object-contain"
    />
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export default function EnergyHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 md:px-8">
        <Link href="/" className="shrink-0">
          <EnergyMark />
        </Link>
        <nav className="hidden items-center gap-7 text-[11px] font-black uppercase tracking-[0.08em] text-white/85 lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="inline-flex items-center gap-1 border-b border-transparent py-2 hover:border-[#f5a623] hover:text-[#f5a623]">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-white">
          <button type="button" aria-label="Buscar" className="hover:text-[#f5a623]">
            <SearchIcon />
          </button>
          <button type="button" aria-label="Abrir menú" className="hover:text-[#f5a623]">
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
