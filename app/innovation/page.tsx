import Image from "next/image";
import Link from "next/link";
import { BrandClosingBanner, BrandFeaturedSection, BrandOfferSection } from "../components/brand-promo-sections";
import CauchosCategoryCarousel from "../components/cauchos-category-carousel";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation", active: true },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "#contacto" },
];

const innovationMenu = [
  "Automatizacion",
  "Software y data",
  "Ingenieria",
  "Prototipos",
  "Consultoria",
  "Proyectos",
  "Servicios",
  "Contacto",
];

const innovationCategories = [
  {
    label: "Automatizacion",
    title: "Automatizacion industrial",
    image: "/innovation-hero-banner.png",
    count: "Procesos",
  },
  {
    label: "Software",
    title: "Software y data",
    image: "/home-innovation.png",
    count: "Analitica",
  },
  {
    label: "Ingenieria",
    title: "Ingenieria y desarrollo",
    image: "/cauchos-industria-banner.png",
    count: "A medida",
  },
  {
    label: "Prototipos",
    title: "Prototipos tecnicos",
    image: "/innovation-hero-banner.png",
    count: "Validacion",
  },
  {
    label: "Consultoria",
    title: "Innovacion abierta",
    image: "/home-innovation.png",
    count: "Asesoria",
  },
  {
    label: "Proyectos",
    title: "Proyectos especiales",
    image: "/cauchos-industria-banner.png",
    count: "Cotizacion",
  },
];

const innovationProductsFallback = [
  {
    slug: "automatizacion-industrial",
    marca: "GEU Innovation",
    nombre: "Automatizacion industrial",
    descripcion: "Sistemas inteligentes para optimizar lineas, control operativo y productividad.",
    disponibilidad: "Proyecto por alcance",
    precio: "Cotizar",
    precioAnterior: "Diagnostico tecnico",
    descuento: "Nuevo",
    imagen: "/innovation-hero-banner.png",
  },
  {
    slug: "software-data-intelligence",
    marca: "GEU Innovation",
    nombre: "Software y data intelligence",
    descripcion: "Plataformas para convertir datos de operacion en decisiones claras y medibles.",
    disponibilidad: "Implementacion modular",
    precio: "Cotizar",
    precioAnterior: "Roadmap digital",
    descuento: "B2B",
    imagen: "/home-innovation.png",
  },
  {
    slug: "ingenieria-desarrollo",
    marca: "GEU Innovation",
    nombre: "Ingenieria y desarrollo",
    descripcion: "Diseno, prototipo y validacion de soluciones tecnicas para retos complejos.",
    disponibilidad: "A medida",
    precio: "Cotizar",
    precioAnterior: "Prototipo inicial",
    descuento: "Lab",
    imagen: "/cauchos-industria-banner.png",
  },
  {
    slug: "consultoria-innovacion",
    marca: "GEU Innovation",
    nombre: "Consultoria de innovacion",
    descripcion: "Acompanamiento para transformar ideas empresariales en planes ejecutables.",
    disponibilidad: "Agenda disponible",
    precio: "Cotizar",
    precioAnterior: "Sesion estrategica",
    descuento: "Pro",
    imagen: "/innovation-hero-banner.png",
  },
];

const innovationOffers = [
  { title: "Automatizacion industrial", href: "#contacto", imageKey: "innovation-oferta-1" },
  { title: "Software y data", href: "#contacto", imageKey: "innovation-oferta-2" },
  { title: "Ingenieria y desarrollo", href: "#contacto", imageKey: "innovation-oferta-3" },
  { title: "Consultoria de innovacion", href: "#contacto", imageKey: "innovation-oferta-4" },
];

const innovationFeatured = [
  { title: "Automatizacion", href: "#contacto", imageKey: "innovation-destacada-1" },
  { title: "Data intelligence", href: "#contacto", imageKey: "innovation-destacada-2" },
  { title: "Prototipos tecnicos", href: "#contacto", imageKey: "innovation-destacada-3" },
  { title: "Innovacion abierta", href: "#contacto", imageKey: "innovation-destacada-4" },
];

function InnovationLogo() {
  return (
    <Image
      src="/logo-geu-innovation.png"
      alt="GEU Innovation"
      width={2000}
      height={452}
      priority
      className="h-auto w-[270px] max-w-full object-contain"
    />
  );
}

export default async function InnovationPage() {
  const siteImages = await getSiteImages();
  const allProducts = await getProducts();
  const innovationProducts = allProducts.filter((product) => product.division === "Innovation");
  const displayProducts =
    innovationProducts.length > 0 ? innovationProducts : innovationProductsFallback;

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
            <div className="hidden gap-3 md:flex">
              <span>Servicio al cliente 320 88 999 33</span>
              <span className="text-slate-300">|</span>
              <span>Innovacion empresarial</span>
              <span className="text-slate-300">|</span>
              <span>Centro de ayuda</span>
            </div>
            <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
              <Link href="#contacto" className="hover:text-[#0498b4]">Cotizaciones</Link>
              <Link href="#productos" className="hover:text-[#0498b4]">Catalogos</Link>
              <Link href="/quienes-somos" className="hover:text-[#0498b4]">GEU empresas</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[300px_1fr_auto] md:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <InnovationLogo />
          </Link>

          <form className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
            <input
              aria-label="Buscar soluciones de innovacion"
              className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar automatizacion, software, data, prototipos..."
            />
            <button
              type="button"
              className="flex w-14 items-center justify-center border-l border-slate-200 text-xl text-slate-800"
              aria-label="Buscar"
            >
              ⌕
            </button>
          </form>

          <div className="flex items-center justify-between gap-5 text-sm text-slate-700 md:justify-end">
            <Link href="/quienes-somos" className="font-bold hover:text-[#0498b4]">Nosotros</Link>
            <Link href="#contacto" className="font-bold hover:text-[#0498b4]">Asesoria</Link>
            <Link href="/login?next=/mi-cuenta&brand=innovation" className="font-bold hover:text-[#0498b4]">Mi cuenta</Link>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-[1500px] px-5 md:px-8">
            <nav className="flex min-h-14 items-stretch justify-between gap-2 overflow-x-auto text-[11px] font-black uppercase tracking-[0.02em] text-slate-800">
              {innovationMenu.map((item, index) => (
                <Link
                  key={item}
                  href={index < 6 ? "#catalogo-innovation" : "#contacto"}
                  className="flex min-w-max items-center border-b-2 border-transparent px-3 text-center hover:border-[#0498b4] hover:text-[#0498b4]"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <section id="catalogo-innovation" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={innovationCategories} />
        </div>
        <div className="text-white" style={{ backgroundColor: "#0498b4" }}>
          <div className="mx-auto flex min-h-14 max-w-[1500px] flex-wrap items-center justify-center gap-4 px-5 py-3 text-center md:px-8">
            <p className="text-lg font-black tracking-[-0.01em]">
              Innovacion empresarial y proyectos a medida
            </p>
            <span className="rounded bg-white px-3 py-1 text-sm font-black text-[#0498b4]">
              Asesoria tecnica
            </span>
            <span className="text-sm font-bold text-white/86">
              Automatizacion, software, data, prototipos y transformacion operativa.
            </span>
          </div>
        </div>
        <div className="bg-slate-950">
          <div
            className="mx-auto min-h-[260px] max-w-[1920px] bg-cover bg-center md:min-h-[420px] xl:min-h-[560px]"
            style={{
              backgroundImage: `linear-gradient(90deg, rgba(4,152,180,0.18), rgba(2,6,23,0.08)), url('${resolveImage("innovation-principal", siteImages)}')`,
            }}
            aria-label="Innovacion empresarial para cada industria"
            role="img"
          />
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
                Soluciones destacadas
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                Innovation para compra empresarial
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                Seleccion de servicios para empresas que necesitan disenar, automatizar, medir y mejorar procesos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
              {["Diagnostico", "Por proyecto", "A medida"].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {displayProducts.map((product) => (
              <article
                key={product.slug}
                className="group flex min-h-[455px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#0498b4]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
              >
                <Link
                  href="#contacto"
                  className="relative block h-52 overflow-hidden bg-slate-200"
                  style={{
                    backgroundImage: `linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.34)),url('${product.imagen}')`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                  }}
                >
                  <span className="absolute left-3 top-3 rounded-[4px] bg-[#0498b4] px-2.5 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(4,152,180,0.24)]">
                    {product.descuento}
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#0498b4] shadow-sm">
                    Innovation
                  </span>
                </Link>
                <span className="flex flex-1 flex-col p-6">
                  <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0498b4]">
                    {product.marca}
                  </span>
                  <Link
                    href="#contacto"
                    className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[#0498b4]"
                  >
                    {product.nombre}
                  </Link>
                  <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                    {product.descripcion}
                  </p>
                  <span className="mt-3 inline-flex w-fit rounded-full bg-[#e8f7fa] px-3 py-1 text-xs font-black text-slate-600">
                    {product.disponibilidad}
                  </span>
                  <span className="mt-auto border-t border-slate-100 pt-5">
                    <span className="block text-xs font-bold text-slate-400">
                      {product.precioAnterior}
                    </span>
                    <span className="mt-1 block text-2xl font-black tracking-[-0.02em] text-slate-950">
                      {product.precio}
                    </span>
                  </span>
                  <Link
                    href="#contacto"
                    className="mt-6 inline-flex justify-center rounded-full border border-[#0498b4] bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-[#0498b4] transition-colors duration-200 hover:bg-[#0498b4] hover:text-white"
                  >
                    Solicitar asesoria
                  </Link>
                  <Link
                    href="#contacto"
                    className="mt-3 inline-flex justify-center rounded-full border border-[#0498b4] bg-white px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-[#0498b4] transition-colors duration-200 hover:bg-[#0498b4] hover:text-white"
                  >
                    Ver detalle
                  </Link>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BrandOfferSection
        accent="#0498b4"
        eyebrow="Ofertas Innovation"
        title="Soluciones listas para transformar"
        ctaHref="#contacto"
        items={innovationOffers}
        siteImages={siteImages}
      />

      <section id="contacto" className="mx-auto max-w-[1500px] px-5 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[10px] border border-white/10 bg-[#071225] shadow-[0_24px_70px_rgba(7,18,37,0.22)]">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[#0498b4]" aria-hidden="true" />
          <span
            className="absolute inset-0 opacity-80"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 78% 18%, rgba(4,152,180,0.34), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.1), transparent 34%)",
            }}
          />
          <div className="relative grid gap-6 px-8 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8de9f6]">
                Necesitas una solucion innovadora?
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                Hablemos de tu proyecto
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                Nuestro equipo puede ayudarte a convertir una idea, necesidad tecnica o proceso manual en una solucion clara.
              </p>
            </div>
            <Link
              href="mailto:innovation@geu.com.co"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#071225] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:border-[#0498b4] hover:bg-[#0498b4] hover:text-white"
            >
              Hablar con un experto →
            </Link>
          </div>
        </div>
      </section>

      <BrandFeaturedSection
        title="Nuestras marcas destacadas"
        items={innovationFeatured}
        siteImages={siteImages}
      />

      <BrandClosingBanner
        imageKey="innovation-cierre"
        alt="Cierre GEU Innovation"
        siteImages={siteImages}
      />

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-8">
          <div>
            <InnovationLogo />
            <p className="mt-5 max-w-[260px] text-sm leading-6 text-slate-600">
              Construimos empresas que transforman industrias y generan valor para un futuro mejor.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Enlaces rapidos</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {navItems.slice(0, 5).map((item) => (
                <Link key={item.label} href={item.href} className="hover:text-[#0498b4]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Innovation</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {["Soluciones", "Proyectos", "Automatizacion", "Software", "Cotizacion"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Certificaciones</h3>
            <div className="mt-5 flex gap-3">
              {["ISO 9001", "ISO 14001", "ISO 45001"].map((item) => (
                <span key={item} className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-center text-[10px] font-black text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
