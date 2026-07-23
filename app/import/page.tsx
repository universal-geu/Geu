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
import { getProducts } from "@/lib/products";
import { importCategorias, slugify } from "../data/catalog";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import", active: true },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/import/nosotros" },
  { label: "Contacto", href: "#contacto" },
];

const IMPORT_CATEGORY_IMAGE_KEYS: Record<string, string> = {
  "Láminas de caucho": "import-categoria-laminas",
  "Empaquetaduras": "import-categoria-empaquetaduras",
  "Plásticos de Ingeniería": "import-categoria-plasticos",
  "Acoples OPW": "import-categoria-acoples-opw",
  "Acoples Hidráulicos": "import-categoria-acoples-hidraulicos",
  "Mangueras Hidráulicas": "import-categoria-mangueras-hidraulicas",
  "Mangueras Industriales": "import-categoria-mangueras-industriales",
  "Mangueras en PVC": "import-categoria-mangueras-pvc",
  "Mangueras en caucho y lona": "import-categoria-mangueras-caucho-lona",
  "Línea Neumática": "import-categoria-linea-neumatica",
  "Aislamientos Térmicos": "import-categoria-aislamientos-termicos",
  "Mercado Persa": "import-categoria-mercado-persa",
  "Autopartes": "import-categoria-autopartes",
};

const importCategoriesBase = importCategorias.map((title) => ({
  label: title,
  title,
  imageKey: IMPORT_CATEGORY_IMAGE_KEYS[title] ?? "import-categoria-autopartes",
  count: "Ver productos",
  href: `/import/categoria/${slugify(title)}`,
}));

const importOffers = [
  { title: "Repuestos importados", href: "/import/categoria/autopartes", imageKey: "import-oferta-1" },
  { title: "Abastecimiento global", href: "/import", imageKey: "import-oferta-2" },
  { title: "Logistica internacional", href: "#contacto", imageKey: "import-oferta-3" },
  { title: "Compras por pedido", href: "#contacto", imageKey: "import-oferta-4" },
];

const importFeatured = [
  {
    title: "Importacion empresarial",
    href: "/import",
    imageKey: "import-destacada-1",
  },
  {
    title: "Proveedores verificados",
    href: "/import",
    imageKey: "import-destacada-2",
  },
  {
    title: "Logistica y aduana",
    href: "#contacto",
    imageKey: "import-destacada-3",
  },
  {
    title: "Abastecimiento recurrente",
    href: "#contacto",
    imageKey: "import-destacada-4",
  },
];

export default async function ImportPage() {
  const siteImages = await getSiteImages();
  const siteImageLinks = await getSiteImageLinks();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const allProducts = await getProducts();
  const importCatalog = allProducts.filter((product) => product.division === "Import");
  const importFeaturedProducts = importCatalog.filter((product) => product.destacado);
  const importProducts = (importFeaturedProducts.length > 0 ? importFeaturedProducts : importCatalog).slice(0, 4);
  const importCategories = importCategoriesBase.map((category) => ({
    ...category,
    image: resolveImage(category.imageKey, siteImages),
  }));
  const importOffersResolved = importOffers.map((offer) => ({
    ...offer,
    title: t(offer.imageKey),
    href: resolveLink(offer.imageKey, siteImageLinks, offer.href),
  }));
  const importFeaturedResolved = importFeatured.map((item) => ({
    ...item,
    title: t(item.imageKey),
    href: resolveLink(item.imageKey, siteImageLinks, item.href),
  }));

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CauchosHeader division="Import" />

      <section id="catalogo-import" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1632px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={importCategories} accent="red" />
        </div>
        <div className="mx-auto w-full overflow-hidden bg-[#e31313]" style={{ maxWidth: "1632px" }}>
          <CauchosProjectChat
            division="Import"
            triggerLabel={
              <>
                <span className="sr-only">¿Qué quieres importar?</span>
                <span aria-hidden="true" className="geu-marquee-track flex w-max items-center">
                  {[0, 1].map((groupIndex) => (
                    <span key={groupIndex} className="flex items-center">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span
                          key={i}
                          className="flex items-center whitespace-nowrap px-5 text-xs font-black uppercase tracking-[0.14em] text-white"
                        >
                          ¿Qué quieres importar?
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
            className="relative mx-auto aspect-[8/3] w-full overflow-hidden bg-slate-950"
            style={{ maxWidth: "1632px" }}
          >
            {isVideoUrl(resolveImage("import-principal", siteImages)) ? (
              <HeroVideo
                src={resolveImage("import-principal", siteImages)}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <Image
                src={resolveImage("import-principal", siteImages)}
                alt="GEU Import conecta proveedores y mercados internacionales"
                fill
                priority
                sizes="(min-width: 1632px) 1632px, 100vw"
                className="object-cover object-center"
              />
            )}
          </div>
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1632px] px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e31313]">
                {t("import-productos-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                {t("import-productos-titulo")}
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                {t("import-productos-subtitulo")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
              {["Entrega inmediata", "Importado", "Por pedido"].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {importProducts.map((product) => {
              const productImage = product.imagen === "/hero-unipars.jpg" ? "/home-import.png" : product.imagen;

              return (
                <article
                  key={product.slug}
                  className="group flex min-h-[455px] flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_14px_36px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#e31313]/50 hover:shadow-[0_24px_58px_rgba(15,23,42,0.14)]"
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
                    <span className="absolute left-3 top-3 rounded-[4px] bg-[#e31313] px-2.5 py-1.5 text-xs font-black text-white shadow-[0_10px_22px_rgba(227,19,19,0.24)]">
                      {product.descuento}
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/92 px-3 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-[#e31313] shadow-sm">
                      Importado
                    </span>
                  </Link>
                  <span className="flex flex-1 flex-col p-6">
                    <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#e31313]">
                      {product.marca}
                    </span>
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-2 min-h-14 text-xl font-black leading-7 text-slate-950 hover:text-[#e31313]"
                    >
                      {product.nombre}
                    </Link>
                    <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-500">
                      {product.descripcion}
                    </p>
                    <span className="mt-3 inline-flex w-fit rounded-full bg-[#fff0f0] px-3 py-1 text-xs font-black text-slate-600">
                      {product.disponibilidad}
                    </span>
                    <span className="mt-auto border-t border-slate-100 pt-5">
                      <span className="block text-xs font-bold text-slate-400 line-through decoration-[#e31313]/50">
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
                      accent="red"
                    />
                    <Link
                      href={`/producto/${product.slug}`}
                      className="mt-3 inline-flex justify-center rounded-full px-4 py-2 text-center text-xs font-black uppercase tracking-[0.08em] text-slate-500 hover:bg-[#fff0f0] hover:text-[#e31313]"
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
        accent="#e31313"
        eyebrow={t("import-ofertas-eyebrow")}
        title={t("import-ofertas-titulo")}
        ctaHref="/import"
        items={importOffersResolved}
        siteImages={siteImages}
        maxWidth="1632px"
      />

      <section id="contacto" className="mx-auto max-w-[1632px] px-5 pb-8 md:px-8">
        <div
          className="relative overflow-hidden rounded-[10px] border border-[#2b0b0b] bg-[#140505] shadow-[0_24px_70px_rgba(23,6,6,0.22)]"
          style={{ backgroundColor: "#140505", color: "#ffffff" }}
        >
          <span
            className="absolute inset-0 opacity-95"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, rgba(20,5,5,0.98) 0%, rgba(31,8,8,0.92) 42%, rgba(227,19,19,0.22) 100%), radial-gradient(circle at 82% 24%, rgba(227,19,19,0.36), transparent 32%)",
            }}
          />
          <div
            className="absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-center opacity-35 md:block"
            style={{ backgroundImage: "url('/geu-import-main-banner.png')" }}
            aria-hidden="true"
          />
          <div className="relative grid gap-7 px-7 py-8 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb3b3]">
                {t("import-contacto-eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                {t("import-contacto-titulo")}
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                {t("import-contacto-subtitulo")}
              </p>
            </div>
            <CauchosProjectChat
              division="Import"
              triggerLabel="Hablar con un experto →"
              triggerClassName="inline-flex w-fit items-center justify-center rounded-[4px] border border-[#e31313] bg-[#e31313] px-7 py-4 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_16px_34px_rgba(227,19,19,0.28)] transition hover:border-white hover:bg-white hover:text-[#170606]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1632px] px-5 pb-10 md:px-8">
        <Image
          src={resolveImage("import-marcas-promo", siteImages)}
          alt="Promociones y marcas GEU Import"
          width={2048}
          height={768}
          className="h-auto w-full rounded-[10px] border border-slate-200 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
        />
      </section>

      <BrandFeaturedSection
        title={t("import-marcas-titulo")}
        items={importFeaturedResolved}
        siteImages={siteImages}
        compact
        maxWidth="1632px"
      />

      <BrandClosingBanner
        imageKey="import-cierre"
        alt="Cierre GEU Import"
        siteImages={siteImages}
        maxWidth="1632px"
      />

      <SiteFooter
        logoSrc="/logo-geu-import.png"
        logoAlt="GEU Import"
        tagline={t("footer-import-tagline")}
        navItems={navItems}
        accent="#e31313"
        siteTexts={siteTexts}
        columns={[
          {
            title: t("footer-import-col3-title"),
            items: t("footer-import-col3-items").split(",").map((s) => s.trim()).filter(Boolean),
          },
          {
            title: t("footer-import-col4-title"),
            items: t("footer-import-col4-items").split(",").map((s) => s.trim()).filter(Boolean),
            style: "badges",
          },
        ]}
      />
    </main>
  );
}
