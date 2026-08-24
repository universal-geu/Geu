import Image from "next/image";
import EnergyHeader from "../../energy-header";
import StructureTypeGrid from "./structure-type-grid";
import ApplicationsGallery from "./applications-gallery";
import { CatalogMobileNav, CatalogSidebarNav, type CatalogNavItem } from "./catalog-nav";
import { getWhatsAppNumber } from "@/lib/site-settings";

const FALLBACK_WHATSAPP_NUMBER = "573017690955";

export const dynamic = "force-dynamic";

const tiposEstructura = [
  {
    nombre: "Monoposte",
    imagen: "/energy-estructura-monoposte.jpg",
    texto: "Un solo poste central por línea de módulos, ideal para terrenos con buena capacidad portante.",
  },
  {
    nombre: "Biposte",
    imagen: "/energy-estructura-biposte.jpg",
    texto: "Dos hileras de postes que reparten mejor la carga, pensado para configuraciones más grandes.",
  },
  {
    nombre: "Chinese hat",
    imagen: "/energy-estructura-chinesehat.jpg",
    texto: "Estructura tipo carpa con paneles a dos aguas desde una cumbrera central.",
  },
  {
    nombre: "Carport",
    imagen: "/energy-estructura-carport.jpg",
    texto: "Cubierta solar para parqueaderos: genera energía y da sombra al mismo tiempo.",
  },
];

const descripcionGeneral = [
  { etiqueta: "Modelo", valor: "GEU-EF-14.6x5.5" },
  { etiqueta: "Tipo de estructura", valor: "Fija" },
  { etiqueta: "Dimensiones generales (L x A)", valor: "14,60 m x 5,50 m" },
  { etiqueta: "Inclinación", valor: "4°" },
  { etiqueta: "Altura frontal", valor: "1,00 m" },
  { etiqueta: "Altura posterior", valor: "1,50 m" },
  { etiqueta: "Separación entre apoyos (eje a eje)", valor: "3,40 m" },
  { etiqueta: "Cantidad de columnas", valor: "10 unidades (5 frontales + 5 posteriores)" },
  { etiqueta: "Material principal", valor: "Acero al carbono ASTM A36" },
  { etiqueta: "Protección superficial", valor: "Zincado en caliente" },
  { etiqueta: "Capacidad de módulos", valor: "Configuración según proyecto" },
  { etiqueta: "Norma de diseño", valor: "AISC 360 / ASCE 7-16" },
  { etiqueta: "Vida útil estimada", valor: "≥ 25 años" },
];

const vistasDimensiones = [
  { vista: "Vista superior", detalle: "14,60 m de largo x 5,50 m de ancho" },
  { vista: "Vista frontal", detalle: "Altura frontal 1,00 m, separación entre apoyos 3,40 m x 4 tramos" },
  { vista: "Vista lateral", detalle: "Inclinación de 4°, altura posterior 1,50 m" },
];

const componentesPrincipales = [
  { codigo: "P1", descripcion: "Viga principal", perfil: "Perfil C 100x50x2.5 mm x 7.30 m", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "P2", descripcion: "Vigueta secundaria", perfil: "Perfil C 100x50x2.5 mm x 5.50 m", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "P3", descripcion: "Columna frontal", perfil: "Tubo cuadrado 100x100x2.5 mm x 1.00 m", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "P4", descripcion: "Columna posterior", perfil: "Tubo cuadrado 100x100x2.5 mm x 1.50 m", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "H1", descripcion: "Conector viga - vigueta (externo)", perfil: "Platina 4.76 mm", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "H2", descripcion: "Conector viga - vigueta (interno)", perfil: "Platina 4.76 mm", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "H3", descripcion: "Conector columna - mesa", perfil: "Platina 4.76 mm", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "H4", descripcion: "Platina base", perfil: "300x300x6.35 mm", material: "ASTM A36", acabado: "Zincado" },
  { codigo: "H5", descripcion: "Sistema de anclaje", perfil: "Espárrago 5/8\" x 250 mm, tuerca/arandela 5/8\"", material: "Galvanizado", acabado: "Galvanizado" },
];

const perfilesEstructurales = [
  { etiqueta: "Acero al carbono", valor: "ASTM A36" },
  { etiqueta: "Límite de fluencia (Fy)", valor: "250 MPa (mín.)" },
  { etiqueta: "Resistencia a la tracción (Fu)", valor: "400 - 550 MPa" },
  { etiqueta: "Espesor de perfiles", valor: "2.50 mm" },
];

const tornilleria = [
  { etiqueta: "Tornillos", valor: "ASTM A307 / A325" },
  { etiqueta: "Tuercas", valor: "ASTM A194 Gr. 2H" },
  { etiqueta: "Arandelas", valor: "ASTM F436" },
  { etiqueta: "Recubrimiento", valor: "Zincado" },
];

const capacidadesCarga = [
  { tipo: "Carga de viento", valor: "Hasta 50 m/s (180 km/h)", norma: "ASCE 7-16", observaciones: "Según zona del proyecto" },
  { tipo: "Carga de nieve", valor: "Hasta 0.75 kN/m²", norma: "ASCE 7-16", observaciones: "Según zona del proyecto" },
  { tipo: "Carga muerta", valor: "Depende de configuración de módulos", norma: "AISC 360", observaciones: "" },
];

const caracteristicasBeneficios = [
  {
    titulo: "Alta resistencia estructural",
    texto: "Diseño optimizado para soportar cargas de viento y nieve según normativa.",
  },
  {
    titulo: "Durabilidad",
    texto: "Protección anticorrosiva por zincado en caliente que garantiza larga vida útil.",
  },
  {
    titulo: "Instalación eficiente",
    texto: "Sistema modular con componentes pre-perforados y de fácil ensamblaje.",
  },
  {
    titulo: "Compatibilidad",
    texto: "Adaptable a diferentes configuraciones de módulos fotovoltaicos.",
  },
];

const aplicacionesFotos = [
  {
    titulo: "Proyectos fotovoltaicos residenciales",
    texto: "Techos residenciales con retorno de inversión rápido.",
    imagen: "/energy-aplicacion-residencial.jpg",
  },
  {
    titulo: "Estacionamientos solares (Carport)",
    texto: "Cubiertas solares para parqueaderos: generan energía y dan sombra.",
    imagen: "/energy-aplicacion-carport.jpg",
  },
  {
    titulo: "Parques solares a gran escala",
    texto: "Instalaciones de montaje en tierra para proyectos de gran escala.",
    imagen: "/energy-aplicacion-parque.jpg",
  },
];

const aplicacionesTexto = ["Proyectos fotovoltaicos comerciales"];

const navItems: CatalogNavItem[] = [
  { id: "tipos", label: "Tipos de estructuras" },
  { id: "descripcion", label: "Descripción general" },
  { id: "vistas", label: "Vistas y dimensiones" },
  { id: "componentes", label: "Componentes principales" },
  { id: "materiales", label: "Materiales y fijaciones" },
  { id: "cimentacion", label: "Cimentación recomendada" },
  { id: "beneficios", label: "Características y beneficios" },
  { id: "cargas", label: "Capacidades de carga" },
  { id: "aplicaciones", label: "Aplicaciones" },
];

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const iconExpand = (
  <IconBase>
    <path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" />
  </IconBase>
);

const iconHex = (
  <IconBase>
    <path d="M10 2.5 16.5 6.25v7.5L10 17.5 3.5 13.75v-7.5L10 2.5Z" />
    <circle cx="10" cy="10" r="2" />
  </IconBase>
);

const iconShield = (
  <IconBase>
    <path d="M10 2.5 16 4.5v5c0 4-2.7 6.7-6 8-3.3-1.3-6-4-6-8v-5L10 2.5Z" />
    <path d="m7.3 10 1.8 1.8L13 8" />
  </IconBase>
);

const sectionIcons = {
  tipos: (
    <IconBase>
      <rect x="3" y="3" width="6" height="6" rx="1.2" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" />
    </IconBase>
  ),
  descripcion: (
    <IconBase>
      <rect x="4" y="2.5" width="12" height="15" rx="1.5" />
      <path d="M7 7h6M7 10.5h6M7 14h4" />
    </IconBase>
  ),
  vistas: iconExpand,
  componentes: iconHex,
  materiales: (
    <IconBase>
      <path d="M10 3 17 7l-7 4-7-4 7-4Z" />
      <path d="M3 10l7 4 7-4" />
      <path d="M3 13.5l7 4 7-4" />
    </IconBase>
  ),
  cimentacion: (
    <IconBase>
      <path d="M10 3v8M6 17l1-4h6l1 4M5 17h10" />
    </IconBase>
  ),
  beneficios: iconShield,
  cargas: (
    <IconBase>
      <path d="M4 17V9M10 17V4M16 17v6" />
    </IconBase>
  ),
  aplicaciones: (
    <IconBase>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.5" />
      <circle cx="10" cy="10" r="0.7" fill="currentColor" />
    </IconBase>
  ),
};

const iconViento = (
  <IconBase>
    <path d="M3 7h9a2.5 2.5 0 1 0-2.5-2.5" />
    <path d="M3 11h12a2.5 2.5 0 1 1-2.5 2.5" />
    <path d="M3 15h7" />
  </IconBase>
);

const specHighlights = [
  { label: "Material", valor: "Acero ASTM A36 zincado", icon: iconHex },
  { label: "Vida útil", valor: "≥ 25 años", icon: iconShield },
  { label: "Carga de viento", valor: "Hasta 180 km/h", icon: iconViento },
];

function SectionHeading({
  index,
  title,
  icon,
}: {
  index: number;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdf1d6] text-[#b17800]">
        {icon}
      </span>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#b17800]">
          Sección {String(index).padStart(2, "0")}
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.01em] text-slate-950 md:text-[28px]">{title}</h2>
      </div>
    </div>
  );
}

function Table({ rows }: { rows: { etiqueta: string; valor: string }[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      {rows.map((row, index) => (
        <div
          key={row.etiqueta}
          className={`grid grid-cols-[1fr_1.2fr] ${index < rows.length - 1 ? "border-b border-slate-100" : ""}`}
        >
          <div className="bg-slate-50 px-5 py-3 text-sm font-bold text-slate-500">{row.etiqueta}</div>
          <div className="px-5 py-3 text-sm font-semibold text-slate-900">{row.valor}</div>
        </div>
      ))}
    </div>
  );
}

export default async function EnergyCatalogoPage() {
  const whatsappNumber = (await getWhatsAppNumber()) ?? FALLBACK_WHATSAPP_NUMBER;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hola, quiero solicitar una cotización de la estructura fija para paneles solares GEU-EF-14.6x5.5.",
  )}`;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <EnergyHeader />

      <section className="relative overflow-hidden border-b border-white/10 bg-black pt-20">
        <div className="relative aspect-[2048/560] w-full">
          <Image
            src="/geu-energy-hero-field.png"
            alt="Estructura fija para paneles solares GEU Energy"
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1500px] px-5 md:px-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ffd400]">Ficha técnica</p>
            <h1 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-4xl font-black leading-[0.95] tracking-[-0.02em] text-white md:text-6xl">
              Estructura fija para paneles solares
            </h1>
            <span className="mt-5 inline-flex rounded-full border border-[#ffd400] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#ffd400]">
              Modelo: GEU-EF-14.6x5.5
            </span>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-[0.06em] text-white/85">
              {["Diseño resistente", "Durable", "Eficiente"].map((label, index) => (
                <span key={label} className="flex items-center gap-3">
                  {index > 0 && <span className="text-white/40">•</span>}
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[#ffd400]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m4 10 4 4 8-8" />
                    </svg>
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-9 max-w-[1500px] px-5 md:-mt-12 md:px-8">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[14px] border border-slate-200 bg-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.14)] sm:grid-cols-3">
          {specHighlights.map((spec) => (
            <div key={spec.label} className="flex items-center gap-3 bg-white px-5 py-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fdf1d6] text-[#b17800]">
                {spec.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{spec.label}</p>
                <p className="truncate text-sm font-black text-slate-900">{spec.valor}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CatalogMobileNav items={navItems} />

      <div className="mx-auto max-w-[1500px] px-5 pt-10 md:px-8">
        <div className="lg:grid lg:grid-cols-[224px_1fr] lg:gap-14">
          <CatalogSidebarNav items={navItems} />

          <div className="min-w-0">
            <section id="tipos" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={1} title="Tipos de estructuras fijas" icon={sectionIcons.tipos} />
              <StructureTypeGrid tipos={tiposEstructura} />
            </section>

            <section id="descripcion" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={2} title="Descripción general" icon={sectionIcons.descripcion} />
              <div className="mt-8 max-w-3xl">
                <Table rows={descripcionGeneral} />
              </div>
            </section>

            <section id="vistas" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={3} title="Vistas y dimensiones generales" icon={sectionIcons.vistas} />
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {vistasDimensiones.map((vista) => (
                  <div key={vista.vista} className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                    <h3 className="text-base font-black text-slate-900">{vista.vista}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{vista.detalle}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="componentes" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={4} title="Componentes principales" icon={sectionIcons.componentes} />

              <div className="mt-8 hidden overflow-x-auto rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] md:block">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.06em] text-slate-500">
                      <th className="px-5 py-3">Código</th>
                      <th className="px-5 py-3">Descripción</th>
                      <th className="px-5 py-3">Perfil / especificación</th>
                      <th className="px-5 py-3">Material</th>
                      <th className="px-5 py-3">Acabado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {componentesPrincipales.map((item, index) => (
                      <tr key={item.codigo} className={index % 2 === 1 ? "bg-slate-50/60" : ""}>
                        <td className="px-5 py-3 font-black text-[#b17800]">{item.codigo}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900">{item.descripcion}</td>
                        <td className="px-5 py-3 text-slate-600">{item.perfil}</td>
                        <td className="px-5 py-3 text-slate-600">{item.material}</td>
                        <td className="px-5 py-3 text-slate-600">{item.acabado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-3 md:hidden">
                {componentesPrincipales.map((item) => (
                  <div key={item.codigo} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 rounded-full bg-[#fdf1d6] px-2.5 py-1 text-xs font-black text-[#b17800]">{item.codigo}</span>
                      <h4 className="text-sm font-black text-slate-900">{item.descripcion}</h4>
                    </div>
                    <dl className="mt-3 space-y-1.5 text-xs font-semibold">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-slate-400">Perfil</dt>
                        <dd className="text-right text-slate-700">{item.perfil}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-slate-400">Material</dt>
                        <dd className="text-right text-slate-700">{item.material}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-slate-400">Acabado</dt>
                        <dd className="text-right text-slate-700">{item.acabado}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </section>

            <section id="materiales" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={5} title="Materiales y fijaciones" icon={sectionIcons.materiales} />
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-sm font-black uppercase tracking-[0.06em] text-slate-500">Perfiles estructurales</h3>
                  <Table rows={perfilesEstructurales} />
                </div>
                <div>
                  <h3 className="mb-3 text-sm font-black uppercase tracking-[0.06em] text-slate-500">Tornillería</h3>
                  <Table rows={tornilleria} />
                </div>
              </div>
            </section>

            <section id="cimentacion" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={6} title="Cimentación recomendada" icon={sectionIcons.cimentacion} />
              <div className="mt-8 grid gap-6 md:grid-cols-[1fr_280px]">
                <div className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  <ul className="list-disc space-y-2 pl-5 text-sm font-semibold leading-6 text-slate-600">
                    <li>Pilote o dado de concreto según estudio de suelos.</li>
                    <li>Platina base 300x300x6.35 mm con 4 perforaciones Ø18 mm para anclaje con espárragos 5/8&quot;.</li>
                  </ul>
                </div>
                <div className="relative aspect-square w-full max-w-[280px] justify-self-end overflow-hidden rounded-[10px] border border-slate-200 shadow-[0_2px_10px_rgba(15,23,42,0.04)] md:justify-self-auto">
                  <Image
                    src="/energy-cimentacion-anclaje.jpg"
                    alt="Dado de concreto con platina de anclaje y espárragos para la cimentación de la estructura"
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                </div>
              </div>
            </section>

            <section id="beneficios" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={7} title="Características y beneficios" icon={sectionIcons.beneficios} />
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {caracteristicasBeneficios.map((beneficio) => (
                  <div key={beneficio.titulo} className="rounded-[10px] border border-slate-200 bg-white p-6 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                    <h3 className="text-base font-black text-[#b17800]">{beneficio.titulo}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{beneficio.texto}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="cargas" className="scroll-mt-36 border-b border-slate-100 py-10 md:py-14">
              <SectionHeading index={8} title="Capacidades de carga referenciales" icon={sectionIcons.cargas} />

              <div className="mt-8 hidden overflow-x-auto rounded-[10px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)] md:block">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-black uppercase tracking-[0.06em] text-slate-500">
                      <th className="px-5 py-3">Tipo de carga</th>
                      <th className="px-5 py-3">Valor de diseño</th>
                      <th className="px-5 py-3">Norma de referencia</th>
                      <th className="px-5 py-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capacidadesCarga.map((item, index) => (
                      <tr key={item.tipo} className={index % 2 === 1 ? "bg-slate-50/60" : ""}>
                        <td className="px-5 py-3 font-semibold text-slate-900">{item.tipo}</td>
                        <td className="px-5 py-3 text-slate-600">{item.valor}</td>
                        <td className="px-5 py-3 text-slate-600">{item.norma}</td>
                        <td className="px-5 py-3 text-slate-600">{item.observaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 space-y-3 md:hidden">
                {capacidadesCarga.map((item) => (
                  <div key={item.tipo} className="rounded-[10px] border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                    <h4 className="text-sm font-black text-slate-900">{item.tipo}</h4>
                    <p className="mt-1 text-sm font-black text-[#b17800]">{item.valor}</p>
                    <dl className="mt-3 space-y-1.5 text-xs font-semibold">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="shrink-0 text-slate-400">Norma</dt>
                        <dd className="text-right text-slate-700">{item.norma}</dd>
                      </div>
                      {item.observaciones && (
                        <div className="flex items-start justify-between gap-3">
                          <dt className="shrink-0 text-slate-400">Observaciones</dt>
                          <dd className="text-right text-slate-700">{item.observaciones}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-400">
                *Valores de referencia. Validar con cálculo estructural específico del proyecto.
              </p>
            </section>

            <section id="aplicaciones" className="py-10 md:py-14">
              <SectionHeading index={9} title="Aplicaciones" icon={sectionIcons.aplicaciones} />

              <div className="mt-8">
                <ApplicationsGallery items={aplicacionesFotos} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {aplicacionesTexto.map((aplicacion) => (
                  <span
                    key={aplicacion}
                    className="rounded-full border border-[#f0dcae] bg-[#fdf6e8] px-4 py-2 text-sm font-bold text-[#8a5c00]"
                  >
                    {aplicacion}
                  </span>
                ))}
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex rounded-full bg-[#050505] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-[#1a1a1a]"
              >
                Solicitar cotización
              </a>
            </section>
          </div>
        </div>
      </div>

      <section className="mt-10 bg-[#050505]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-6 px-5 py-8 md:px-8">
          <span className="text-lg font-black uppercase tracking-[0.06em] text-white">
            GEU <span className="text-[#ffd400]">Energy</span>
          </span>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-semibold text-white/75">
            <a href="tel:+573017690955" className="flex items-center gap-2 hover:text-white">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ffd400]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3h3l1.5 4-2 1.5a11 11 0 0 0 5 5L13 12l4 1.5V16a2 2 0 0 1-2 2c-6.6 0-12-5.4-12-12a2 2 0 0 1 1-1Z" />
              </svg>
              +57 301 769 0955
            </a>
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ffd400]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="7.5" />
                <path d="M2.5 10h15M10 2.5c2 2.2 3 5 3 7.5s-1 5.3-3 7.5c-2-2.2-3-5-3-7.5s1-5.3 3-7.5Z" />
              </svg>
              www.geuenergy.com
            </span>
            <a href="mailto:contacto@geuenergy.com" className="flex items-center gap-2 hover:text-white">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ffd400]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
                <path d="m3 5.5 7 5.5 7-5.5" />
              </svg>
              contacto@geuenergy.com
            </a>
            <span className="flex items-center gap-2">
              <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#ffd400]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 18s6-5.2 6-9.6A6 6 0 0 0 4 8.4C4 12.8 10 18 10 18Z" />
                <circle cx="10" cy="8.4" r="2.1" />
              </svg>
              Colombia
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
