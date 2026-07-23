import Image from "next/image";
import Link from "next/link";
import CauchosAddToCartButton from "../components/cauchos-add-to-cart-button";
import CauchosCategoryCarousel from "../components/cauchos-category-carousel";
import CauchosHeader from "../components/cauchos-header";
import CauchosTechnicalForm from "../components/cauchos-technical-form";
import HeroVideo from "../components/hero-video";
import { BrandFeaturedSection } from "../components/brand-promo-sections";
import SiteFooter from "../components/site-footer";
import { getSiteImageLinks, getSiteImages, resolveImage, resolveLink } from "@/lib/site-images";
import { isVideoUrl } from "@/lib/image-slots";
import { getSiteTexts, resolveText } from "@/lib/site-texts";
import { getProducts } from "@/lib/products";
import { slugify } from "../data/catalog";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos", active: true },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/cauchos/nosotros" },
  { label: "Contacto", href: "#contacto" },
];

const cauchosCategoriesBase = [
  {
    label: "Alimentos",
    title: "Alimentos, Farmacéuticos y cosméticos",
    imageKey: "categoria-alimentos",
    count: "Ver productos",
  },
  {
    label: "Agroindustria",
    title: "Agroindustria",
    imageKey: "categoria-agroindustria",
    count: "Ver productos",
  },
  {
    label: "Petróleo",
    title: "Petróleo, minería, gas, energías renovables y petroquímica",
    imageKey: "categoria-petroleo",
    count: "Ver productos",
  },
  {
    label: "Químico",
    title: "Químico, aseo y plásticos",
    imageKey: "categoria-quimico",
    count: "Ver productos",
  },
  {
    label: "Construcción",
    title: "Construcción, infraestructura, obra civil, cemento y agregados",
    imageKey: "categoria-construccion",
    count: "Ver productos",
  },
  {
    label: "Transporte",
    title: "Transporte, logística y puertos marítimos",
    imageKey: "categoria-transporte",
    count: "Ver productos",
  },
  {
    label: "Manufactura",
    title: "Manufactura, metalmecánica, siderúrgica y textiles",
    imageKey: "categoria-manufactura",
    count: "Ver productos",
  },
  {
    label: "Ferretería",
    title: "Ferretería y otros",
    imageKey: "categoria-ferreteria",
    count: "Ver productos",
  },
].map((category) => ({
  ...category,
  href: `/cauchos/categoria/${slugify(category.title)}`,
}));

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
  const siteImageLinks = await getSiteImageLinks();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const cauchosCategories = cauchosCategoriesBase.map((category) => ({
    ...category,
    image: resolveImage(category.imageKey, siteImages),
  }));
  const allProducts = await getProducts();
  const cauchosCatalog = allProducts.filter((product) => product.division === "Cauchos");
  const cauchosFeatured = cauchosCatalog.filter((product) => product.destacado);
  const cauchosProducts = (cauchosFeatured.length > 0 ? cauchosFeatured : cauchosCatalog).slice(0, 4);
  const featuredBrandsResolved = featuredBrands.map((brand) => ({
    ...brand,
    href: resolveLink(brand.imageKey, siteImageLinks, brand.href),
  }));

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CauchosHeader division="Cauchos" />

      <section id="catalogo-cauchos" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1632px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={cauchosCategories} />
        </div>
        <div className="mx-auto w-full overflow-hidden bg-[#dd1b44]" style={{ maxWidth: "1632px" }}>
          <CauchosTechnicalForm
            triggerLabel={
              <>
                <span className="sr-only">Diseña tu pieza</span>
                <span aria-hidden="true" className="geu-marquee-track flex w-max items-center">
                  {[0, 1].map((groupIndex) => (
                    <span key={groupIndex} className="flex items-center">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className="flex items-center whitespace-nowrap px-5 text-xs font-black uppercase tracking-[0.14em] text-white"
                        >
                          Diseña tu pieza
                          <span className="ml-2">→</span>
                          <span className="ml-5 text-white/45">✦</span>
                        </span>
                      ))}
                    </span>
                  ))}
                </span>
              </>
            }
            triggerClassName="geu-marquee-btn block w-full cursor-pointer overflow-hidden py-2.5 text-left"
          />
        </div>
        <div className="bg-white">
          {isVideoUrl(resolveImage("banner-principal", siteImages)) ? (
            <HeroVideo
              src={resolveImage("banner-principal", siteImages)}
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
        <div className="mx-auto max-w-[1632px] px-5 py-12 md:px-8">
          <div>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#075ed8]">
                    {t("cauchos-productos-eyebrow")}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                    {t("cauchos-productos-titulo")}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                    {t("cauchos-productos-subtitulo")}
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
        <div className="mx-auto max-w-[1632px] px-5 py-12 md:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#075ed8]">
                {t("cauchos-ofertas-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                {t("cauchos-ofertas-titulo")}
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
                href={resolveLink(offer.imageKey, siteImageLinks, offer.href)}
                aria-label={t(offer.imageKey)}
                className="cauchos-offer-card group relative block aspect-[9/16] min-h-[430px] overflow-hidden rounded-[10px] border border-slate-200 bg-[#071225] shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
              >
                <Image
                  src={resolveImage(offer.imageKey, siteImages)}
                  alt={t(offer.imageKey)}
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

      <section id="contacto" className="mx-auto max-w-[1632px] px-5 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[10px] bg-[linear-gradient(120deg,#020617_0%,#071a3c_48%,#075ed8_100%)] shadow-[0_24px_70px_rgba(7,94,216,0.24)]">
          <span
            className="absolute inset-0 opacity-90"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(circle at 78% 18%, rgba(59,130,246,0.3), transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.07), transparent 38%)",
            }}
          />
          <div className="relative grid gap-6 px-8 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/80">
                {t("cauchos-contacto-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                {t("cauchos-contacto-titulo")}
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/80">
                {t("cauchos-contacto-subtitulo")}
              </p>
            </div>
            <CauchosTechnicalForm
              triggerClassName="inline-flex items-center justify-center rounded-full border border-white/80 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.08em] text-[#075ed8] shadow-[0_12px_30px_rgba(0,0,0,0.22)] transition hover:bg-blue-50"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1632px] px-5 pb-10 md:px-8">
        <Image
          src={resolveImage("banner-marcas-promo", siteImages)}
          alt="Promociones y marcas destacadas"
          width={2048}
          height={768}
          className="h-auto w-full rounded-[10px] border border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        />
      </section>

      <section className="bg-white px-5 py-8 md:px-8">
        <div className="mx-auto max-w-[1632px] overflow-hidden rounded-[8px] border border-slate-200 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
          <Image
            src={resolveImage("banner-categorias", siteImages)}
            alt="Cierre Universal de Cauchos"
            width={1920}
            height={217}
            className="h-[118px] w-full object-cover md:h-[150px]"
          />
        </div>
      </section>

      <BrandFeaturedSection
        title={t("cauchos-marcas-titulo")}
        items={featuredBrandsResolved}
        siteImages={siteImages}
        compact
        maxWidth="1632px"
      />

      <SiteFooter
        logoSrc="/logo-universal-cauchos.png"
        logoAlt="GEU Universal de Cauchos"
        logoWidth={260}
        tagline={t("footer-cauchos-tagline")}
        navItems={navItems}
        accent="#075ed8"
        siteTexts={siteTexts}
        columns={[
          {
            title: t("footer-cauchos-col3-title"),
            items: t("footer-cauchos-col3-items").split(",").map((s) => s.trim()).filter(Boolean),
          },
          {
            title: t("footer-cauchos-col4-title"),
            items: t("footer-cauchos-col4-items").split(",").map((s) => s.trim()).filter(Boolean),
            style: "badges",
          },
        ]}
      />
    </main>
  );
}
