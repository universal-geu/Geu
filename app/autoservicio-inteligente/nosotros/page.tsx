import Image from "next/image";
import InnovationHeader from "../innovation-header";
import SiteFooter from "../../components/site-footer";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Structure", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/autoservicio-inteligente/nosotros", active: true },
  { label: "Contacto", href: "/autoservicio-inteligente#contacto" },
];

const pilares = [
  {
    title: "Misión",
    description: "Desarrollar soluciones inteligentes que conviertan buenas ideas en nuevas oportunidades de negocio.",
  },
  {
    title: "Visión",
    description:
      "Para el año 2035, ser una empresa referente en Latinoamérica por desarrollar soluciones tecnológicas que transformen la forma en que las empresas venden, distribuyen y generan valor.",
  },
  {
    title: "Propósito",
    description: "Impulsar el crecimiento de las empresas mediante soluciones que crean nuevas oportunidades de negocio.",
  },
];

const valores = [
  {
    title: "Innovación",
    description: "Transformamos ideas en soluciones con impacto.",
  },
  {
    title: "Visión",
    description: "Pensamos en las necesidades del mañana desde hoy.",
  },
  {
    title: "Creatividad",
    description: "Encontramos oportunidades donde otros ven límites.",
  },
  {
    title: "Excelencia",
    description: "Cada desarrollo debe aportar valor real.",
  },
  {
    title: "Colaboración",
    description: "Las mejores soluciones nacen del trabajo conjunto.",
  },
  {
    title: "Integridad",
    description: "Innovamos con responsabilidad y transparencia.",
  },
  {
    title: "Orientación al cliente",
    description: "Cada desarrollo responde a una necesidad real del mercado.",
  },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
      <span className="h-px w-8 bg-[#0498b4]" />
      {children}
    </p>
  );
}

export default async function InnovationNosotrosPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const introParagraphs = t("innovation-nosotros-intro-texto").split("\n\n");

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <InnovationHeader />

      <section className="relative min-h-[460px] overflow-hidden bg-white md:min-h-[620px]">
        <Image
          src="/innovation-nosotros-hero.png"
          alt="GEU Innovation"
          fill
          priority
          sizes="100vw"
          className="object-contain object-right"
        />
        <div className="relative mx-auto flex min-h-[460px] max-w-[1632px] flex-col justify-center px-5 py-24 md:min-h-[620px] md:px-8 md:py-32">
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.15] tracking-[-0.01em] text-slate-950 md:text-6xl">
            {t("innovation-nosotros-hero-titulo")}
          </h1>
          <p className="mt-8 max-w-xl text-[15px] font-normal leading-8 text-slate-600">
            {t("innovation-nosotros-hero-subtitulo")}
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1632px] px-5 py-16 md:px-8">
          <div className="max-w-2xl space-y-5">
            {introParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-[15px] font-normal leading-8 text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#0498b4]/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <ul className="grid gap-y-14 md:grid-cols-3 md:gap-x-14 md:gap-y-0">
            {pilares.map((pilar, index) => (
              <li
                key={pilar.title}
                className={`pt-8 md:pt-0 ${index === 0 ? "" : "border-t border-slate-200 md:border-t-0 md:border-l md:pl-14"}`}
              >
                <h2 className="text-lg font-bold uppercase tracking-[0.06em] text-[#0498b4]">
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
          className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#0498b4]/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Valores corporativos</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("innovation-valores-titulo")}
          </h2>

          <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((valor, index) => (
              <li key={valor.title} className="group border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0498b4]/25 bg-[#0498b4]/[0.06] font-mono text-[10px] font-medium tabular-nums text-[#0498b4]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-950">
                    {valor.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-500">
                  {valor.description}
                </p>
                <span className="mt-4 block h-px w-0 bg-[#0498b4] transition-all duration-500 ease-out group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-[1632px] grid-cols-2 gap-3 px-5 py-10 md:grid-cols-4 md:px-8">
          {(
            [
              "innovation-destacada-1",
              "innovation-destacada-2",
              "innovation-destacada-3",
              "innovation-destacada-4",
            ] as const
          ).map((key) => (
            <div key={key} className="relative aspect-[4/3] overflow-hidden rounded-[6px]">
              <Image
                src={resolveImage(key, siteImages)}
                alt="GEU Innovation"
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
          <p className="mt-8 max-w-2xl border-l border-[#0498b4]/40 pl-8 text-xl font-normal leading-9 tracking-[-0.005em] text-slate-700 md:text-2xl">
            {t("innovation-filosofia-texto")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#04181c]">
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,24,28,0.98) 0%, rgba(6,36,42,0.9) 55%, rgba(4,152,180,0.3) 100%), radial-gradient(circle at 15% 80%, rgba(4,152,180,0.32), transparent 36%)",
          }}
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-white/60">
            <span className="h-px w-8 bg-[#0498b4]" />
            Promesa de marca
          </p>
          <p className="mt-8 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.015em] text-white md:text-5xl">
            {t("innovation-promesa-titulo")}
          </p>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-innovation.png"
        logoAlt="GEU Innovation"
        logoWidth={220}
        tagline={t("footer-innovation-tagline")}
        navItems={navItems}
        accent="#0498b4"
        siteTexts={siteTexts}
        columns={[]}
      />
    </main>
  );
}
