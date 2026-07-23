import Image from "next/image";
import Link from "next/link";
import SolutionsCarousel from "./solutions-carousel";
import EnergyHeader from "./energy-header";
import SiteFooter from "../components/site-footer";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy", active: true },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "/energy#contacto" },
];

const heroVideo = "/geu-energy-hero-field.mp4";
const orbitStatsImage = "/geu-energy-orbit-stats.png";
const engineeringImage = "/geu-energy-engineering.png";
const impactImage = "/geu-energy-impact.png";
const gusImage = "/geu-energy-gus-home.png";
const projectHouseImage = "/geu-energy-project-house.png";
const projectHouseVideo = "/geu-energy-project-house.mp4";

const solutions = [
  {
    title: "Monoposte",
    text: "Un solo poste central por línea de módulos, ideal para terrenos con buena capacidad portante.",
    image: "/energy-estructura-monoposte.jpg",
  },
  {
    title: "Biposte",
    text: "Dos hileras de postes que reparten mejor la carga, pensado para configuraciones más grandes.",
    image: "/energy-estructura-biposte.jpg",
  },
  {
    title: "Chinese hat",
    text: "Estructura tipo carpa con paneles a dos aguas desde una cumbrera central.",
    image: "/energy-estructura-chinesehat.jpg",
  },
  {
    title: "Carport",
    text: "Cubierta solar para parqueaderos: genera energía y da sombra al mismo tiempo.",
    image: "/energy-estructura-carport.jpg",
  },
];

function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v2H9z" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 9-6 15-15 15C5 10 11 4 20 4Z" />
      <path d="M5 19 15 9" />
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
  { icon: BoltIcon, value: "120", unit: "MW", label: "Capacidad instalada" },
  { icon: ClipboardCheckIcon, value: "350", unit: "+", label: "Proyectos ejecutados" },
  { icon: LeafIcon, value: "18.500", unit: "", label: "Toneladas de CO2 evitadas al año" },
  { icon: PeopleIcon, value: "25", unit: "+", label: "Años de experiencia en el sector" },
];

function StepIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  );
}

const systemSteps = [
  { number: "01", label: "Analizamos tu consumo" },
  { number: "02", label: "Diseñamos tu sistema" },
  { number: "03", label: "Optimizamos tu inversión" },
  { number: "04", label: "Acompañamos tu proyecto" },
];

export default async function EnergyPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <EnergyHeader />

      <section className="relative isolate flex min-h-screen flex-col overflow-hidden border-b border-white/10">
        <video
          src={heroVideo}
          poster={resolveImage("energy-principal", siteImages)}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[58%_28%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.34)_42%,rgba(0,0,0,0.04)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.06)_56%,rgba(0,0,0,0.55)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col justify-center px-5 md:px-8">
          <div className="max-w-2xl">
            <span className="block h-1 w-24 bg-[#ffd400] shadow-[0_0_28px_rgba(255,212,0,0.7)]" />
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#ffd400]">
              {t("energy-hero-eyebrow")}
            </p>
            <h1 className="mt-4 font-[family:var(--font-display)] text-5xl font-black uppercase leading-none tracking-[0.02em] md:text-7xl">
              {t("energy-hero-titulo")}
            </h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/78 md:text-lg">
              {t("energy-hero-subtitulo")}
            </p>
            <Link
              href="#soluciones"
              className="mt-8 inline-flex items-center gap-3 rounded-[3px] border border-[#ffd400]/70 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#ffd400] hover:bg-[#ffd400] hover:text-black"
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
          <span className="h-1.5 w-1.5 rounded-full border border-[#ffd400]" />
          <span className="[writing-mode:vertical-rl] text-[9px] font-black uppercase tracking-[0.3em] text-white/45">
            Scroll
          </span>
        </div>
      </section>

      <section className="overflow-hidden border-b border-white/10 bg-[#050505]">
        <div className="relative mx-auto aspect-[1717/916] w-full max-w-[1920px]">
          <Image
            src={orbitStatsImage}
            alt="Indicadores GEU Energy: capacidad instalada, proyectos ejecutados, CO2 evitado y experiencia"
            fill
            sizes="100vw"
            className="object-cover"
            priority={false}
          />
        </div>
      </section>

      <section className="overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[1672/941] w-full max-w-[1920px]">
          <Image
            src={engineeringImage}
            alt="Ingeniería que sostiene el futuro: panel, perfil, viga, columna y anclaje"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section id="soluciones" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="py-14">
          <h2 className="mx-auto max-w-xl px-5 text-center text-3xl font-black tracking-[-0.02em] md:px-8 md:text-4xl">
            {t("energy-soluciones-titulo")}
          </h2>
          <div className="mx-auto mt-10 max-w-[1500px] px-5 md:px-8">
            <SolutionsCarousel items={solutions} />
          </div>
        </div>
      </section>

      <section id="proyectos" className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[1672/941] w-full max-w-[1920px]">
          <Image
            src={impactImage}
            alt="Impacto GEU Energy en almacenamiento, capacidad solar, CO2 evitado, presencia y proyectos ejecutados"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </section>

      <section id="sistema" className="relative isolate overflow-hidden border-b border-white/10 bg-black">
        <video
          src={projectHouseVideo}
          poster={projectHouseImage}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.05)_28%,rgba(0,0,0,0.05)_72%,rgba(0,0,0,0.4)_100%)]" />

        <div className="relative mx-auto grid min-h-[640px] max-w-[1500px] items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="max-w-xl">
            <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">
              {t("energy-sistema-eyebrow")} <span className="h-px w-10 bg-[#ffd400]" />
            </p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl font-black leading-[1.05] tracking-[-0.02em] md:text-5xl">
              {t("energy-sistema-titulo")}
            </h2>
            <p className="mt-5 max-w-sm text-sm font-semibold leading-6 text-white/75">
              {t("energy-sistema-subtitulo")}
            </p>
            <Link
              href="#contacto"
              className="mt-7 inline-flex items-center gap-3 rounded-[3px] border border-[#ffd400]/70 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#ffd400] hover:bg-[#ffd400] hover:text-black"
            >
              Comenzar ahora <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-xs lg:grid-cols-1 lg:justify-self-end">
            {systemSteps.map((step) => (
              <div
                key={step.number}
                className="flex items-center justify-between gap-4 rounded-[6px] border border-white/10 bg-black/60 px-5 py-4 backdrop-blur-sm"
              >
                <div>
                  <p className="flex items-center gap-2 text-[11px] font-black text-[#ffd400]">
                    <StepIcon /> {step.number}
                  </p>
                  <p className="mt-1 text-sm font-black uppercase leading-tight text-white">{step.label}</p>
                </div>
                <span className="text-lg text-[#ffd400]" aria-hidden="true">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="relative overflow-hidden bg-black">
        <div className="relative mx-auto aspect-[2048/768] w-full max-w-[1920px]">
          <Image
            src={gusImage}
            alt="Gus, tu asistente energético"
            fill
            sizes="100vw"
            className="object-cover"
          />
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
