import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/quienes-somos", active: true },
  { label: "Unidades de negocio", href: "#ecosistema" },
];

const metrics = [
  { value: "20+", label: "Años de experiencia" },
  { value: "35", label: "Países" },
  { value: "1200+", label: "Clientes" },
  { value: "5", label: "Unidades de negocio" },
  { value: "98%", label: "Satisfacción del cliente" },
];

const ecosystemLabels = [
  {
    label: "Import",
    href: "/import",
    color: "#d71920",
    className: "left-[6%] top-[20%]",
  },
  {
    label: "Innovation",
    href: "/innovation",
    color: "#10b9c4",
    className: "left-[6%] bottom-[12%]",
  },
  {
    label: "Cauchos",
    href: "/cauchos",
    color: "#075ed8",
    className: "right-[6%] top-[20%]",
  },
  {
    label: "Plastic",
    href: "/plastic",
    color: "#9aa6b2",
    className: "right-[7%] bottom-[12%]",
  },
  {
    label: "Energy",
    href: "/energy",
    color: "#f2c400",
    className: "bottom-[7%] left-1/2 -translate-x-1/2",
  },
];

export const dynamic = "force-dynamic";

export default async function QuienesSomosPage() {
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const heroTitleLines = t("quienes-somos-hero-titulo").split("\n");

  return (
    <main className="min-h-screen bg-white text-[#071832]">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-[1720px] items-center justify-between px-7 py-8 md:px-12">
          <Link href="/" className="flex items-center">
            <Image
              src="/home-geu-logo.png"
              alt="GEU Grupo Empresarial Universal"
              width={3422}
              height={1256}
              priority
              className="h-auto w-[150px] object-contain md:w-[190px]"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-[12px] font-black uppercase tracking-[0.04em] text-[#061735] lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`border-b-2 pb-3 transition-colors hover:text-[#075ed8] ${
                  item.active ? "border-[#075ed8] text-[#075ed8]" : "border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="relative min-h-[760px] overflow-hidden bg-[#f8fafc] pt-28 md:min-h-[820px]">
        <Image
          src="/about-geu-logo-wall.png"
          alt="Logo tridimensional GEU en pared blanca"
          width={1962}
          height={802}
          priority
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="relative z-10 mx-auto flex min-h-[650px] max-w-[1720px] items-center px-7 md:px-12">
          <div className="max-w-[520px] pt-16">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#075ed8]">
              Nosotros
            </p>
            <span className="mt-3 block h-[2px] w-16 bg-[#075ed8]" />
            <h1 className="mt-8 text-[clamp(3rem,5vw,5.7rem)] font-black leading-[0.95] tracking-[-0.04em]">
              {heroTitleLines[0]}
              {heroTitleLines[1] && <span className="block text-black">{heroTitleLines[1]}</span>}
            </h1>
            <span className="mt-10 block h-[2px] w-16 bg-[#075ed8]" />
            <p className="mt-8 max-w-[470px] text-base font-semibold leading-8 text-[#26364b]">
              {t("quienes-somos-hero-subtitulo")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1360px] gap-10 px-7 py-14 md:grid-cols-2 md:px-12">
          <article className="grid gap-8 md:grid-cols-[120px_1fr] md:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-300 text-[#0b2f7e]">
              <span className="text-5xl">◎</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#075ed8]">
                Misión
              </h2>
              <p className="mt-4 max-w-md text-xl font-semibold leading-8 text-[#1d2b3d]">
                {t("quienes-somos-mision-texto")}
              </p>
            </div>
          </article>

          <article className="grid gap-8 border-slate-200 md:grid-cols-[120px_1fr] md:items-center md:border-l md:pl-14">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-300 text-[#0b2f7e]">
              <span className="text-5xl">△</span>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.08em] text-[#075ed8]">
                Visión
              </h2>
              <p className="mt-4 max-w-md text-xl font-semibold leading-8 text-[#1d2b3d]">
                {t("quienes-somos-vision-texto")}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section id="ecosistema" className="relative overflow-hidden bg-[#f4f7fb] py-10">
        <div className="mx-auto max-w-[1720px] px-7 text-center md:px-12">
          <h2 className="text-lg font-black uppercase tracking-[0.06em] text-[#0b2f7e]">
            {t("quienes-somos-ecosistema-titulo")}
          </h2>
          <span className="mx-auto mt-3 block h-[2px] w-16 bg-[#075ed8]" />
        </div>

        <div className="geu-ecosystem-frame relative mx-auto mt-2 max-w-[1720px]">
          <Image
            src="/about-geu-ecosystem.png"
            alt="Ecosistema industrial de las unidades de negocio GEU"
            width={1983}
            height={793}
            className="geu-ecosystem-image h-auto w-full object-cover"
          />
          {ecosystemLabels.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-label={`Ir a ${item.label}`}
              className={`group absolute hidden min-w-[150px] overflow-hidden rounded-[6px] border border-white/70 bg-white/62 px-4 py-3 text-left shadow-[0_18px_42px_rgba(15,23,42,0.13),inset_0_1px_0_rgba(255,255,255,0.82)] backdrop-blur-[16px] transition duration-200 hover:-translate-y-1 hover:bg-white/76 md:block ${item.className}`}
            >
              <span
                className="mb-2 block h-1 w-16 transition-all duration-200 group-hover:w-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="block text-xs font-black uppercase tracking-[0.22em] text-slate-500">
                Unidad
              </span>
              <span className="mt-1 flex items-center justify-between gap-3 text-xl font-black uppercase leading-none text-[#071832]">
                {item.label}
                <span
                  className="geu-ecosystem-arrow flex h-7 w-7 items-center justify-center rounded-full text-sm text-white transition-transform duration-200 group-hover:translate-x-1"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-y-10 px-7 py-11 text-center md:grid-cols-5 md:px-12">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`${index > 0 ? "md:border-l md:border-slate-200" : ""}`}
            >
              <p className="text-5xl font-black tracking-[-0.04em] text-[#17266d]">
                {metric.value}
              </p>
              <p className="mx-auto mt-2 max-w-[120px] text-xs font-black uppercase leading-4 text-[#061735]">
                {metric.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="contacto" className="relative min-h-[390px] overflow-hidden bg-[#061735] text-white">
        <Image
          src="/about-geu-industrial-night.png"
          alt="Complejo industrial iluminado de noche"
          width={1983}
          height={793}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,12,29,0.95),rgba(3,12,29,0.58),rgba(3,12,29,0.18))]" />
        <div className="relative z-10 mx-auto flex min-h-[390px] max-w-[1720px] items-center px-7 md:px-12">
          <div className="max-w-[500px]">
            <span className="block h-[2px] w-16 bg-[#075ed8]" />
            <h2 className="mt-8 text-5xl font-black leading-[1.03] tracking-[-0.04em]">
              {t("quienes-somos-contacto-titulo")}
            </h2>
            <p className="mt-6 max-w-[420px] text-base font-semibold leading-8 text-white/82">
              {t("quienes-somos-contacto-subtitulo")}
            </p>
          </div>
        </div>
      </section>

      <SiteFooter
        logoSrc="/home-geu-logo.png"
        logoAlt="GEU Grupo Empresarial Universal"
        logoWidth={150}
        tagline={t("footer-quienes-somos-tagline")}
        navItems={[
          { label: "Inicio", href: "/" },
          { label: "Nosotros", href: "/quienes-somos", active: true },
          { label: "Unidades de negocio", href: "#ecosistema" },
          { label: "Contacto", href: "#contacto" },
        ]}
        accent="#075ed8"
        variant="dark"
        siteTexts={siteTexts}
        maxWidth="1720px"
        columns={[]}
      />
    </main>
  );
}
