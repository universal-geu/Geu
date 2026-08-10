import Image from "next/image";
import Link from "next/link";
import SolutionsCarousel from "../energy/solutions-carousel";
import InnovationHeader from "./innovation-header";
import SiteFooter from "../components/site-footer";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation", active: true },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/innovation/nosotros" },
  { label: "Contacto", href: "mailto:innovation@geu.com.co" },
];

const heroVideo = "/geu-innovation-hero.mp4";
const brandBannerImage = "/geu-innovation-brand-banner.png";
const supportBannerImage = "/geu-innovation-support-banner.png";

const solutions = [
  {
    title: "Autoservicio 24/7",
    text: "Tu equipo se sirve solo: bebidas y snacks disponibles a cualquier hora, sin filas ni intermediarios.",
    image: "/geu-innovation-card-autoservicio.png",
  },
  {
    title: "Pago sin contacto",
    text: "Cada producto se registra al instante: cobro automático y trazabilidad total del consumo.",
    image: "/geu-innovation-card-pago.png",
  },
  {
    title: "Asistente GEU",
    text: "Un asistente siempre listo para reposición, mantenimiento y soporte técnico en sitio.",
    image: "/geu-innovation-card-asistente.png",
  },
  {
    title: "Espacios colaborativos",
    text: "Puntos GEU Innovation pensados para integrarse al ritmo de tu oficina o punto de venta.",
    image: brandBannerImage,
  },
];

function SnowflakeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11" />
      <path d="M12 2 9.5 4.5M12 2l2.5 2.5M12 22l-2.5-2.5M12 22l2.5-2.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M2.5 8.5a15 15 0 0 1 19 0" />
      <path d="M5.8 12.3a10.5 10.5 0 0 1 12.4 0" />
      <path d="M9 16a5.5 5.5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 14.2c2.6.5 4.4 2.7 4.4 5.3" />
    </svg>
  );
}

const heroStats = [
  { icon: SnowflakeIcon, value: "150", unit: "+", label: "Puntos inteligentes instalados" },
  { icon: WifiIcon, value: "99.2", unit: "%", label: "Disponibilidad del sistema" },
  { icon: ClockIcon, value: "24/7", unit: "", label: "Autoservicio disponible" },
  { icon: PeopleIcon, value: "40", unit: "+", label: "Empresas conectadas" },
];

export default async function InnovationPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <InnovationHeader />

      <section className="relative isolate flex min-h-screen flex-col overflow-hidden border-b border-white/10">
        <video
          src={heroVideo}
          poster={resolveImage("innovation-principal", siteImages)}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[58%_28%]"
        />
        <div className="absolute inset-0 bg-black/38" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.08)_56%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center justify-center px-5 text-center md:px-8">
          <div className="innovation-hero-intro flex max-w-2xl flex-col items-center">
            <h1 className="font-[family:var(--font-display)] text-5xl font-black uppercase leading-none tracking-[0.02em] text-white/85 md:text-7xl">
              {t("innovation-hero-titulo")}
            </h1>
            <Link
              href="#soluciones"
              className="mt-8 inline-flex items-center gap-3 rounded-[3px] border border-[#0498b4]/70 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#0498b4] hover:bg-[#0498b4] hover:text-black"
            >
              Explorar soluciones <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 bg-black/55 backdrop-blur-sm">
          <div className="mx-auto grid max-w-[1500px] grid-cols-4 gap-x-6 gap-y-8 px-5 py-7 max-[560px]:grid-cols-2 md:px-8">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon />
                <div>
                  <p className="font-[family:var(--font-display)] text-2xl font-black leading-none text-white md:text-3xl">
                    {stat.value}
                    <span className="text-sm font-black uppercase text-white/70">{stat.unit}</span>
                  </p>
                  <p className="mt-1.5 max-w-[10rem] text-[10px] font-bold uppercase leading-tight tracking-[0.06em] text-white/60">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[7.5rem] left-5 hidden flex-col items-center gap-3 md:left-8 lg:flex">
          <span className="h-8 w-px bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full border border-[#0498b4]" />
          <span className="[writing-mode:vertical-rl] text-[9px] font-black uppercase tracking-[0.3em] text-white/45">
            Scroll
          </span>
        </div>
      </section>

      <section id="soluciones" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="py-14">
          <h2 className="mx-auto max-w-xl px-5 text-center text-3xl font-black tracking-[-0.02em] md:px-8 md:text-4xl">
            {t("innovation-soluciones-titulo")}
          </h2>
          <div className="mx-auto mt-10 max-w-[1500px] px-5 md:px-8">
            <SolutionsCarousel items={solutions} />
          </div>
        </div>
      </section>

      <section id="sistema" className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[1672/941] w-full max-w-[1920px]">
          <Image
            src={supportBannerImage}
            alt="Asistente GEU Innovation junto a un punto inteligente, listo para dar soporte"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.02)_26%,rgba(0,0,0,0.02)_66%,rgba(0,0,0,0.78)_100%)]" />

          <div className="absolute inset-0 flex items-center pb-24 md:pb-28">
            <div className="mx-auto w-full max-w-[1500px] px-5 md:px-8">
              <div className="max-w-md">
                <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
                  {t("innovation-sistema-eyebrow")} <span className="h-px w-10 bg-[#0498b4]" />
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-2xl font-black leading-[1.05] tracking-[-0.02em] text-white md:text-4xl">
                  {t("innovation-sistema-titulo")}
                </h2>
                <p className="mt-3 hidden max-w-sm text-sm font-semibold leading-6 text-white/80 md:block">
                  {t("innovation-sistema-subtitulo")}
                </p>
                <Link
                  href="mailto:innovation@geu.com.co"
                  className="mt-4 inline-flex items-center gap-3 rounded-[3px] border border-[#0498b4]/70 px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#0498b4] hover:bg-[#0498b4] hover:text-black md:px-6 md:py-3.5 md:text-[12px]"
                >
                  Comenzar ahora <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-innovation.png"
        logoAlt="GEU Innovation"
        logoWidth={220}
        tagline={t("footer-innovation-tagline")}
        navItems={navItems}
        accent="#0498b4"
        variant="dark"
        darkBg="#050505"
        siteTexts={siteTexts}
        maxWidth="1500px"
        columns={[]}
      />
    </main>
  );
}
