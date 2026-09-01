import Image from "next/image";
import Link from "next/link";
import StructureHeader from "./structure-header";
import GalvanizingProcess from "./galvanizing-process";
import ServiciosTimeline from "./servicios-timeline";
import SiteFooter from "../components/site-footer";
import { getSiteTexts } from "@/lib/site-texts";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { isVideoUrl } from "@/lib/image-slots";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Structure", href: "/innovation", active: true },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Contacto", href: "mailto:innovation@geu.com.co" },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function RulerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16 16 4l4 4L8 20 4 16Z" />
      <path d="m9.5 10.5 1.5 1.5M12.5 7.5 14 9M6.5 13.5 8 15" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L21 6l-3-3-3.3 3.3Z" />
    </svg>
  );
}

const heroStats = [
  { icon: ShieldIcon, value: "25", unit: "+", label: "Años de vida útil de protección" },
  { icon: LayersIcon, value: "80–100", unit: "µm", label: "Espesor de zinc galvanizado" },
  { icon: RulerIcon, value: "A36", unit: "", label: "Acero estructural ASTM certificado" },
  { icon: ToolIcon, value: "07", unit: "", label: "Servicios técnicos en cada etapa" },
];

const propuesta = [
  { num: "01", title: "Ingeniería", text: "Diseño estructural y análisis según las condiciones del proyecto." },
  { num: "02", title: "Fabricación", text: "Perfiles, conexiones y componentes producidos con control y trazabilidad." },
  { num: "03", title: "Protección", text: "Galvanizado por inmersión en caliente como estrategia de durabilidad." },
  { num: "04", title: "Campo", text: "Estudio de suelos, pruebas, pilotaje, hincado y montaje estructural." },
];

const especificaciones = [
  { label: "Dimensiones generales", value: "14,60 × 5,50 m" },
  { label: "Inclinación", value: "8,13°" },
  { label: "Columnas", value: "10 · 5 + 5" },
  { label: "Apoyos · eje a eje", value: "3,40 m" },
  { label: "Altura frontal / posterior", value: "1,00 / 1,50 m" },
  { label: "Espesor de perfiles", value: "2,50 mm" },
];

const materialStats = [
  { value: "250 MPa", label: "Fy · límite de fluencia" },
  { value: "400–550 MPa", label: "Fu · resistencia a tracción" },
  { value: "200 GPa", label: "Módulo de elasticidad" },
  { value: "20 % mín.", label: "Alargamiento en 200 mm" },
];

const durabilidadStats = [
  { value: "80–100", unit: "µm de zinc", label: "Estándar GEU Structure" },
  { value: "450 °C", unit: "", label: "Inmersión en zinc fundido" },
  { value: "Zn–Fe", unit: "", label: "Aleación metalúrgica con el acero" },
  { value: "ASTM A123 / A153", unit: "", label: "Normas de referencia" },
  { value: "25 años", unit: "", label: "Vida útil objetivo de protección*" },
];

export default async function StructurePage() {
  const siteTexts = await getSiteTexts();
  const siteImages = await getSiteImages();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <StructureHeader />

      <section className="relative isolate flex min-h-screen flex-col overflow-hidden border-b border-white/10">
        <Image
          src={resolveImage("structure-hero", siteImages)}
          alt="Estructura fotovoltaica galvanizada al amanecer en la montaña"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover object-[50%_65%]"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.65)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center justify-center px-5 text-center md:px-8">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#0498b4]">
            Soluciones estructurales para proyectos fotovoltaicos
          </p>
          <h1 className="mt-4 font-[family:var(--font-display)] text-5xl font-black uppercase leading-none tracking-[0.02em] text-white/90 md:text-7xl">
            Estructuras que sostienen el futuro
          </h1>
          <p className="mt-5 max-w-xl text-sm font-semibold uppercase tracking-[0.1em] text-white/70 md:text-base">
            Ingeniería · Fabricación · Protección · Servicios en campo
          </p>
          <Link
            href="#producto"
            className="mt-8 inline-flex items-center gap-3 rounded-[3px] border border-[#0498b4]/70 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#0498b4] hover:bg-[#0498b4] hover:text-black"
          >
            Ver el producto M24 <span aria-hidden="true">→</span>
          </Link>
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
      </section>

      <section className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Propuesta de valor</p>
          <h2 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
            Una estructura. Un solo aliado técnico.
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600">
            GEU Structure integra ingeniería, fabricación y servicios para acompañar el proyecto desde el
            terreno hasta el montaje.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {propuesta.map((item) => (
              <div key={item.num} className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)]">
                <p className="text-xs font-black text-[#0498b4]">{item.num}</p>
                <h3 className="mt-2 text-lg font-black uppercase tracking-[-0.01em] text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="producto" className="border-b border-white/10 bg-black">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-[10px] border border-white/10 bg-white">
            <Image
              src={resolveImage("structure-producto-m24", siteImages)}
              alt="Estructura M24 biposte con módulos fotovoltaicos sobre pradera"
              width={1536}
              height={864}
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Producto</p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
              M24 | Estructura fija biposte
            </h2>
            <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-white/70">
              Configuración definida para proyectos fotovoltaicos de gran escala.
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-8">
              {especificaciones.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-white/50">{spec.label}</dt>
                  <dd className="mt-1 text-lg font-black text-white">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 inline-flex rounded-[3px] border border-[#0498b4]/40 bg-[#0498b4]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#0498b4]">
              Acero estructural ASTM A36 · Galvanizado por inmersión en caliente
            </p>
          </div>
        </div>
      </section>

      <section id="ingenieria" className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[1536/998] w-full max-w-[1920px]">
          {isVideoUrl(resolveImage("structure-viento-cfd", siteImages)) ? (
            <video
              src={resolveImage("structure-viento-cfd", siteImages)}
              poster="/geu-structure-viento-cfd.png"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={resolveImage("structure-viento-cfd", siteImages)}
              alt="Simulación CFD del flujo de viento sobre una estructura fotovoltaica"
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.05)_100%)]" />

          <div className="absolute inset-0 flex items-start">
            <div className="mx-auto w-full max-w-[1500px] px-5 pt-10 md:px-8 md:pt-16">
              <div className="mx-auto max-w-5xl text-center">
                <p className="flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
                  Ingeniería <span className="h-px w-10 bg-[#0498b4]" />
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-2xl font-black leading-[1.05] tracking-[-0.02em] text-white md:whitespace-nowrap md:text-4xl">
                  El viento también se diseña, no se supone
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-white/80 lg:max-w-none lg:whitespace-nowrap">
                  El análisis CFD permite visualizar el flujo y convertir presiones específicas en cargas para
                  la verificación estructural.
                </p>
                <p className="mt-5 inline-flex rounded-[3px] border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/70">
                  Software RWind 3 y RFEM 6
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="material" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 md:px-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-center">
          <div className="overflow-hidden rounded-[10px] border border-slate-200">
            <Image
              src={resolveImage("structure-material-perfiles", siteImages)}
              alt="Perfiles y láminas de acero estructural apilados"
              width={1024}
              height={1536}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Material</p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
              ASTM A36 | La base estructural del M24
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600">
              El ASTM A36 es la especificación de acero al carbono estructural de mayor difusión en la
              construcción metálica. Su combinación de resistencia moderada, ductilidad alta y soldabilidad sin
              precauciones especiales lo hace apropiado para elementos de conexión.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
              {materialStats.map((stat) => (
                <div key={stat.label} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                  <p className="text-lg font-black text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase leading-tight tracking-[0.05em] text-slate-500">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="durabilidad" className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Durabilidad</p>
          <h2 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
            Protección anticorrosiva diseñada para 25 años
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">
            El galvanizado se incorpora desde la especificación del proyecto como parte de la estrategia de
            vida útil.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {durabilidadStats.map((stat) => (
              <div key={stat.label} className="rounded-[10px] border border-white/10 bg-white/5 p-4">
                <p className="text-lg font-black text-white">
                  {stat.value}
                  {stat.unit && <span className="ml-1 text-xs font-bold text-white/60">{stat.unit}</span>}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase leading-tight tracking-[0.05em] text-white/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <GalvanizingProcess />

          <p className="mt-4 max-w-2xl text-xs font-semibold leading-5 text-white/40">
            *El espesor requerido se valida según la corrosividad y las condiciones específicas del proyecto;
            ambientes severos pueden requerir una especificación superior.
          </p>
        </div>
      </section>

      <section id="servicios" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Servicios</p>
          <h2 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
            GEU Structure en cada etapa del proyecto
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600">
            Servicios técnicos y operativos que complementan el suministro de la estructura.
          </p>

          <ServiciosTimeline
            images={{
              "structure-servicio-terreno": resolveImage("structure-servicio-terreno", siteImages),
              "structure-servicio-cimentacion": resolveImage("structure-servicio-cimentacion", siteImages),
              "structure-servicio-montaje": resolveImage("structure-servicio-montaje", siteImages),
              "structure-servicio-operacion": resolveImage("structure-servicio-operacion", siteImages),
            }}
          />
        </div>
      </section>

      <section id="contacto" className="relative overflow-hidden border-b border-white/10">
        <Image
          src={resolveImage("structure-hero", siteImages)}
          alt="Estructura fotovoltaica galvanizada en la montaña"
          fill
          sizes="100vw"
          className="absolute inset-0 object-cover object-[70%_35%]"
        />
        <div className="absolute inset-0 bg-black/72" />

        <div className="relative z-10 mx-auto max-w-[1500px] px-5 py-20 text-center md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">GEU Structure</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-white md:text-5xl">
            Ingeniería que se convierte en estructura.
          </h2>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.1em] text-white/60">
            M24 · Ingeniería estructural · Galvanizado · Servicios de campo
          </p>
          <Link
            href="mailto:innovation@geu.com.co"
            className="mt-8 inline-flex items-center gap-3 rounded-[3px] border border-[#0498b4]/70 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#0498b4] hover:bg-[#0498b4] hover:text-black"
          >
            Hablar con un ingeniero <span aria-hidden="true">→</span>
          </Link>

          <div className="mx-auto mt-16 flex max-w-xs flex-col items-center gap-3 border-t border-white/10 pt-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/45">
              ¿Buscas el autoservicio inteligente GEU?
            </p>
            <Link
              href="/autoservicio-inteligente"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.1em] text-white/80 hover:border-white/50 hover:text-white"
            >
              Innovation <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-structure.png"
        logoAlt="GEU Structure"
        logoWidth={190}
        tagline="Estructuras que sostienen el futuro."
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
