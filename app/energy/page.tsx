import Image from "next/image";
import Link from "next/link";
import CauchosAddToCartButton from "../components/cauchos-add-to-cart-button";
import CauchosCategoryCarousel from "../components/cauchos-category-carousel";
import CauchosHeader from "../components/cauchos-header";
import CauchosProjectChat from "../components/cauchos-project-chat";
import HeroVideo from "../components/hero-video";
import { BrandClosingBanner, BrandFeaturedSection, BrandOfferSection } from "../components/brand-promo-sections";
import SiteFooter from "../components/site-footer";
import { getSiteImageLinks, getSiteImages, resolveImage, resolveLink } from "@/lib/site-images";
import { isVideoUrl } from "@/lib/image-slots";
import { getSiteTexts, resolveText } from "@/lib/site-texts";
import { getProducts, productSellsInDivision } from "@/lib/products";
import { energyCategorias, slugify } from "../data/catalog";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy", active: true },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/energy/nosotros" },
  { label: "Proyectos", href: "/energy/proyectos" },
  { label: "Contacto", href: "#contacto" },
];

const ENERGY_CATEGORY_IMAGE_KEYS: Record<string, string> = {
  "Paneles solares": "energy-categoria-paneles-solares",
  "Inversores": "energy-categoria-inversores",
  "Baterías y respaldo": "energy-categoria-baterias-respaldo",
  "Estructuras de montaje": "energy-categoria-estructuras-montaje",
  "Cableado y conectores": "energy-categoria-cableado-conectores",
  "Controladores de carga": "energy-categoria-controladores-carga",
  "Medición y monitoreo": "energy-categoria-medicion-monitoreo",
  "Accesorios e instalación": "energy-categoria-accesorios-instalacion",
};

const energyCategoriesBase = energyCategorias.map((title) => ({
  label: title,
  title,
  imageKey: ENERGY_CATEGORY_IMAGE_KEYS[title] ?? "energy-categoria-paneles-solares",
  count: "Ver productos",
  href: `/energy/categoria/${slugify(title)}`,
}));

const energyOffers = [
  { title: "Paneles solares", href: "/energy/categoria/paneles-solares", imageKey: "energy-oferta-1" },
  { title: "Baterías y respaldo", href: "/energy/categoria/baterias-y-respaldo", imageKey: "energy-oferta-2" },
  { title: "Estructuras de montaje", href: "/energy/categoria/estructuras-de-montaje", imageKey: "energy-oferta-3" },
  { title: "Instalación por proyecto", href: "#contacto", imageKey: "energy-oferta-4" },
];

const energyFeatured = [
  { title: "Proyectos residenciales", href: "/energy", imageKey: "energy-destacada-1" },
  { title: "Proyectos comerciales", href: "/energy", imageKey: "energy-destacada-2" },
  { title: "Proyectos industriales", href: "/energy", imageKey: "energy-destacada-3" },
  { title: "Mantenimiento y monitoreo", href: "#contacto", imageKey: "energy-destacada-4" },
];

export default async function EnergyPage() {
  const siteImages = await getSiteImages();
  const siteImageLinks = await getSiteImageLinks();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const allProducts = await getProducts();
  const energyCatalog = allProducts.filter((product) => productSellsInDivision(product, "Energy"));
  const energyFeaturedProducts = energyCatalog.filter((product) => product.destacado);
  const energyProducts = (energyFeaturedProducts.length > 0 ? energyFeaturedProducts : energyCatalog).slice(0, 4);
  const energyCategories = energyCategoriesBase.map((category) => ({
    ...category,
    image: resolveImage(category.imageKey, siteImages),
  }));
  const energyOffersResolved = energyOffers.map((offer) => ({
    ...offer,
    title: t(offer.imageKey),
    href: resolveLink(offer.imageKey, siteImageLinks, offer.href),
  }));
  const energyFeaturedResolved = energyFeatured.map((item) => ({
    ...item,
    title: t(item.imageKey),
    href: resolveLink(item.imageKey, siteImageLinks, item.href),
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <CauchosHeader division="Energy" extraNavLink={{ label: "Proyectos", href: "/energy/proyectos" }} />

      <section className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1632px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={energyCategories} accent="gold" />
        </div>
        <div className="mx-auto w-full overflow-hidden bg-[#d4a900]" style={{ maxWidth: "1632px" }}>
          <CauchosProjectChat
            division="Energy"
            triggerLabel={
              <>
                <span className="sr-only">¿Qué proyecto energético tienes en mente?</span>
                <span aria-hidden="true" className="geu-marquee-track flex w-max items-center">
                  {[0, 1].map((groupIndex) => (
                    <span key={groupIndex} className="flex items-center">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className="flex items-center whitespace-nowrap px-5 text-xs font-black uppercase tracking-[0.14em] text-white"
                        >
                          ¿Qué proyecto energético tienes en mente?
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
          <div
            className="relative mx-auto aspect-[16/7] w-full overflow-hidden bg-slate-950 sm:aspect-[16/6]"
            style={{ maxWidth: "1632px" }}
          >
            {isVideoUrl(resolveImage("energy-tienda-principal", siteImages)) ? (
              <HeroVideo
                src={resolveImage("energy-tienda-principal", siteImages)}
                wrapperClassName="relative h-full w-full"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <>
                <Image
                  src={resolveImage("energy-tienda-principal-movil", siteImages)}
                  alt="GEU Energy: soluciones solares para tu operación"
                  fill
                  priority
                  sizes="100vw"
                  className="block object-cover object-top md:hidden"
                />
                <Image
                  src={resolveImage("energy-tienda-principal", siteImages)}
                  alt="GEU Energy: soluciones solares para tu operación"
                  fill
                  priority
                  sizes="(min-width: 1632px) 1632px, 100vw"
                  className="hidden object-cover object-top md:block"
                />
              </>
            )}
          </div>
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1632px] px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b38f00]">
                {t("energy-productos-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                {t("energy-productos-titulo")}
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                {t("energy-productos-subtitulo")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
              {["Entrega inmediata", "Por proyecto", "Instalación incluida"].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {energyProducts.map((product) => {
              const productImage = product.imagen === "/hero-unipars.jpg" ? "/home-energy.png" : product.imagen;

              return (
                <article
                  key={product.slug}
                  className="group flex min-h-[455px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#d4a900]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
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
                    <span className="absolute left-3 top-3 rounded-[4px] bg-[#d4a900] px-2.5 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(212,169,0,0.24)]">
                      {product.descuento}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#b38f00] shadow-sm">
                      Energy
                    </span>
                  </Link>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#b38f00]">
                      {product.marca}
                    </span>
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[#b38f00]"
                    >
                      {product.nombre}
                    </Link>
                    <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                      {product.descripcion}
                    </p>
                    <span className="mt-3 inline-flex w-fit rounded-full bg-[#fff9e5] px-3 py-1 text-xs font-black text-slate-600">
                      {product.disponibilidad}
                    </span>
                    <span className="mt-auto border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-slate-400 line-through decoration-[#d4a900]/50">
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
                      division="Energy"
                      accent="gold"
                    />
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-3 inline-flex justify-center rounded-full px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-slate-500 hover:bg-[#fff9e5] hover:text-[#b38f00]"
                    >
                      Ver detalle
                    </Link>
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <BrandOfferSection
        accent="#d4a900"
        eyebrow={t("energy-ofertas-eyebrow")}
        title={t("energy-ofertas-titulo")}
        ctaHref="/energy"
        items={energyOffersResolved}
        siteImages={siteImages}
        maxWidth="1632px"
      />

      <section id="contacto" className="mx-auto max-w-[1632px] px-5 pb-8 md:px-8">
        <div
          className="relative overflow-hidden rounded-[10px] border border-[#2b2205] bg-[#141005] shadow-[0_24px_70px_rgba(23,18,6,0.22)]"
          style={{ backgroundColor: "#141005", color: "#ffffff" }}
        >
          <div className="relative grid gap-7 px-7 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffe58a]">
                {t("energy-contacto-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                {t("energy-contacto-titulo")}
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                {t("energy-contacto-subtitulo")}
              </p>
            </div>
            <CauchosProjectChat
              division="Energy"
              triggerLabel="Hablar con un experto →"
              triggerClassName="inline-flex w-fit items-center justify-center rounded-[4px] border border-[#d4a900] bg-[#d4a900] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_16px_34px_rgba(212,169,0,0.28)] transition hover:border-white hover:bg-white hover:text-[#170606]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1632px] px-5 pb-10 md:px-8">
        <Image
          src={resolveImage("energy-marcas-promo", siteImages)}
          alt="Promociones y soluciones GEU Energy"
          width={2048}
          height={768}
          className="h-auto w-full rounded-[10px] border border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        />
      </section>

      <BrandFeaturedSection
        title={t("energy-marcas-titulo")}
        items={energyFeaturedResolved}
        siteImages={siteImages}
        compact
        maxWidth="1632px"
      />

      <BrandClosingBanner
        imageKey="energy-cierre"
        mobileImageKey="energy-cierre-movil"
        alt="Cierre GEU Energy"
        siteImages={siteImages}
        maxWidth="1632px"
      />

      <SiteFooter
        logoSrc="/logo-geu-energy.png"
        logoAlt="GEU Energy"
        tagline={t("footer-energy-tagline")}
        navItems={navItems}
        accent="#d4a900"
        siteTexts={siteTexts}
        columns={[
          {
            title: t("footer-energy-col3-title"),
            items: t("footer-energy-col3-items").split(",").map((s) => s.trim()).filter(Boolean),
          },
        ]}
      />
    </main>
  );
}
