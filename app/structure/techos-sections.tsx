import Image from "next/image";
import Link from "next/link";
import ProductGallery from "./product-gallery";
import TechosProductTabs from "./techos-product-tabs";

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

const detalles = [
  { title: "Fijación del panel", slot: "structure-techos-detalle-panel" },
  { title: "Unión a la cubierta", slot: "structure-techos-detalle-cubierta" },
  { title: "Estructura de soporte", slot: "structure-techos-detalle-soporte" },
];

const cubiertas = [
  { num: "01", title: "Losa liviana", text: "Sistema de fijación para cubiertas tipo losa.", slot: "structure-techos-losa" },
  { num: "02", title: "Teja trapezoidal", text: "Componentes adaptados al perfil de la cubierta.", slot: "structure-techos-trapezoidal" },
  { num: "03", title: "Teja grafada", text: "Fijación para cubiertas de junta grafada.", slot: "structure-techos-grafada" },
  { num: "04", title: "Teja de barro", text: "Rieles y soportes para cubiertas de teja de barro.", slot: "structure-techos-barro" },
];

const materiales = [
  { title: "Aluminio", text: "Perfiles del sistema", icon: ProfileIcon },
  { title: "Clamps", text: "Fijación de módulos", icon: ClampIcon },
  { title: "Tornillería", text: "Componentes de ensamblaje", icon: BoltIcon },
  { title: "4 sistemas", text: "Tipos de cubierta del catálogo", icon: RoofIcon },
  { title: "Compatibilidad", text: "Según cubierta y proyecto", icon: LayersIcon },
];

const pasos = [
  { num: "01", title: "Perfiles", text: "Selección de componentes", icon: ProfileIcon },
  { num: "02", title: "Configuración", text: "Según tipo de cubierta", icon: RoofIcon },
  { num: "03", title: "Ensamblaje", text: "Unión de componentes", icon: ClampIcon },
  { num: "04", title: "Fijación", text: "Sistema correspondiente", icon: FootIcon },
  { num: "05", title: "Verificación", text: "Revisión de compatibilidad", icon: CheckDocIcon },
  { num: "06", title: "Instalación", text: "Según especificación técnica", icon: PanelIcon },
];

export default function TechosSections({
  images,
  quoteHref,
  quoteExternal,
}: {
  images: (slot: string) => string;
  quoteHref: string;
  quoteExternal: boolean;
}) {
  return (
    <>
      <section className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 pb-16 pt-10 md:px-8">
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

      <section id="producto-techos" className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-12 lg:items-stretch">
            <div>
              <ProductGallery
                theme="light"
                productName="Teja trapezoidal"
                items={[
                  {
                    src: images("structure-techos-producto"),
                    label: "Fijación sobre cubierta",
                    alt: "Sistema de fijación con perfiles de aluminio sobre cubierta metálica trapezoidal",
                  },
                  {
                    src: images("structure-techos-trapezoidal"),
                    label: "En contexto",
                    alt: "Paneles solares sobre cubierta trapezoidal con sistema de fijación de aluminio",
                  },
                  {
                    src: images("structure-techos-trapezoidal-render"),
                    label: "Componentes",
                    alt: "Render del sistema de fijación para teja trapezoidal con panel y soportes",
                  },
                  {
                    src: images("structure-techos-detalle-cubierta"),
                    label: "Unión a la cubierta",
                    alt: "Detalle del soporte atornillado a la cubierta trapezoidal",
                  },
                  {
                    src: images("structure-techos-detalle-panel"),
                    label: "Fijación del panel",
                    alt: "Detalle del clamp que fija el panel al perfil de aluminio",
                  },
                ]}
              />
            </div>

            <div className="flex flex-col">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Producto</p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-neutral-900 md:text-[2.75rem] md:leading-[1.05]">
                Sistema de fijación para teja trapezoidal
              </h2>
              <p className="mt-4 max-w-md text-[15px] font-semibold leading-7 text-neutral-600">
                Sistema de montaje para paneles solares sobre cubierta metálica trapezoidal, con perfiles de
                aluminio y componentes de fijación.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-[#0498b4]/40 bg-[#0498b4]/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0498b4]">
                  Perfiles de aluminio
                </span>
                <span className="inline-flex rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-neutral-500">
                  Sistema de fijación
                </span>
              </div>

              <div className="mt-auto pt-10">
                <dl className="grid grid-cols-3 gap-4 border-t border-black/10 pt-6">
                  {[
                    { value: "4", label: "Tipos de cubierta" },
                    { value: "Aluminio", label: "Material de perfiles" },
                    { value: "GEU", label: "Soluciones para techos" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <dd className="font-[family:var(--font-display)] text-2xl font-black tracking-[-0.02em] text-neutral-900 md:text-[1.75rem]">
                        {stat.value}
                      </dd>
                      <dt className="mt-1 text-[10px] font-bold uppercase leading-tight tracking-[0.06em] text-neutral-400">
                        {stat.label}
                      </dt>
                    </div>
                  ))}
                </dl>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={quoteHref}
                    target={quoteExternal ? "_blank" : undefined}
                    rel={quoteExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] bg-[#0498b4] px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#03809a]"
                  >
                    Solicitar cotización <span aria-hidden="true">→</span>
                  </a>
                  <Link
                    href="#material-techos"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-[3px] border border-neutral-300 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
                  >
                    Ver componentes
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <TechosProductTabs />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[1941/809] w-full max-w-[1920px]">
          <Image
            src={images("structure-techos-banner")}
            alt="Paneles solares sobre la cubierta de una bodega industrial al atardecer"
            fill
            sizes="100vw"
            className="object-cover"
          />
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
                Los sistemas de fijación para paneles solares incorporan perfiles de aluminio y componentes de
                ensamblaje para adaptarse a distintas tipologías de cubierta.
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
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0498b4]">Detalles del sistema</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {detalles.map((item) => (
                <figure
                  key={item.slot}
                  className="group relative aspect-[3/2] overflow-hidden rounded-[14px] bg-neutral-900 shadow-[0_14px_36px_rgba(15,23,42,0.10)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(4,152,180,0.16)]"
                >
                  <Image
                    src={images(item.slot)}
                    alt={item.title}
                    fill
                    sizes="(min-width: 640px) 440px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <figcaption className="absolute inset-x-0 bottom-0 p-4">
                    <span className="inline-block h-[3px] w-8 bg-[#0498b4]" />
                    <span className="mt-2 block text-[12px] font-bold uppercase leading-tight tracking-[0.04em] text-white">
                      {item.title}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cubiertas" className="border-b border-white/10 bg-white text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Soluciones para techos</p>
              <h2 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] md:text-4xl">
                Un sistema de fijación para cada cubierta
              </h2>
            </div>
            <p className="max-w-sm text-sm font-semibold leading-6 text-slate-600">
              Soluciones para integrar paneles solares en distintas tipologías de techo, con perfiles de aluminio
              y componentes de ensamblaje.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cubiertas.map((item) => (
              <li
                key={item.num}
                className="group relative aspect-[3/4] overflow-hidden rounded-[16px] bg-neutral-900 shadow-[0_18px_44px_rgba(15,23,42,0.14)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(4,152,180,0.22)]"
              >
                <Image
                  src={images(item.slot)}
                  alt={`Sistema de fijación para ${item.title.toLowerCase()}`}
                  fill
                  sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
                <span className="absolute right-4 top-4 font-[family:var(--font-display)] text-4xl font-black leading-none text-white/60 transition-colors group-hover:text-[#0498b4]">
                  {item.num}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="inline-block h-[3px] w-8 bg-[#0498b4]" />
                  <h3 className="mt-3 text-base font-black uppercase tracking-[0.02em] text-white">{item.title}</h3>
                  <p className="mt-1.5 text-[12px] font-semibold leading-[1.45] text-white/75">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <a
            href="#material-techos"
            className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-[#0498b4] transition-colors hover:text-[#03809a]"
          >
            Perfiles de aluminio y componentes para sistemas de fijación <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section id="materiales-techos" className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">Materiales y durabilidad</p>
          <h2 className="mt-3 max-w-3xl font-[family:var(--font-display)] text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
            Cada componente, seleccionado para su función
          </h2>
          <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-white/70">
            Perfiles de aluminio y componentes de fijación para sistemas solares sobre distintas tipologías de
            cubierta.
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
            Las especificaciones y compatibilidades deben validarse para cada sistema de fijación.
          </p>
        </div>
      </section>
    </>
  );
}
