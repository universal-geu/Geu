import Image from "next/image";
import EnergyHeader from "../energy-header";
import SiteFooter from "../../components/site-footer";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/energy/nosotros", active: true },
  { label: "Contacto", href: "/energy#contacto" },
];

const pilares = [
  {
    title: "Misión",
    description:
      "Impulsar la transición energética mediante soluciones innovadoras que generen eficiencia, sostenibilidad y valor para nuestros clientes y la sociedad.",
  },
  {
    title: "Visión",
    description:
      "Para el año 2035, ser una empresa referente en Latinoamérica en soluciones para infraestructura energética, reconocida por su innovación, calidad y compromiso con el desarrollo sostenible.",
  },
  {
    title: "Propósito",
    description:
      "Contribuir a un futuro más sostenible desarrollando soluciones que impulsen la transformación energética de Latinoamérica.",
  },
];

const valores = [
  {
    title: "Compromiso",
    description: "Trabajamos con responsabilidad para construir un mejor futuro.",
  },
  {
    title: "Innovación",
    description: "Buscamos constantemente nuevas tecnologías que generen impacto positivo.",
  },
  {
    title: "Sostenibilidad",
    description: "Cada decisión considera el bienestar del planeta y de las futuras generaciones.",
  },
  {
    title: "Excelencia",
    description: "Diseñamos soluciones con altos estándares de calidad y desempeño.",
  },
  {
    title: "Integridad",
    description: "Actuamos con transparencia, ética y responsabilidad.",
  },
  {
    title: "Trabajo en equipo",
    description: "Creemos que los grandes proyectos se construyen colaborando.",
  },
  {
    title: "Pasión por transformar",
    description: "Nos inspira crear soluciones que generen un cambio positivo.",
  },
];

const destacadas = [
  { src: "/energy-nosotros-equipo-1.jpg", alt: "Equipo GEU Energy instalando estructura monoposte" },
  { src: "/energy-nosotros-equipo-2.jpg", alt: "Equipo GEU Energy instalando estructura biposte" },
  { src: "/energy-nosotros-equipo-3.jpg", alt: "Equipo GEU Energy instalando estructura chinese hat" },
  { src: "/energy-nosotros-equipo-4.jpg", alt: "Equipo GEU Energy instalando estructura carport" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
      <span className="h-px w-8 bg-[#ffd400]" />
      {children}
    </p>
  );
}

export default async function EnergyNosotrosPage() {
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <EnergyHeader />

      <section className="relative overflow-hidden bg-white pt-20">
        <Image
          src="/energy-nosotros-hero.png"
          alt="GEU Energy, infraestructura para granjas solares"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-32">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#b38f00]">
            <span className="h-px w-8 bg-[#ffd400]" />
            Nosotros
          </p>
          <h1 className="mt-6 max-w-2xl text-4xl font-medium leading-[1.15] tracking-[-0.01em] text-slate-950 md:text-6xl">
            {t("energy-nosotros-hero-titulo")}
          </h1>
          <p className="mt-8 max-w-xl text-[15px] font-normal leading-8 text-slate-600">
            {t("energy-nosotros-hero-subtitulo")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#ffd400]/[0.1] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <ul className="grid gap-y-14 md:grid-cols-3 md:gap-x-14 md:gap-y-0">
            {pilares.map((pilar, index) => (
              <li
                key={pilar.title}
                className={`pt-8 md:pt-0 ${index === 0 ? "" : "border-t border-slate-200 md:border-t-0 md:border-l md:pl-14"}`}
              >
                <h2 className="text-lg font-bold uppercase tracking-[0.06em] text-[#b38f00]">
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
          className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#ffd400]/[0.1] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Valores corporativos</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("energy-valores-titulo")}
          </h2>

          <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((valor, index) => (
              <li key={valor.title} className="group border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b38f00]/25 bg-[#ffd400]/[0.08] font-mono text-[10px] font-medium tabular-nums text-[#b38f00]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-950">
                    {valor.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-500">
                  {valor.description}
                </p>
                <span className="mt-4 block h-px w-0 bg-[#ffd400] transition-all duration-500 ease-out group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-[1632px] grid-cols-2 gap-3 px-5 py-10 md:grid-cols-4 md:px-8">
          {destacadas.map((image) => (
            <div key={image.src} className="relative aspect-[4/3] overflow-hidden rounded-[6px]">
              <Image
                src={image.src}
                alt={image.alt}
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
          <p className="mt-8 max-w-2xl border-l border-[#b38f00]/40 pl-8 text-xl font-normal leading-9 tracking-[-0.005em] text-slate-700 md:text-2xl">
            {t("energy-filosofia-texto")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#050505]">
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(5,5,5,0.98) 0%, rgba(10,9,2,0.9) 55%, rgba(255,212,0,0.22) 100%), radial-gradient(circle at 15% 80%, rgba(255,212,0,0.28), transparent 36%)",
          }}
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ffe680]">
            <span className="h-px w-8 bg-[#ffd400]" />
            Promesa de marca
          </p>
          <p className="mt-8 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.015em] text-white md:text-5xl">
            {t("energy-promesa-titulo")}
          </p>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-energy.png"
        logoAlt="GEU Energy"
        logoWidth={220}
        tagline={t("footer-energy-tagline")}
        navItems={navItems}
        accent="#ffd400"
        variant="dark"
        darkBg="#050505"
        siteTexts={siteTexts}
        maxWidth="1500px"
        columns={[]}
      />
    </main>
  );
}
