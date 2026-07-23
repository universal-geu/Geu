import Image from "next/image";
import Link from "next/link";
import CauchosHeader from "../../components/cauchos-header";
import SiteFooter from "../../components/site-footer";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/cauchos/nosotros", active: true },
  { label: "Contacto", href: "/cauchos#contacto" },
];

const pilares = [
  {
    title: "Misión",
    description:
      "Consolidar empresas industriales que creen soluciones confiables y eleven el estándar técnico del mercado colombiano.",
  },
  {
    title: "Visión",
    description:
      "Para el año 2035, ser uno de los grupos empresariales líderes en Latinoamérica en soluciones industriales y tecnológicas, reconocido por su innovación, excelencia y generación de valor para clientes, aliados y colaboradores.",
  },
  {
    title: "Propósito",
    description:
      "Impulsar el desarrollo de la industria conectando oportunidades globales con las necesidades de Latinoamérica.",
  },
];

const valores = [
  {
    title: "Integridad",
    description: "Actuamos con ética, transparencia y coherencia en cada decisión.",
  },
  {
    title: "Compromiso",
    description: "Cumplimos lo que prometemos y asumimos cada desafío con responsabilidad.",
  },
  {
    title: "Innovación",
    description: "Buscamos constantemente mejores soluciones para nuestros clientes y el mercado.",
  },
  {
    title: "Excelencia",
    description: "Trabajamos con altos estándares de calidad en todo lo que hacemos.",
  },
  {
    title: "Orientación al cliente",
    description: "Escuchamos, entendemos y generamos soluciones que aportan valor.",
  },
  {
    title: "Trabajo en equipo",
    description: "Creemos en la colaboración como motor del crecimiento y los resultados.",
  },
  {
    title: "Pasión por servir",
    description: "Disfrutamos ayudar a nuestros clientes a alcanzar sus objetivos.",
  },
];

const metricas = [
  { value: "20+", label: "Años de experiencia" },
  { value: "35", label: "Países" },
  { value: "1200+", label: "Clientes" },
  { value: "5", label: "Unidades de negocio" },
  { value: "98%", label: "Satisfacción del cliente" },
];

const ecosistema = [
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Plastic", href: "/plastic" },
  { label: "Energy", href: "/energy" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
      <span className="h-px w-8 bg-[#075ed8]" />
      {children}
    </p>
  );
}

export default async function CauchosNosotrosPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const heroTitleLines = t("cauchos-nosotros-hero-titulo").split("\n");

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CauchosHeader division="Cauchos" />

      <section className="relative overflow-hidden bg-[#020c1f]">
        <Image
          src={resolveImage("banner-principal", siteImages)}
          alt="Universal de Cauchos"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(2,12,31,0.97) 0%, rgba(3,18,46,0.9) 42%, rgba(3,18,46,0.35) 75%, rgba(3,18,46,0.15) 100%)",
          }}
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-32">
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.15] tracking-[-0.01em] text-white md:text-6xl">
            {heroTitleLines[0]}
            {heroTitleLines[1] && <span className="block">{heroTitleLines[1]}</span>}
          </h1>
          <p className="mt-8 max-w-xl text-[15px] font-normal leading-8 text-white/65">
            {t("cauchos-nosotros-hero-subtitulo")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#075ed8]/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <ul className="grid gap-y-14 md:grid-cols-3 md:gap-x-14 md:gap-y-0">
            {pilares.map((pilar, index) => (
              <li
                key={pilar.title}
                className={`pt-8 md:pt-0 ${index === 0 ? "" : "border-t border-slate-200 md:border-t-0 md:border-l md:pl-14"}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#075ed8]/25 bg-[#075ed8]/[0.06] font-mono text-[11px] font-medium tabular-nums text-[#075ed8]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-5 text-lg font-medium uppercase tracking-[0.06em] text-slate-950">
                  {pilar.title}
                </h2>
                <p className="mt-4 text-sm font-normal leading-7 text-slate-500">
                  {pilar.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#075ed8]/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Valores corporativos</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("cauchos-valores-titulo")}
          </h2>

          <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((valor, index) => (
              <li key={valor.title} className="group border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#075ed8]/25 bg-[#075ed8]/[0.06] font-mono text-[10px] font-medium tabular-nums text-[#075ed8]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-950">
                    {valor.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-500">
                  {valor.description}
                </p>
                <span className="mt-4 block h-px w-0 bg-[#075ed8] transition-all duration-500 ease-out group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-[1632px] grid-cols-2 gap-3 px-5 py-10 md:grid-cols-4 md:px-8">
          {(
            [
              "marca-destacada-perfiles",
              "marca-destacada-mangueras",
              "marca-destacada-laminas",
              "marca-destacada-soportes",
            ] as const
          ).map((key) => (
            <div key={key} className="relative aspect-[4/3] overflow-hidden rounded-[6px]">
              <Image
                src={resolveImage(key, siteImages)}
                alt="Universal de Cauchos"
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Filosofía empresarial</SectionLabel>
          <p className="mt-8 max-w-2xl border-l border-[#075ed8]/40 pl-8 text-xl font-normal leading-9 tracking-[-0.005em] text-slate-700 md:text-2xl">
            {t("cauchos-filosofia-texto")}
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Cifras del grupo</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("cauchos-cifras-titulo")}
          </h2>

          <ul className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-5">
            {metricas.map((metrica) => (
              <li key={metrica.label}>
                <p className="text-4xl font-medium tracking-[-0.02em] text-slate-950">
                  {metrica.value}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.06em] text-slate-500">
                  {metrica.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Nuestro ecosistema</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("cauchos-ecosistema-titulo")}
          </h2>

          <ul className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {ecosistema.map((unidad, index) => (
              <li key={unidad.label} className="group border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#075ed8]/25 bg-[#075ed8]/[0.06] font-mono text-[10px] font-medium tabular-nums text-[#075ed8]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Link
                    href={unidad.href}
                    className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-950 hover:text-[#075ed8]"
                  >
                    {unidad.label}
                  </Link>
                </div>
                <span className="mt-4 block h-px w-0 bg-[#075ed8] transition-all duration-500 ease-out group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#020c1f]">
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(2,12,31,0.98) 0%, rgba(3,18,46,0.9) 55%, rgba(7,94,216,0.3) 100%), radial-gradient(circle at 15% 80%, rgba(7,94,216,0.32), transparent 36%)",
          }}
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8fc0ff]">
            <span className="h-px w-8 bg-[#075ed8]" />
            Promesa de marca
          </p>
          <p className="mt-8 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.015em] text-white md:text-5xl">
            {t("cauchos-promesa-titulo")}
          </p>
          <p className="mt-6 max-w-xl text-[15px] font-normal leading-8 text-white/65">
            {t("cauchos-promesa-subtitulo")}
          </p>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-universal-cauchos.png"
        logoAlt="Universal de Cauchos"
        logoWidth={220}
        tagline={t("footer-cauchos-tagline")}
        navItems={navItems}
        accent="#075ed8"
        siteTexts={siteTexts}
        columns={[
          {
            title: t("footer-cauchos-col3-title"),
            items: t("footer-cauchos-col3-items").split(",").map((s) => s.trim()).filter(Boolean),
          },
          {
            title: t("footer-cauchos-col4-title"),
            items: t("footer-cauchos-col4-items").split(",").map((s) => s.trim()).filter(Boolean),
            style: "badges",
          },
        ]}
      />
    </main>
  );
}
