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
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic", active: true },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "#contacto" },
];

const plasticCategories = [
  {
    label: "Perfiles",
    title: "Perfiles plasticos",
    image: "/home-plastic.png",
    count: "32 referencias",
  },
  {
    label: "Materia prima",
    title: "Materia prima",
    image: "/home-plastic.png",
    count: "Resinas y pellets",
  },
  {
    label: "Piezas",
    title: "Piezas tecnicas",
    image: "/home-plastic.png",
    count: "Por plano",
  },
  {
    label: "Extrusion",
    title: "Extrusion",
    image: "/home-plastic.png",
    count: "Produccion continua",
  },
  {
    label: "Corte",
    title: "Corte y mecanizado",
    image: "/home-plastic.png",
    count: "A medida",
  },
  {
    label: "Comercial",
    title: "Aplicaciones comerciales",
    image: "/home-plastic.png",
    count: "Desarrollo",
  },
];

const productLines = [
  {
    title: "Perfiles transparentes",
    text: "Soluciones para vitrinas, protecciones, guias, divisiones y sistemas livianos.",
    tag: "Extrusion",
  },
  {
    title: "Pellets y resinas",
    text: "Materia prima para produccion industrial con seleccion segun aplicacion y volumen.",
    tag: "Materia prima",
  },
  {
    title: "Piezas bajo plano",
    text: "Corte, mecanizado y acabado de piezas plasticas para reposicion o desarrollo.",
    tag: "Tecnico",
  },
];

const plasticOffers = [
  { title: "Perfiles plasticos", href: "#catalogo-plastic", imageKey: "plastic-oferta-1" },
  { title: "Materia prima", href: "#catalogo-plastic", imageKey: "plastic-oferta-2" },
  { title: "Piezas tecnicas", href: "#contacto", imageKey: "plastic-oferta-3" },
  { title: "Desarrollo a medida", href: "#contacto", imageKey: "plastic-oferta-4" },
];

const plasticFeatured = [
  { title: "Perfiles", href: "#catalogo-plastic", imageKey: "plastic-destacada-1" },
  { title: "Resinas", href: "#catalogo-plastic", imageKey: "plastic-destacada-2" },
  { title: "Piezas tecnicas", href: "#contacto", imageKey: "plastic-destacada-3" },
  { title: "Extrusion", href: "#contacto", imageKey: "plastic-destacada-4" },
];

const specs = ["PVC", "Policarbonato", "Acrilico", "Polietileno", "Nylon", "ABS"];

function PlasticMark() {
  return (
    <Image
      src="/logo-geu-plastic.png"
      alt="GEU Plastic"
      width={2000}
      height={452}
      priority
      className="h-auto w-[250px] max-w-full object-contain"
    />
  );
}

export default async function PlasticPage() {
  const siteImages = await getSiteImages();
  const allProducts = await getProducts();
  const plasticProducts = allProducts.filter((product) => product.division === "Plastic");

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
            <div className="hidden gap-3 md:flex">
              <span>Servicio al cliente 320 88 999 33</span>
              <span className="text-slate-300">|</span>
              <span>Plasticos tecnicos</span>
              <span className="text-slate-300">|</span>
              <span>Desarrollo industrial</span>
            </div>
            <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
              <Link href="#contacto" className="hover:text-slate-950">Cotizaciones</Link>
              <Link href="#catalogo-plastic" className="hover:text-slate-950">Catalogos</Link>
              <Link href="/quienes-somos" className="hover:text-slate-950">GEU empresas</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[300px_1fr_auto] md:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <PlasticMark />
          </Link>

          <form className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
            <input
              aria-label="Buscar soluciones plasticas"
              className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar perfiles, resinas, piezas o aplicaciones..."
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
            <Link href="/quienes-somos" className="font-bold hover:text-slate-950">Nosotros</Link>
            <Link
              href="#contacto"
              className="rounded-full border border-slate-300 px-5 py-2 font-black hover:border-slate-500"
            >
              Cotizar
            </Link>
            <Link href="/login" className="font-bold hover:text-slate-950">Mi cuenta</Link>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white">
          <nav className="mx-auto flex min-h-14 max-w-[1500px] items-stretch justify-between gap-2 overflow-x-auto px-5 text-[11px] font-black uppercase tracking-[0.02em] text-slate-800 md:px-8">
            {[
              "Perfiles plasticos",
              "Materia prima",
              "Piezas tecnicas",
              "Extrusion",
              "Mecanizado",
              "Desarrollo a medida",
              "Aplicaciones",
              "Contacto",
            ].map((item, index) => (
              <Link
                key={item}
                href={index === 7 ? "#contacto" : "#catalogo-plastic"}
                className="flex min-w-max items-center border-b-2 border-transparent px-3 text-center hover:border-[#a3a3a4] hover:text-slate-950"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section id="catalogo-plastic" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={plasticCategories} accent="silver" />
        </div>

        <div className="bg-[#a3a3a4] text-white">
          <div className="mx-auto flex min-h-14 max-w-[1500px] flex-wrap items-center justify-center gap-4 px-5 py-3 text-center md:px-8">
            <p className="text-lg font-black tracking-[-0.01em] text-slate-950">
              Plasticos tecnicos para industria y comercio
            </p>
            <span className="rounded bg-white px-3 py-1 text-sm font-black text-slate-800">
              Desarrollo a medida
            </span>
            <span className="text-sm font-bold text-slate-950/72">
              Perfiles, piezas, materias primas y soluciones transformadas.
            </span>
          </div>
        </div>
        <div
          className="mx-auto min-h-[320px] max-w-[1920px] bg-cover bg-center md:min-h-[520px] xl:min-h-[650px]"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.1)), url('${resolveImage("plastic-principal", siteImages)}')`,
          }}
          aria-label="GEU Plastic, perfiles en PVC de alta calidad para todas las industrias"
          role="img"
        />
      </section>

      <section id="lineas-plastic" className="scroll-mt-56 border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                Lineas Plastic
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                Materiales y piezas para producir mejor.
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                Un catalogo pensado para compras tecnicas, abastecimiento empresarial y desarrollos por aplicacion.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
              {specs.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {productLines.map((item) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-[#a3a3a4] hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
              >
                <div className="relative h-56 overflow-hidden bg-slate-200">
                  <Image
                    src="/home-plastic.png"
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-slate-700 shadow-sm">
                    {item.tag}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-black tracking-[-0.02em]">{item.title}</h3>
                  <p className="mt-3 min-h-20 text-sm font-semibold leading-6 text-slate-500">
                    {item.text}
                  </p>
                  <Link
                    href="#contacto"
                    className="mt-6 inline-flex rounded-full border border-slate-300 px-5 py-2 text-xs font-black uppercase tracking-[0.08em] text-slate-700 hover:border-slate-700 hover:bg-slate-950 hover:text-white"
                  >
                    Cotizar →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-14 md:px-8">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Productos Plastic
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
            Fichas de producto listas para cotizar.
          </h2>

          {plasticProducts.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {plasticProducts.map((product) => (
                <article
                  key={product.slug}
                  className="group flex min-h-[420px] flex-col overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition hover:-translate-y-1 hover:border-[#6b7280]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
                >
                  <div
                    className="relative h-52 overflow-hidden bg-slate-200"
                    style={{
                      backgroundImage: `linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.3)),url('${product.imagen}')`,
                      backgroundPosition: "center",
                      backgroundSize: "cover",
                    }}
                  >
                    <span className="absolute left-3 top-3 rounded-[4px] bg-[#6b7280] px-2.5 py-1.5 text-xs font-black text-white shadow-sm">
                      {product.descuento}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6b7280]">
                      {product.marca}
                    </span>
                    <p className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950">
                      {product.nombre}
                    </p>
                    <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                      {product.descripcion}
                    </p>
                    <span className="mt-3 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
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
                      className="mt-6 inline-flex justify-center rounded-full border border-[#6b7280] bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-[0.08em] text-[#6b7280] transition-colors duration-200 hover:bg-[#6b7280] hover:text-white"
                    >
                      Cotizar
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm font-semibold text-slate-500">
              Pronto publicaremos aqui nuestras fichas de producto.
            </p>
          )}
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Produccion y abastecimiento
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.02em] md:text-5xl">
              Del material correcto a la pieza lista.
            </h2>
            <p className="mt-5 text-base font-semibold leading-7 text-slate-500">
              GEU Plastic acompana seleccion de material, validacion tecnica, compra por volumen y fabricacion de piezas para aplicaciones industriales o comerciales.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Seleccion de material", "Desarrollo por plano", "Compra recurrente", "Soporte comercial"].map((item) => (
                <span key={item} className="rounded-[6px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-[8px] border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <Image
              src={resolveImage("plastic-principal", siteImages)}
              alt="Materiales plasticos tecnicos GEU Plastic"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <BrandOfferSection
        accent="#6b7280"
        eyebrow="Ofertas Plastic"
        title="Soluciones listas para producir"
        ctaHref="#catalogo-plastic"
        items={plasticOffers}
        siteImages={siteImages}
      />

      <section id="contacto" className="mx-auto max-w-[1500px] px-5 py-10 md:px-8">
        <div className="relative overflow-hidden rounded-[8px] border border-slate-300 bg-slate-950 text-white shadow-[0_24px_70px_rgba(15,23,42,0.2)]">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "linear-gradient(90deg, rgba(2,6,23,0.98) 0%, rgba(15,23,42,0.88) 46%, rgba(163,163,164,0.22) 100%)",
            }}
          />
          <div className="relative grid gap-7 px-7 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/62">
                Tienes un proyecto plastico?
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                Revisemos material, medidas y cantidades.
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                Envia tu requerimiento y te ayudamos a aterrizar la solucion tecnica y comercial.
              </p>
            </div>
            <Link
              href="mailto:contacto@grupogeu.com"
              className="inline-flex w-fit items-center justify-center rounded-[4px] border border-[#a3a3a4] bg-[#a3a3a4] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-slate-950 shadow-[0_16px_34px_rgba(163,163,164,0.28)] transition hover:border-white hover:bg-white"
            >
              Hablar con un experto →
            </Link>
          </div>
        </div>
      </section>

      <BrandFeaturedSection
        title="Nuestras marcas destacadas"
        items={plasticFeatured}
        siteImages={siteImages}
      />

      <BrandClosingBanner
        imageKey="plastic-cierre"
        alt="Cierre GEU Plastic"
        siteImages={siteImages}
      />

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-8">
          <div>
            <PlasticMark />
            <p className="mt-5 max-w-[280px] text-sm leading-6 text-slate-600">
              Soluciones plasticas tecnicas para empresas, manufactura, comercio y proyectos especiales.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Enlaces rapidos</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {navItems.slice(0, 6).map((item) => (
                <Link key={item.label} href={item.href} className={item.active ? "text-slate-950" : "hover:text-slate-950"}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Servicios</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {["Perfiles", "Resinas", "Piezas", "Extrusion", "Mecanizado"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Materiales</h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {specs.slice(0, 4).map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-center text-[10px] font-black text-slate-600">
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
