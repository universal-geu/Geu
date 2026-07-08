import Image from "next/image";
import Link from "next/link";
import type { GeuCompany } from "../data/geu-companies";
import { geuCompanies } from "../data/geu-companies";
import GeuThemeToggle from "./geu-theme-toggle";

type CompanyPageProps = {
  company: GeuCompany;
};

export default function CompanyPage({ company }: CompanyPageProps) {
  return (
    <main className="geu-theme-page min-h-screen bg-[#050607] text-white">
      <GeuThemeToggle accent={company.accent} />
      <section className="relative overflow-hidden px-5 py-14 md:px-8 md:py-20">
        <div
          className="absolute inset-0 opacity-35"
          style={{
            background: `radial-gradient(circle at 26% 18%, ${company.accent}66, transparent 28%), linear-gradient(135deg, #050607 0%, #10141b 48%, #050607 100%)`,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />

        <div className="relative mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/65 transition-colors hover:text-white"
            >
              ← Volver a GEU
            </Link>
            <span
              className="mt-12 block h-1 w-16 shadow-[0_0_22px_currentColor]"
              style={{ backgroundColor: company.accent, color: company.accent }}
            />
            <p className="mt-8 text-xl font-medium uppercase tracking-[0.08em] text-white/70">
              {company.eyebrow}
            </p>
            <h1 className="mt-2 font-[family:var(--font-display)] text-6xl font-black uppercase leading-none tracking-[0.04em] text-white md:text-8xl">
              {company.title}
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-white/72">
              {company.longDescription}
            </p>
          </div>

          <div className="relative min-h-[520px] overflow-hidden border border-white/10 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.42)]">
            <Image
              src="/geu-consorcio-home.png"
              alt={company.name}
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
              style={{
                objectPosition:
                  company.slug === "cauchos"
                    ? "10% center"
                    : company.slug === "import"
                      ? "30% center"
                      : company.slug === "innovation"
                        ? "50% center"
                        : company.slug === "energy"
                          ? "70% center"
                          : "90% center",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.72))]" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-sm font-black uppercase tracking-[0.28em] text-white/55">
                {company.sector}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#090d12] px-5 py-12 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-4 md:grid-cols-4">
            {company.focus.map((item) => (
              <div
                key={item}
                className="border border-white/10 bg-white/[0.03] px-5 py-6"
              >
                <p
                  className="text-sm font-black uppercase tracking-[0.22em]"
                  style={{ color: company.accent }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-white/45">
            Otras unidades GEU
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {geuCompanies
              .filter((item) => item.slug !== company.slug)
              .map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="border border-white/10 bg-white/[0.03] px-5 py-5 transition-colors hover:bg-white/[0.08]"
                >
                  <span
                    className="mb-4 block h-1 w-10"
                    style={{ backgroundColor: item.accent }}
                  />
                  <p className="text-lg font-black uppercase tracking-[0.04em]">
                    {item.shortName}
                  </p>
                  <p className="mt-2 text-sm leading-5 text-white/58">
                    {item.description}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
