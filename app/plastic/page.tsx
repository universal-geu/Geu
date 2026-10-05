import Image from "next/image";
import Link from "next/link";
import CauchosAddToCartButton from "../components/cauchos-add-to-cart-button";
import CauchosCategoryCarousel from "../components/cauchos-category-carousel";
import { BrandClosingBanner, BrandFeaturedSection, BrandOfferSection } from "../components/brand-promo-sections";
import { ResponsiveBanner } from "../components/responsive-banner";
import CauchosHeader from "../components/cauchos-header";
import HeroVideo from "../components/hero-video";
import SiteFooter from "../components/site-footer";
import { getSiteImageLinks, getSiteImages, resolveImage, resolveLink } from "@/lib/site-images";
import { isVideoUrl } from "@/lib/image-slots";
import { getSiteTexts, resolveText } from "@/lib/site-texts";
import { getWhatsAppNumberForDivision } from "@/lib/site-settings";
import { getCategoriesForDivision } from "@/lib/categories";
import { getProducts, productSellsInDivision } from "@/lib/products";
import { productHref } from "@/lib/divisions";
import { slugify } from "../data/catalog";

export const dynamic = "force-dynamic";

const plasticOffers = [
  { title: "Extrusión PVC Rígido", href: "/plastic/categoria/extrusion-en-pvc-rigido", imageKey: "plastic-oferta-1" },
  { title: "Extrusión PVC Flexible", href: "/plastic/categoria/extrusion-en-pvc-flexible", imageKey: "plastic-oferta-2" },
  { title: "Perfilería para construcción", href: "/plastic/categoria/perfileria-para-construccion", imageKey: "plastic-oferta-3" },
  { title: "Perfilería para carrocería", href: "/plastic/categoria/perfileria-para-carroceria", imageKey: "plastic-oferta-4" },
];

const plasticFeatured = [
  {
    title: "Perfiles",
    href: "/plastic",
    imageKey: "plastic-destacada-1",
  },
  {
    title: "Resinas",
    href: "/plastic",
    imageKey: "plastic-destacada-2",
  },
  {
    title: "Piezas técnicas",
    href: "#contacto",
    imageKey: "plastic-destacada-3",
  },
  {
    title: "Extrusión",
    href: "#contacto",
    imageKey: "plastic-destacada-4",
  },
];

export default async function PlasticPage() {
  // Independent reads — fetch them together instead of paying for six
  // sequential round trips to a remote DB on every page load.
  const [siteImages, siteImageLinks, siteTexts, whatsappNumber, allProducts, plasticCategoryRecords] =
    await Promise.all([
      getSiteImages(),
      getSiteImageLinks(),
      getSiteTexts(),
      getWhatsAppNumberForDivision("Plastic"),
      getProducts(),
      getCategoriesForDivision("Plastic"),
    ]);
  const t = (key: string) => resolveText(key, siteTexts);
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hola GEU Plastic, quiero hacer una evaluación técnica.",
      )}`
    : "#contacto";
  const plasticCatalog = allProducts.filter((product) => productSellsInDivision(product, "Plastic"));
  const plasticFeaturedProducts = plasticCatalog.filter((product) => product.destacado);
  const plasticProducts = (plasticFeaturedProducts.length > 0 ? plasticFeaturedProducts : plasticCatalog).slice(0, 4);
  const plasticCategories = plasticCategoryRecords.map((category) => ({
    label: category.name,
    title: category.name,
    count: "Ver productos",
    href: `/plastic/categoria/${slugify(category.name)}`,
    image: category.imageKey ? resolveImage(category.imageKey, siteImages) : "/home-plastic.webp",
  }));
  const plasticOffersResolved = plasticOffers.map((offer) => ({
    ...offer,
    title: t(offer.imageKey),
    href: resolveLink(offer.imageKey, siteImageLinks, offer.href),
  }));
  const plasticFeaturedResolved = plasticFeatured.map((item) => ({
    ...item,
    title: t(item.imageKey),
    href: resolveLink(item.imageKey, siteImageLinks, item.href),
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <CauchosHeader division="Plastic" />

      <section id="catalogo-plastic" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1632px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={plasticCategories} accent="silver" />
        </div>

        <div className="mx-auto w-full overflow-hidden bg-[#6b7280]" style={{ maxWidth: "1632px" }}>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="geu-marquee-btn block w-full cursor-pointer overflow-hidden py-2.5 text-left"
          >
            <span className="sr-only">¿Qué necesitas producir?</span>
            <span aria-hidden="true" className="geu-marquee-track flex w-max items-center">
              {[0, 1].map((groupIndex) => (
                <span key={groupIndex} className="flex items-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className="flex items-center whitespace-nowrap px-5 text-xs font-black uppercase tracking-[0.14em] text-white"
                    >
                      ¿Qué necesitas producir?
                      <span className="ml-2">→</span>
                      <span className="ml-5 text-white/45">✦</span>
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </a>
        </div>
        <div className="bg-white">
          {isVideoUrl(resolveImage("plastic-principal", siteImages)) ? (
            <HeroVideo
              src={resolveImage("plastic-principal", siteImages)}
              className="mx-auto h-auto w-full object-contain"
              style={{ maxWidth: "1632px" }}
            />
          ) : (
            <div
              className="relative mx-auto w-full overflow-hidden bg-slate-950 md:aspect-[8/3]"
              style={{ maxWidth: "1632px" }}
            >
              <Image
                src={resolveImage("plastic-principal-movil", siteImages)}
                alt="GEU Plastic, perfiles en PVC de alta calidad para todas las industrias"
                width={1254}
                height={1254}
                priority
                sizes="100vw"
                className="block h-auto w-full md:hidden"
              />
              <Image
                src={resolveImage("plastic-principal", siteImages)}
                alt="GEU Plastic, perfiles en PVC de alta calidad para todas las industrias"
                fill
                priority
                sizes="(min-width: 1632px) 1632px, 100vw"
                className="hidden object-cover object-center md:block"
              />
            </div>
          )}
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1632px] px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                {t("plastic-productos-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                {t("plastic-productos-titulo")}
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                {t("plastic-productos-subtitulo")}
              </p>
            </div>
          </div>

          {plasticProducts.length > 0 ? (
            <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-3 2xl:grid-cols-4">
              {plasticProducts.map((product) => {
                const productImage = product.imagen === "/hero-unipars.jpg" ? "/home-plastic.webp" : product.imagen;

                return (
                <article
                  key={product.slug}
                  className="group flex min-h-[455px] w-[calc(100vw-2.5rem)] shrink-0 snap-start flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#6b7280]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)] sm:w-auto sm:shrink"
                >
                  <Link
                    href={productHref(product.slug, "Plastic")}
                    className="relative block h-52 overflow-hidden bg-white"
                    style={{
                      backgroundImage: `url('${productImage}')`,
                      backgroundPosition: "center",
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                    }}
                  >
                    <span className="absolute left-3 top-3 rounded-[4px] bg-[#6b7280] px-2.5 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(107,114,128,0.24)]">
                      {product.descuento}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#6b7280] shadow-sm">
                      Técnico
                    </span>
                  </Link>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#6b7280]">
                      {product.marca}
                    </span>
                    <Link
                      href={productHref(product.slug, "Plastic")}
                      className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[#6b7280]"
                    >
                      {product.nombre}
                    </Link>
                    <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                      {product.descripcion}
                    </p>
                    <span className="mt-3 inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {product.disponibilidad}
                    </span>
                    <span className="mt-auto border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-slate-400 line-through decoration-[#6b7280]/50">
                        {product.precioAnterior}
                      </span>
                      <span className="mt-1 block text-2xl font-black tracking-[-0.02em] text-slate-950">
                        {product.precio}
                      </span>
                    </span>
                    <CauchosAddToCartButton
                      id={product.slug}
                      slug={product.slug}
                      nombre={product.nombre}
                      precio={product.precio}
                      imagen={productImage}
                      sku={product.sku}
                      division="Plastic"
                      accent="gray"
                    />
                    <Link
                      href={productHref(product.slug, "Plastic")}
                      className="mt-3 inline-flex justify-center rounded-full px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-slate-500 hover:bg-slate-100 hover:text-[#6b7280]"
                    >
                      Ver detalle
                    </Link>
                  </span>
                </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm font-semibold text-slate-500">
              Pronto publicaremos aquí nuestras fichas de producto.
            </p>
          )}
        </div>
      </section>

      <BrandOfferSection
        accent="#6b7280"
        eyebrow={t("plastic-ofertas-eyebrow")}
        title={t("plastic-ofertas-titulo")}
        items={plasticOffersResolved}
        siteImages={siteImages}
        maxWidth="1632px"
      />

      <section id="contacto" className="mx-auto max-w-[1632px] px-5 py-10 md:px-8">
        <div className="relative overflow-hidden rounded-[8px] border border-zinc-300 bg-zinc-900 text-white shadow-[0_24px_70px_rgba(24,24,27,0.2)]">
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background:
                "linear-gradient(90deg, rgba(9,9,11,0.98) 0%, rgba(39,39,42,0.88) 46%, rgba(163,163,164,0.22) 100%)",
            }}
          />
          <div className="relative grid gap-7 px-7 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/62">
                {t("plastic-contacto-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                {t("plastic-contacto-titulo")}
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                {t("plastic-contacto-subtitulo")}
              </p>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center justify-center rounded-[4px] border border-[#a3a3a4] bg-[#a3a3a4] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-slate-950 transition hover:border-white hover:bg-white"
            >
              Hablar con un experto →
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1632px] px-5 pb-10 md:px-8">
        <ResponsiveBanner
          imageKey="plastic-marcas-promo"
          mobileImageKey="plastic-marcas-promo-movil"
          alt="Promociones y marcas GEU Plastic"
          siteImages={siteImages}
          className="rounded-[10px] border border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        />
      </section>

      <BrandFeaturedSection
        title={t("plastic-marcas-titulo")}
        items={plasticFeaturedResolved}
        siteImages={siteImages}
        maxWidth="1632px"
        aspectClass="aspect-[3/1]"
      />

      <BrandClosingBanner
        imageKey="plastic-cierre"
        mobileImageKey="plastic-cierre-movil"
        alt="Cierre GEU Plastic"
        siteImages={siteImages}
        maxWidth="1632px"
      />

      <SiteFooter
        logoSrc="/logo-geu-plastic.png"
        logoAlt="GEU Plastic"
        tagline={t("footer-plastic-tagline")}
        accent="#111827"
        siteTexts={siteTexts}
        columns={[]}
      />
    </main>
  );
}
