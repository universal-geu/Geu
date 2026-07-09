import Image from "next/image";
import Link from "next/link";
import CauchosAddToCartButton from "../components/cauchos-add-to-cart-button";
import CauchosCategoryCarousel from "../components/cauchos-category-carousel";
import CauchosCartLink from "../components/cauchos-cart-link";
import CauchosDynamicMenu from "../components/cauchos-dynamic-menu";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { isVideoUrl } from "@/lib/image-slots";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos", active: true },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "#contacto" },
];

const cauchosCategories = [
  {
    label: "Laminas",
    title: "Laminas y rollos",
    image: "/home-cauchos.png",
    count: "38 productos",
  },
  {
    label: "Sellos",
    title: "Sellos y empaques",
    image: "/cauchos-hero-crop.png",
    count: "54 productos",
  },
  {
    label: "Mangueras",
    title: "Mangueras industriales",
    image: "/cauchos-hero-banner.png",
    count: "27 productos",
  },
  {
    label: "Pisos",
    title: "Pisos antideslizantes",
    image: "/home-cauchos.png",
    count: "19 productos",
  },
  {
    label: "Tecnicos",
    title: "Piezas tecnicas",
    image: "/cauchos-hero-crop.png",
    count: "86 productos",
  },
  {
    label: "A medida",
    title: "Fabricacion especial",
    image: "/cauchos-hero-banner.png",
    count: "Cotizacion",
  },
];

const cauchosOffers = [
  {
    title: "Productos de caucho",
    href: "/cauchos/categoria/linea-cauchos",
    imageKey: "oferta-cauchos-productos",
  },
  {
    title: "Cauchos industriales",
    href: "/cauchos/categoria/linea-cauchos",
    imageKey: "oferta-cauchos-industriales",
  },
  {
    title: "Mangueras industriales",
    href: "/cauchos/categoria/linea-neumatica",
    imageKey: "oferta-mangueras-industriales",
  },
  {
    title: "Soportes industriales",
    href: "/cauchos/categoria/espejos-retrovisores-y-soportes",
    imageKey: "oferta-soportes-industriales",
  },
];

const featuredBrands = [
  {
    title: "Perfiles de caucho",
    href: "/cauchos/categoria/linea-cauchos",
    imageKey: "marca-destacada-perfiles",
  },
  {
    title: "Mangueras industriales",
    href: "/cauchos/categoria/linea-neumatica",
    imageKey: "marca-destacada-mangueras",
  },
  {
    title: "Laminas de caucho",
    href: "/cauchos/categoria/linea-cauchos",
    imageKey: "marca-destacada-laminas",
  },
  {
    title: "Soportes industriales",
    href: "/cauchos/categoria/espejos-retrovisores-y-soportes",
    imageKey: "marca-destacada-soportes",
  },
];

export default async function CauchosPage() {
  const siteImages = await getSiteImages();
  const allProducts = await getProducts();
  const cauchosCatalog = allProducts.filter((product) => product.division === "Cauchos");
  const cauchosFeatured = cauchosCatalog.filter((product) => product.destacado);
  const cauchosProducts = (cauchosFeatured.length > 0 ? cauchosFeatured : cauchosCatalog).slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white text-[#111827] shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto flex h-8 max-w-[1500px] items-center justify-between px-5 text-[11px] font-bold uppercase tracking-[0.03em] text-slate-600 md:px-8">
            <div className="hidden gap-3 md:flex">
              <span>Servicio al cliente 320 88 999 33</span>
              <span className="text-slate-300">|</span>
              <span>Ventas empresariales</span>
              <span className="text-slate-300">|</span>
              <span>Centro de ayuda</span>
            </div>
            <div className="flex w-full justify-between gap-3 md:w-auto md:justify-end">
              <Link href="#contacto" className="hover:text-[#075ed8]">Cotizaciones</Link>
              <Link href="#productos" className="hover:text-[#075ed8]">Catalogos</Link>
              <Link href="/quienes-somos" className="hover:text-[#075ed8]">GEU empresas</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto grid min-h-[74px] max-w-[1500px] items-center gap-4 px-5 py-3 md:grid-cols-[260px_1fr_auto] md:px-8">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/logo-universal-cauchos.png"
              alt="GEU Universal de Cauchos"
              width={2518}
              height={420}
              priority
              className="h-auto object-contain"
              style={{ width: "260px", maxWidth: "100%" }}
            />
          </Link>

          <form className="flex min-h-11 overflow-hidden rounded-[3px] border border-slate-300 bg-white shadow-inner">
            <input
              aria-label="Buscar productos de caucho"
              className="min-w-0 flex-1 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Buscar laminas, sellos, mangueras, empaques..."
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
            <Link href="/quienes-somos" className="font-bold hover:text-[#075ed8]">Nosotros</Link>
            <CauchosCartLink />
            <Link href="/login?next=/mi-cuenta" className="font-bold hover:text-[#075ed8]">Mi cuenta</Link>
          </div>
        </div>

        <CauchosDynamicMenu />
      </header>

      <section id="catalogo-cauchos" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={cauchosCategories} />
        </div>
        <div className="bg-white text-white">
          <div
            className="mx-auto flex min-h-14 w-full flex-wrap items-center justify-center gap-4 bg-[#075ed8] px-5 py-3 text-center md:px-8"
            style={{ maxWidth: "1632px" }}
          >
            <p className="text-lg font-black tracking-[-0.01em]">
              Compra empresarial y proyectos a medida
            </p>
            <span className="rounded bg-white px-3 py-1 text-sm font-black text-[#075ed8]">
              Asesoria tecnica
            </span>
            <span className="text-sm font-bold text-white/86">
              Laminas, sellos, mangueras, piezas especiales y despachos nacionales.
            </span>
          </div>
        </div>
        <div className="bg-white">
          {isVideoUrl(resolveImage("banner-principal", siteImages)) ? (
            <video
              src={resolveImage("banner-principal", siteImages)}
              controls
              playsInline
              className="mx-auto h-auto w-full object-contain"
              style={{ maxWidth: "1632px" }}
            />
          ) : (
            <Image
              src={resolveImage("banner-principal", siteImages)}
              alt="Todo en caucho para cada industria"
              width={2048}
              height={768}
              priority
              className="mx-auto h-auto w-full object-contain"
              style={{ maxWidth: "1632px" }}
            />
          )}
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-8">
          <div>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#075ed8]">
                    Productos destacados
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                    Cauchos para compra empresarial
                  </h2>
                  <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                    Seleccion industrial para compras recurrentes, proyectos especiales y reposicion tecnica.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
                  {["Entrega inmediata", "Por pedido", "A medida"].map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {cauchosProducts.map((product) => {
                  const productImage = product.imagen === "/hero-unipars.jpg" ? "/home-cauchos.png" : product.imagen;

                  return (
                  <article
                    key={product.slug}
                    className="group flex min-h-[455px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#075ed8]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
                  >
                    <Link
                      href={`/producto/${product.slug}`}
                      className="relative block h-52 overflow-hidden bg-slate-200"
                      style={{
                        backgroundImage: `linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.34)),url('${productImage}')`,
                        backgroundPosition: "center",
                        backgroundSize: "cover",
                      }}
                    >
                      <span className="absolute left-3 top-3 rounded-[4px] bg-[#e4002b] px-2.5 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(228,0,43,0.24)]">
                        {product.descuento}
                      </span>
                      <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#075ed8] shadow-sm">
                        Industrial
                      </span>
                    </Link>
                    <span className="flex flex-1 flex-col p-6">
                      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#075ed8]">
                        {product.marca}
                      </span>
                      <Link
                        href={`/producto/${product.slug}`}
                        className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[#075ed8]"
                      >
                        {product.nombre}
                      </Link>
                      <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                        {product.descripcion}
                      </p>
                      <span className="mt-3 inline-flex w-fit rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-black text-slate-600">
                        {product.disponibilidad}
                      </span>
                      <span className="mt-auto border-t border-slate-100 pt-5">
                        <span className="block text-xs font-bold text-slate-400 line-through decoration-[#e4002b]/50">
                          {product.precioAnterior}
                        </span>
                        <span className="mt-1 block text-2xl font-black tracking-[-0.02em] text-slate-950">
                          {product.precio}
                        </span>
                      </span>
                      <CauchosAddToCartButton
                        id={product.slug}
                        nombre={product.nombre}
                        precio={product.precio}
                        imagen={productImage}
                      />
                      <Link
                        href={`/producto/${product.slug}`}
                        className="mt-3 inline-flex justify-center rounded-full border border-[#075ed8] bg-white px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-[#075ed8] transition-colors duration-200 hover:bg-[#075ed8] hover:text-white"
                      >
                        Ver detalle
                      </Link>
                    </span>
                  </article>
                  );
                })}
              </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#075ed8]">
                Ofertas especiales
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                Soluciones listas para tu operacion
              </h2>
            </div>
            <Link
              href="/cauchos/categoria/linea-cauchos"
              className="inline-flex rounded-full border border-[#075ed8] px-5 py-3 text-sm font-black text-[#075ed8] transition hover:bg-[#075ed8] hover:text-white"
            >
              Ver todos
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cauchosOffers.map((offer) => (
              <Link
                key={offer.title}
                href={offer.href}
                aria-label={offer.title}
                className="cauchos-offer-card group relative block aspect-[9/16] min-h-[430px] overflow-hidden rounded-[10px] border border-slate-200 bg-[#071225] shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
              >
                <Image
                  src={resolveImage(offer.imageKey, siteImages)}
                  alt={offer.title}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="cauchos-offer-image object-cover transition duration-500 group-hover:scale-[1.025]"
                />
                <span className="cauchos-offer-shine pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-white/18 blur-xl" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-[1500px] px-5 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[10px] border border-white/10 bg-[#071225] shadow-[0_24px_70px_rgba(7,18,37,0.22)]">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-[#e4002b]" aria-hidden="true" />
          <span
            className="absolute inset-0 opacity-80"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 78% 18%, rgba(7,94,216,0.28), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.1), transparent 34%)",
            }}
          />
          <div className="relative grid gap-6 px-8 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#7db2ff]">
                Necesitas una solucion en caucho?
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                Hablemos de tu proyecto
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                Nuestro equipo de expertos esta listo para brindarte la mejor solucion para tus necesidades.
              </p>
            </div>
            <Link
              href="mailto:contacto@grupogeu.com"
              className="inline-flex items-center justify-center rounded-full border border-white/70 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#071225] shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition hover:border-[#e4002b] hover:bg-[#e4002b] hover:text-white"
            >
              Hablar con un experto →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 pb-10 md:px-8">
        <Image
          src={resolveImage("banner-marcas-promo", siteImages)}
          alt="Promociones y marcas destacadas"
          width={2048}
          height={768}
          className="h-auto w-full rounded-[10px] border border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        />
      </section>

      <section className="bg-white px-5 py-8 md:px-8">
        <div className="mx-auto max-w-[1500px] overflow-hidden rounded-[8px] border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
          <Image
            src={resolveImage("banner-categorias", siteImages)}
            alt="Cierre Universal de Cauchos"
            width={1920}
            height={217}
            className="h-[118px] w-full object-cover md:h-[150px]"
          />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f5f5f5] text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8">
          <h2 className="text-center text-xl font-black tracking-[-0.02em] text-slate-900">
            Nuestras marcas destacadas
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {featuredBrands.map((brand) => (
              <Link
                key={brand.title}
                href={brand.href}
                aria-label={brand.title}
                className="group block aspect-[18/5] overflow-hidden rounded-[4px] bg-[#071225] shadow-[0_8px_18px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]"
              >
                <Image
                  src={resolveImage(brand.imageKey, siteImages)}
                  alt={brand.title}
                  width={900}
                  height={250}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-5 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-8">
          <div>
            <Image
              src="/logo-universal-cauchos.png"
              alt="GEU Universal de Cauchos"
              width={2518}
              height={420}
              className="h-auto w-[260px] rounded-[2px] bg-white p-2"
            />
            <p className="mt-5 max-w-[260px] text-sm leading-6 text-slate-600">
              Construimos empresas que transforman industrias y generan valor para un futuro mejor.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Enlaces rapidos</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {navItems.slice(0, 5).map((item) => (
                <Link key={item.label} href={item.href} className="hover:text-[#075ed8]">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Cauchos</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {["Soluciones", "Productos", "Industrias", "Catalogos", "Cotizacion"].map((item) => (
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
