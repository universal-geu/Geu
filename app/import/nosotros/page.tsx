import Image from "next/image";
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
  { label: "Nosotros", href: "/import/nosotros", active: true },
  { label: "Contacto", href: "/import#contacto" },
];

const pilares = [
  {
    title: "Misión",
    description:
      "Conectar la industria con soluciones de clase mundial, generando valor a través de la innovación, la confianza y un servicio excepcional.",
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
      <span className="h-px w-8 bg-[#e31313]" />
      {children}
    </p>
  );
}

export default async function ImportNosotrosPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CauchosHeader division="Import" />

      <section className="relative overflow-hidden bg-white">
        <Image
          src="/geu-import-puerto-banner.jpg"
          alt="Logística portuaria GEU Import"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-32">
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.15] tracking-[-0.01em] text-slate-950 md:text-6xl">
            {t("import-nosotros-hero-titulo")}
          </h1>
          <p className="mt-8 max-w-xl text-[15px] font-normal leading-8 text-slate-600">
            {t("import-nosotros-hero-subtitulo")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#e31313]/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <ul className="grid gap-y-14 md:grid-cols-3 md:gap-x-14 md:gap-y-0">
            {pilares.map((pilar, index) => (
              <li
                key={pilar.title}
                className={`pt-8 md:pt-0 ${index === 0 ? "" : "border-t border-slate-200 md:border-t-0 md:border-l md:pl-14"}`}
              >
                <h2 className="text-lg font-bold uppercase tracking-[0.06em] text-[#e31313]">
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
          className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#e31313]/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Valores corporativos</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("import-valores-titulo")}
          </h2>

          <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {valores.map((valor, index) => (
              <li key={valor.title} className="group border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e31313]/25 bg-[#e31313]/[0.06] font-mono text-[10px] font-medium tabular-nums text-[#e31313]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-950">
                    {valor.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-500">
                  {valor.description}
                </p>
                <span className="mt-4 block h-px w-0 bg-[#e31313] transition-all duration-500 ease-out group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-[1632px] grid-cols-2 gap-3 px-5 py-10 md:grid-cols-4 md:px-8">
          {(["import-destacada-1", "import-destacada-2", "import-destacada-3", "import-destacada-4"] as const).map(
            (key) => (
              <div key={key} className="relative aspect-[4/3] overflow-hidden rounded-[6px]">
                <Image
                  src={resolveImage(key, siteImages)}
                  alt="GEU Import"
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>Filosofía empresarial</SectionLabel>
          <p className="mt-8 max-w-2xl border-l border-[#e31313]/40 pl-8 text-xl font-normal leading-9 tracking-[-0.005em] text-slate-700 md:text-2xl">
            {t("import-filosofia-texto")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#140505]">
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(20,5,5,0.98) 0%, rgba(31,8,8,0.9) 55%, rgba(227,19,19,0.3) 100%), radial-gradient(circle at 15% 80%, rgba(227,19,19,0.32), transparent 36%)",
          }}
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ff8080]">
            <span className="h-px w-8 bg-[#e31313]" />
            Promesa de marca
          </p>
          <p className="mt-8 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.015em] text-white md:text-5xl">
            {t("import-promesa-titulo")}
          </p>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-import.png"
        logoAlt="GEU Import"
        logoWidth={220}
        tagline={t("footer-import-tagline")}
        navItems={navItems}
        accent="#e31313"
        siteTexts={siteTexts}
        columns={[
          {
            title: t("footer-import-col3-title"),
            items: t("footer-import-col3-items").split(",").map((s) => s.trim()).filter(Boolean),
          },
          {
            title: t("footer-import-col4-title"),
            items: t("footer-import-col4-items").split(",").map((s) => s.trim()).filter(Boolean),
            style: "badges",
          },
        ]}
      />
    </main>
  );
}
