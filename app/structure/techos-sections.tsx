import Image from "next/image";
import { isVideoUrl } from "@/lib/image-slots";
import TechosCubiertas, { type Cubierta } from "./techos-cubiertas";

// Contenido de la línea "Techos" de GEU Structure (sistemas de fijación para
// paneles solares sobre cubierta). Fuente: para techos.pdf (Drive › STRUCTURE › PARA TECHOS).

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function RulerIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 16 16 4l4 4L8 20 4 16Z" />
      <path d="m9.5 10.5 1.5 1.5M12.5 7.5 14 9M6.5 13.5 8 15" />
    </svg>
  );
}

function LayersIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}

function ShieldIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function RoofIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M2 18 8 7h8l6 11H2Z" />
      <path d="m8 7 6 11M12 7l6 11" />
    </svg>
  );
}

function ProfileIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M4 9 13 4l7 4-9 5-7-4Z" />
      <path d="M4 9v6l7 4 9-5V8" />
      <path d="M11 13v6" />
    </svg>
  );
}

function ClampIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M6 20V9h5v4h4V5h3v15" />
      <path d="M4 20h16" />
      <path d="M8.5 9V6.5" />
    </svg>
  );
}

function BoltIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="m14 4 6 6-3 3-6-6 3-3Z" />
      <path d="m11 10-7 7 3 3 7-7" />
      <path d="m7 15 2 2M9 13l2 2" />
    </svg>
  );
}

function GroundIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M12 3v9" />
      <path d="M5 12h14M8 16h8M10.5 20h3" />
    </svg>
  );
}

function CheckDocIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M14 3H6v18h7" />
      <path d="M14 3l4 4v5" />
      <path d="M9 9h5M9 13h4" />
      <circle cx="17" cy="17" r="3.5" />
      <path d="m15.5 17 1 1 2-2" />
    </svg>
  );
}

function PanelIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M5 6h14l2 12H3L5 6Z" />
      <path d="M4 12h16M9.5 6l-1 12M14.5 6l1 12" />
    </svg>
  );
}

function FootIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg {...iconProps} className={className}>
      <path d="M10 4h4v3h-4zM12 7v8" />
      <path d="M5 17l3-2h8l3 2v2H5v-2Z" />
    </svg>
  );
}

const propuesta = [
  {
    num: "01",
    title: "Ingeniería",
    text: "Selección del sistema de fijación según el tipo de cubierta y las condiciones del proyecto.",
    icon: RulerIcon,
  },
  {
    num: "02",
    title: "Perfiles y componentes",
    text: "Perfiles de aluminio, clamps, tornillería y accesorios para el ensamblaje del sistema.",
    icon: LayersIcon,
  },
  {
    num: "03",
    title: "Sistemas de fijación",
    text: "Soluciones para losa, teja trapezoidal, teja grafada y teja de barro.",
    icon: ShieldIcon,
  },
  {
    num: "04",
    title: "Aplicación en cubiertas",
    text: "Configuraciones de montaje adaptadas a distintas superficies de techo.",
    icon: RoofIcon,
  },
];

const componentes = [
  { label: "Perfiles", icon: ProfileIcon },
  { label: "Clamps", icon: ClampIcon },
  { label: "Tornillería", icon: BoltIcon },
  { label: "Conexión a tierra", icon: GroundIcon },
];

const materiales = [
  { title: "AA6005 T5", text: "Aluminio extruido de los perfiles", icon: ProfileIcon },
  { title: "Clamps", text: "Marcos de panel de 30, 35 y 40 mm", icon: ClampIcon },
  { title: "Acero inox", text: "Tornillería M8 y 5/16”", icon: BoltIcon },
  { title: "AISI 304", text: "Platinas y soportes en acero inoxidable", icon: ShieldIcon },
  { title: "EPDM", text: "Empaques y caucho espuma", icon: LayersIcon },
];

// Perfiles de aluminio extruido usados en los sistemas (guía de fabricación ALUMINA).
const perfiles = [
  { code: "SOLAR0011", name: "Perfil clamp principal", length: "3 m" },
  { code: "SOLAR0014M", name: "Perfil end clamp", length: "3 m" },
  { code: "SOLAR0015M", name: "Perfil mid clamp", length: "3 m" },
  { code: "SOLAR0020", name: "Riel liviano", length: "3 m" },
  { code: "SOLAR0021", name: "Riel principal", length: "6 m" },
  { code: "SOLAR0022", name: "Riel base losa", length: "6 m" },
  { code: "SOLAR0016", name: "Perfil mordaza base", length: "3 m" },
  { code: "SOLAR0017", name: "Perfil mordaza", length: "3 m" },
  { code: "SOLAR0005", name: "Perfil anclaje en L", length: "3 m" },
  { code: "SOLAR0008", name: "Perfil conexión a tierra", length: "3 m" },
  { code: "PLATI0030", name: "Platina unión base losa", length: "3 m" },
  { code: "ANGU0019", name: "Ángulo unión riel", length: "3 m" },
  { code: "ANGU0028", name: "Ángulo vertical a losa", length: "3 m" },
  { code: "TUBOR0004", name: "Tubo para anclaje en L", length: "3 m" },
];

const especificacionesBase = [
  { label: "Perfiles", value: "Aluminio AA6005 T5" },
  { label: "Tornillería", value: "Acero inoxidable" },
  { label: "Marco del panel", value: "30 · 35 · 40 mm" },
  { label: "Longitud de perfiles", value: "3 m · rieles 6 m" },
];

const pasos = [
  { num: "01", title: "Perfiles", text: "Selección de componentes", icon: ProfileIcon },
  { num: "02", title: "Configuración", text: "Según tipo de cubierta", icon: RoofIcon },
  { num: "03", title: "Ensamblaje", text: "Unión de componentes", icon: ClampIcon },
  { num: "04", title: "Fijación", text: "Sistema correspondiente", icon: FootIcon },
  { num: "05", title: "Verificación", text: "Revisión de compatibilidad", icon: CheckDocIcon },
  { num: "06", title: "Instalación", text: "Según especificación técnica", icon: PanelIcon },
];

function buildCubiertas(images: (slot: string) => string): Cubierta[] {
  return [
    {
      id: "losa",
      num: "01",
      title: "Losa",
      text: "Verticales tipo A y B sobre riel base losa.",
      description:
        "Sistema para superficies planas tipo losa: verticales de aluminio tipo A y B sobre riel base losa con caucho espuma EPDM, en versión liviana o con riel principal.",
      cover: images("structure-techos-losa"),
      shots: [
        { src: images("structure-techos-losa"), label: "En contexto", alt: "Paneles solares sobre losa con sistema de fijación de aluminio" },
        { src: images("structure-techos-losa-render"), label: "Componentes", alt: "Render del sistema de fijación para losa con panel, rieles y verticales" },
      ],
      detalles: [
        { title: "End clamp", src: images("structure-techos-losa-end-clamp") },
        { title: "Mid clamp", src: images("structure-techos-losa-mid-clamp") },
        { title: "Vertical losa tipo A", src: images("structure-techos-losa-vertical-a") },
      ],
      descripcion: [
        { label: "Aplicación", value: "Losa / superficie plana" },
        { label: "Configuraciones", value: "Liviano · Riel completo" },
        { label: "Apoyo", value: "Vertical losa tipo A y B" },
        { label: "Sujeción del panel", value: "End clamp y mid clamp" },
      ],
      configuraciones: [
        {
          nombre: "liviano",
          componentes: [
            "End clamp",
            "Mid clamp",
            "Vertical losa tipo A",
            "Vertical losa tipo B",
            "Riel base losa",
            "Caucho espuma EPDM",
            "Unión base losa",
            "Conector a tierra",
          ],
        },
        {
          nombre: "riel completo",
          componentes: [
            "End clamp",
            "Mid clamp",
            "Riel principal",
            "Vertical losa RC tipo A",
            "Vertical losa RC tipo B",
            "Riel base losa",
            "Caucho espuma EPDM",
            "Unión base losa",
            "Unión riel",
            "Conector a tierra",
          ],
        },
      ],
      especificaciones: [
        ...especificacionesBase,
        { label: "Vertical losa", value: "A 100 mm · B 200 mm" },
        { label: "Caucho espuma", value: "EPDM 50 Shore 00" },
        { label: "Riel base losa", value: "SOLAR0022" },
        { label: "Unión base losa", value: "PLATI0030" },
      ],
    },
    {
      id: "trapezoidal",
      num: "02",
      title: "Teja trapezoidal",
      text: "Platina o anclaje en L sobre la cresta de la teja.",
      description:
        "Sistema para cubierta metálica trapezoidal: en la versión liviana el panel se apoya en mini rieles de 330 mm sobre platinas en acero inoxidable; en riel completo, sobre riel principal con anclajes en L.",
      cover: images("structure-techos-trapezoidal"),
      shots: [
        { src: images("structure-techos-trapezoidal"), label: "En contexto", alt: "Paneles solares sobre cubierta trapezoidal con sistema de fijación de aluminio" },
        { src: images("structure-techos-trapezoidal-render"), label: "Componentes", alt: "Render del sistema de fijación para teja trapezoidal con panel y soportes" },
      ],
      detalles: [
        { title: "End clamp", src: images("structure-techos-trapezoidal-end-clamp") },
        { title: "Mid clamp", src: images("structure-techos-trapezoidal-mid-clamp") },
        { title: "Clip de fijación", src: images("structure-techos-trapezoidal-clip") },
      ],
      descripcion: [
        { label: "Aplicación", value: "Teja trapezoidal" },
        { label: "Configuraciones", value: "Liviano · Riel completo" },
        { label: "Fijación a la teja", value: "Platina o anclaje en L" },
        { label: "Sujeción del panel", value: "End clamp y mid clamp" },
      ],
      configuraciones: [
        {
          nombre: "liviano",
          componentes: ["End clamp", "Mid clamp", "Mini riel 330 mm", "Platina teja trapezoidal"],
        },
        {
          nombre: "riel completo",
          componentes: ["End clamp", "Mid clamp", "Riel principal", "Anclaje en L", "Unión riel", "Conector a tierra"],
        },
      ],
      especificaciones: [
        ...especificacionesBase,
        { label: "Platina", value: "Acero inox AISI 304" },
        { label: "Empaque de platina", value: "EPDM adhesivo 2,5 mm" },
        { label: "Anclaje en L", value: "SOLAR0005 + TUBOR0004" },
        { label: "Altura del anclaje", value: "Según cresta de la teja" },
      ],
    },
    {
      id: "grafada",
      num: "03",
      title: "Teja grafada",
      text: "TG clamp sujeto a la junta grafada.",
      description:
        "Sistema para cubiertas de junta grafada: el TG clamp, formado por mordaza y mordaza base, va sobre la junta grafada y recibe el panel directamente (versión liviana) o a través del riel principal.",
      cover: images("structure-techos-grafada"),
      shots: [
        { src: images("structure-techos-grafada"), label: "En contexto", alt: "Paneles solares sobre cubierta de junta grafada" },
        { src: images("structure-techos-grafada-render"), label: "Componentes", alt: "Render del sistema de fijación para teja grafada con panel y TG clamps" },
      ],
      detalles: [
        { title: "End clamp", src: images("structure-techos-grafada-end-clamp") },
        { title: "Mid clamp", src: images("structure-techos-grafada-mid-clamp") },
        { title: "Clip de fijación a la junta", src: images("structure-techos-grafada-clip") },
      ],
      descripcion: [
        { label: "Aplicación", value: "Teja grafada" },
        { label: "Configuraciones", value: "Liviano · Riel completo" },
        { label: "Fijación a la teja", value: "TG clamp / TG clamp mini" },
        { label: "Sujeción del panel", value: "End clamp y mid clamp" },
      ],
      configuraciones: [
        {
          nombre: "liviano",
          componentes: ["End clamp", "Mid clamp", "TG clamp mini"],
        },
        {
          nombre: "riel completo",
          componentes: ["End clamp", "Mid clamp", "TG clamp", "Riel principal", "Unión riel", "Conector a tierra"],
        },
      ],
      especificaciones: [
        ...especificacionesBase,
        { label: "Mordaza", value: "SOLAR0017" },
        { label: "Mordaza base", value: "SOLAR0016" },
        { label: "Riel del TG clamp", value: "SOLAR0020" },
        { label: "Riel principal", value: "SOLAR0021" },
      ],
    },
    {
      id: "barro",
      num: "04",
      title: "Teja de barro",
      text: "Soporte en acero inoxidable y riel principal.",
      description:
        "Sistema de riel completo para cubiertas de teja de barro: soportes en acero inoxidable AISI 304 con anclaje en L que reciben el riel principal sobre el que se fijan los paneles.",
      cover: images("structure-techos-barro"),
      shots: [
        { src: images("structure-techos-barro"), label: "En contexto", alt: "Paneles solares sobre cubierta de teja de barro con rieles de aluminio" },
        { src: images("structure-techos-barro-render"), label: "Componentes", alt: "Render del sistema de fijación para teja de barro con rieles y soportes" },
      ],
      detalles: [
        { title: "End clamp con pin a tierra", src: images("structure-techos-barro-end-clamp-pin") },
        { title: "Soporte teja de barro", src: images("structure-techos-barro-soporte") },
        { title: "Anclaje en L", src: images("structure-techos-barro-anclaje-l") },
      ],
      descripcion: [
        { label: "Aplicación", value: "Teja de barro" },
        { label: "Configuración", value: "Riel completo" },
        { label: "Fijación a la cubierta", value: "Soporte teja de barro" },
        { label: "Sujeción del panel", value: "End clamp y mid clamp" },
      ],
      configuraciones: [
        {
          nombre: "riel completo",
          componentes: [
            "End clamp",
            "Mid clamp",
            "Riel principal",
            "Anclaje en L",
            "Soporte teja de barro",
            "Unión riel",
            "Conector a tierra",
          ],
        },
      ],
      especificaciones: [
        ...especificacionesBase,
        { label: "Soporte teja de barro", value: "Acero inox AISI 304" },
        { label: "Fabricación del soporte", value: "Corte láser y doblez" },
        { label: "Riel principal", value: "SOLAR0021 · 6 m" },
        { label: "Anclaje en L", value: "SOLAR0005 + TUBOR0004" },
      ],
    },
  ];
}

export default function TechosSections({
  images,
  whatsappNumber,
}: {
  images: (slot: string) => string;
  whatsappNumber: string | null;
}) {
  const cubiertas = buildCubiertas(images);

  return (
    <>
      <TechosCubiertas cubiertas={cubiertas} whatsappNumber={whatsappNumber} />

      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[1941/809] w-full max-w-[1920px]">
          {isVideoUrl(images("structure-techos-banner")) ? (
            <video
              src={images("structure-techos-banner")}
              poster="/geu-structure-techos-banner.webp"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Paneles solares sobre la cubierta de una bodega industrial al atardecer"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Image
              src={images("structure-techos-banner")}
              alt="Paneles solares sobre la cubierta de una bodega industrial al atardecer"
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
      </section>

      <section id="material-techos" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-14 lg:items-stretch">
            <div className="group relative min-h-[340px] overflow-hidden rounded-[16px] bg-neutral-900 shadow-[0_18px_44px_rgba(15,23,42,0.14)] ring-1 ring-black/5">
              <Image
                src={images("structure-techos-material")}
                alt="Perfiles de aluminio y clamps del sistema de fijación sobre cubierta metálica"
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Material</p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
                Perfiles de aluminio | Precisión en cada fijación
              </h2>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                Los sistemas se fabrican con perfiles de aluminio extruido ALUMINA en aleación AA6005 T5 y
                tornillería en acero inoxidable. Con sus componentes se instalan sistemas fotovoltaicos sobre losas
                y sobre tejas trapezoidales, grafadas o de barro de manera rápida y confiable.
              </p>

              <div className="mt-8 border-t border-slate-200 pt-8">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0498b4]">Componentes del sistema</p>
                <ul className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {componentes.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.label} className="flex flex-col gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0498b4]/10 text-[#0498b4]">
                          <Icon className="h-6 w-6" />
                        </span>
                        <span className="text-[11px] font-black uppercase tracking-[0.08em] text-neutral-900">
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-200 pt-8">
            <details className="group/perfiles">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0498b4]">Perfiles del sistema</span>
                <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-600 transition-colors hover:text-slate-900">
                  <span className="group-open/perfiles:hidden">Ver los {perfiles.length} perfiles</span>
                  <span className="hidden group-open/perfiles:inline">Ocultar perfiles</span>
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-open/perfiles:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <ul className="mt-5 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
                {perfiles.map((item) => (
                  <li key={item.code} className="flex items-baseline gap-3 border-b border-slate-200/70 py-2.5">
                    <span className="w-[5.5rem] shrink-0 font-mono text-[11px] font-semibold text-[#0498b4]">{item.code}</span>
                    <span className="text-[13px] font-semibold text-slate-700">{item.name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] font-semibold text-slate-400">
                Aluminio extruido · acabado crudo · perfiles de 3 m y rieles principal y base losa de 6 m · consulta otras
                longitudes y acabados.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:py-20 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Propuesta de valor</p>
          <h2 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
            Una solución. Cuatro sistemas de fijación.
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-600">
            GEU Structure reúne soluciones de fijación para paneles solares en diferentes tipos de cubierta,
            con perfiles de aluminio y componentes de ensamblaje.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {propuesta.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="group relative flex flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0498b4]/50 hover:shadow-[0_22px_48px_rgba(4,152,180,0.14)]"
                >
                  <span className="absolute inset-x-0 top-0 h-[3px] w-0 bg-[#0498b4] transition-all duration-300 group-hover:w-full" />
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0498b4]/10 text-[#0498b4] transition-colors group-hover:bg-[#0498b4] group-hover:text-white">
                      <Icon />
                    </span>
                    <span className="font-[family:var(--font-display)] text-2xl font-black leading-none text-slate-200">
                      {item.num}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-black uppercase tracking-[-0.01em] text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="materiales-techos" className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Materiales y durabilidad</p>
          <h2 className="mt-3 max-w-3xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
            Cada componente, seleccionado para su función
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">
            Aluminio extruido en los perfiles, acero inoxidable en la tornillería, platinas y soportes, y
            caucho EPDM en los puntos de contacto con la cubierta.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {materiales.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-3 rounded-[10px] border border-white/10 bg-white/5 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/80">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-black uppercase text-white">{item.title}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase leading-tight tracking-[0.05em] text-white/50">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <ol className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {pasos.map((step, index) => {
              const last = index === pasos.length - 1;
              return (
                <li
                  key={step.num}
                  className={`group flex flex-col items-center rounded-[10px] border p-5 text-center transition-colors ${
                    last
                      ? "border-[#0498b4] bg-[#0498b4]/10"
                      : "border-white/10 bg-white/[0.03] hover:border-[#0498b4]/60"
                  }`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${last ? "text-[#0498b4]" : "text-white/50"}`}>
                    Paso {step.num}
                  </p>
                  <span className={`mt-4 ${last ? "text-[#0498b4]" : "text-white/80 group-hover:text-[#0498b4]"}`}>
                    <step.icon className="h-9 w-9" />
                  </span>
                  <p className="mt-4 text-sm font-black uppercase text-white">{step.title}</p>
                  <p className="mt-1 text-[12px] font-semibold leading-snug text-white/60">{step.text}</p>
                </li>
              );
            })}
          </ol>

          <p className="mt-6 flex items-center gap-3 rounded-[10px] border border-white/10 px-5 py-4 text-xs font-semibold leading-5 text-white/60">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#0498b4] text-[11px] font-black text-[#0498b4]">
              i
            </span>
            Los accesorios indicados son de gran importancia para el correcto desempeño del sistema. Las
            especificaciones y compatibilidades deben validarse para cada proyecto.
          </p>
        </div>
      </section>
    </>
  );
}
