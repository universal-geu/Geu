import Image from "next/image";
import Link from "next/link";
import EnergyHeader from "../energy-header";

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

const aplicaciones = [
  "Proyectos fotovoltaicos residenciales",
  "Proyectos fotovoltaicos comerciales",
  "Parques solares a gran escala",
  "Estacionamientos solares (Carport)",
];

function Table({ rows }: { rows: { etiqueta: string; valor: string }[] }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-slate-200">
      {rows.map((row, index) => (
        <div
          key={row.etiqueta}
          className={`grid grid-cols-[1fr_1.2fr] ${index < rows.length - 1 ? "border-b border-slate-200" : ""}`}
        >
          <div className="bg-slate-50 px-5 py-3 text-sm font-bold text-slate-500">{row.etiqueta}</div>
          <div className="px-5 py-3 text-sm font-semibold text-slate-900">{row.valor}</div>
        </div>
      ))}
    </div>
  );
}

export default function EnergyCatalogoPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
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
            <h1 className="mt-3 max-w-2xl font-[family:var(--font-display)] text-4xl font-black leading-[0.95] tracking-[-0.02em] md:text-6xl">
              Estructura fija para paneles solares
            </h1>
            <span className="mt-5 inline-flex rounded-full border border-[#ffd400] px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#ffd400]">
              Modelo: GEU-EF-14.6x5.5
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#050505]">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">1. Tipos de estructuras fijas</p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {tiposEstructura.map((tipo) => (
              <article
                key={tipo.nombre}
                className="overflow-hidden rounded-[10px] border border-white/10 bg-black/40 shadow-[0_14px_36px_rgba(0,0,0,0.3)]"
              >
                <div className="relative h-40 overflow-hidden bg-white/5">
                  <Image
                    src={tipo.imagen}
                    alt={`Estructura solar tipo ${tipo.nombre}`}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black text-white">{tipo.nombre}</h3>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{tipo.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a66a00]">2. Descripción general</p>
          <div className="mt-6 max-w-3xl">
            <Table rows={descripcionGeneral} />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#050505]">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">3. Vistas y dimensiones generales</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {vistasDimensiones.map((vista) => (
              <div key={vista.vista} className="rounded-[10px] border border-white/10 bg-black/40 p-6">
                <h3 className="text-base font-black text-white">{vista.vista}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{vista.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a66a00]">4. Componentes principales</p>
          <div className="mt-6 overflow-x-auto rounded-[10px] border border-slate-200">
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
                  <tr key={item.codigo} className={index % 2 === 1 ? "bg-slate-50" : ""}>
                    <td className="px-5 py-3 font-black text-[#a66a00]">{item.codigo}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.descripcion}</td>
                    <td className="px-5 py-3 text-slate-600">{item.perfil}</td>
                    <td className="px-5 py-3 text-slate-600">{item.material}</td>
                    <td className="px-5 py-3 text-slate-600">{item.acabado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a66a00]">5. Materiales y fijaciones</p>
          <div className="mt-6 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.06em] text-slate-500">Perfiles estructurales</h3>
              <Table rows={perfilesEstructurales} />
            </div>
            <div>
              <h3 className="mb-3 text-sm font-black uppercase tracking-[0.06em] text-slate-500">Tornillería</h3>
              <Table rows={tornilleria} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">6. Cimentación recomendada</p>
          <ul className="mt-6 max-w-2xl list-disc space-y-2 pl-5 text-sm font-semibold leading-6 text-white/75">
            <li>Pilote o dado de concreto según estudio de suelos.</li>
            <li>Platina base 300x300x6.35 mm con 4 perforaciones Ø18 mm para anclaje con espárragos 5/8&quot;.</li>
          </ul>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#050505]">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">7. Características y beneficios</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {caracteristicasBeneficios.map((beneficio) => (
              <div key={beneficio.titulo} className="rounded-[10px] border border-white/10 bg-black/40 p-6">
                <h3 className="text-base font-black text-[#ffd400]">{beneficio.titulo}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">{beneficio.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#a66a00]">8. Capacidades de carga referenciales</p>
          <div className="mt-6 overflow-x-auto rounded-[10px] border border-slate-200">
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
                  <tr key={item.tipo} className={index % 2 === 1 ? "bg-slate-50" : ""}>
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.tipo}</td>
                    <td className="px-5 py-3 text-slate-600">{item.valor}</td>
                    <td className="px-5 py-3 text-slate-600">{item.norma}</td>
                    <td className="px-5 py-3 text-slate-600">{item.observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs font-semibold text-slate-400">
            *Valores de referencia. Validar con cálculo estructural específico del proyecto.
          </p>
        </div>
      </section>

      <section className="bg-[#050505]">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ffd400]">9. Aplicaciones</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {aplicaciones.map((aplicacion) => (
              <span
                key={aplicacion}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white/80"
              >
                {aplicacion}
              </span>
            ))}
          </div>

          <Link
            href="/energy#contacto"
            className="mt-10 inline-flex rounded-full border border-[#ffd400] bg-transparent px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#ffd400] transition-colors duration-200 hover:bg-[#ffd400] hover:text-black"
          >
            Solicitar cotización
          </Link>
        </div>
      </section>
    </main>
  );
}
