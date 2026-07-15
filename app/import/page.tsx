import Image from "next/image";
import Link from "next/link";
import CauchosAddToCartButton from "../components/cauchos-add-to-cart-button";
import CauchosCategoryCarousel from "../components/cauchos-category-carousel";
import CauchosHeader from "../components/cauchos-header";
import CauchosProjectChat from "../components/cauchos-project-chat";
import { BrandClosingBanner, BrandFeaturedSection, BrandOfferSection } from "../components/brand-promo-sections";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getProducts } from "@/lib/products";
import { categorias, slugify } from "../data/catalog";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import", active: true },
  { label: "Innovation", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/quienes-somos" },
  { label: "Contacto", href: "#contacto" },
];

const CATEGORY_IMAGES: Record<string, string> = {
  "Alimentos, Farmacéuticos y cosméticos": "/subcategorias/alimentos.jpg",
  Agroindustria: "/subcategorias/agroindustria.jpg",
  "Petróleo, minería, gas, energías renovables y petroquímica": "/subcategorias/petroleo.jpg",
  "Químico, aseo y plásticos": "/subcategorias/quimico.jpg",
  "Construcción, infraestructura, obra civil, cemento y agregados": "/subcategorias/construccion.jpg",
  "Transporte, logística y puertos marítimos": "/subcategorias/transporte.jpg",
  "Manufactura, metalmecánica, siderúrgica y textiles": "/subcategorias/manufactura.jpg",
  "Ferretería y otros": "/subcategorias/ferreteria.jpg",
};

const CATEGORY_LABELS: Record<string, string> = {
  "Alimentos, Farmacéuticos y cosméticos": "Alimentos",
  Agroindustria: "Agroindustria",
  "Petróleo, minería, gas, energías renovables y petroquímica": "Petróleo",
  "Químico, aseo y plásticos": "Químico",
  "Construcción, infraestructura, obra civil, cemento y agregados": "Construcción",
  "Transporte, logística y puertos marítimos": "Transporte",
  "Manufactura, metalmecánica, siderúrgica y textiles": "Manufactura",
  "Ferretería y otros": "Ferretería",
};

const importCategories = categorias.map((title) => ({
  label: CATEGORY_LABELS[title] ?? title,
  title,
  image: CATEGORY_IMAGES[title] ?? "/home-import.png",
  count: "Ver productos",
  href: `/import/categoria/${slugify(title)}`,
}));

const importOffers = [
  { title: "Repuestos importados", href: "/import/categoria/transporte-logistica-y-puertos-maritimos", imageKey: "import-oferta-1" },
  { title: "Abastecimiento global", href: "/import", imageKey: "import-oferta-2" },
  { title: "Logistica internacional", href: "#contacto", imageKey: "import-oferta-3" },
  { title: "Compras por pedido", href: "#contacto", imageKey: "import-oferta-4" },
];

const importFeatured = [
  {
    title: "Importacion empresarial",
    href: "/import",
    imageKey: "import-destacada-1",
    subtitle: "Compras internacionales gestionadas de punta a punta para tu operacion.",
    ctaLabel: "Ver mas",
  },
  {
    title: "Proveedores verificados",
    href: "/import",
    imageKey: "import-destacada-2",
    subtitle: "Red de fabricantes y distribuidores auditados en origen.",
    ctaLabel: "Ver mas",
  },
  {
    title: "Logistica y aduana",
    href: "#contacto",
    imageKey: "import-destacada-3",
    subtitle: "Nacionalizacion, trazabilidad y entrega puerta a puerta.",
    ctaLabel: "Cotizar",
  },
  {
    title: "Abastecimiento recurrente",
    href: "#contacto",
    imageKey: "import-destacada-4",
    subtitle: "Reposicion programada para que nunca te quedes sin inventario.",
    ctaLabel: "Cotizar",
  },
];

export default async function ImportPage() {
  const siteImages = await getSiteImages();
  const allProducts = await getProducts();
  const importCatalog = allProducts.filter((product) => product.division === "Import");
  const importFeaturedProducts = importCatalog.filter((product) => product.destacado);
  const importProducts = (importFeaturedProducts.length > 0 ? importFeaturedProducts : importCatalog).slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <CauchosHeader division="Import" />

      <section id="catalogo-import" className="border-b border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-[1632px] px-5 py-7 md:px-8">
          <CauchosCategoryCarousel categories={importCategories} accent="red" />
        </div>
        <div className="bg-white text-white">
          <div
            className="mx-auto flex min-h-14 w-full flex-wrap items-center justify-center gap-4 bg-[#e31313] px-5 py-3 text-center md:px-8"
            style={{ maxWidth: "1632px" }}
          >
            <p className="text-lg font-black tracking-[-0.01em]">
              Importacion empresarial y abastecimiento global
            </p>
            <span className="rounded bg-white px-3 py-1 text-sm font-black text-[#e31313]">
              Asesoria integral
            </span>
            <span className="text-sm font-bold text-white/86">
              Repuestos, partes tecnicas, compras por volumen y logistica internacional.
            </span>
          </div>
        </div>
        <div className="bg-white">
          <div
            className="relative mx-auto aspect-[8/3] w-full overflow-hidden bg-slate-950"
            style={{ maxWidth: "1632px" }}
          >
            <Image
              src={resolveImage("import-principal", siteImages)}
              alt="GEU Import conecta proveedores y mercados internacionales"
              fill
              priority
              sizes="(min-width: 1632px) 1632px, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section id="productos" className="scroll-mt-56 border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-[1632px] px-5 py-12 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#e31313]">
                Productos destacados
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] md:text-5xl">
                Importados para compra empresarial
              </h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">
                Seleccion de referencias para abastecimiento continuo, pedidos especiales y homologacion tecnica.
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
        eyebrow="Ofertas Import"
        title="Soluciones listas para importar"
        ctaHref="/import"
        items={importOffers}
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
                Necesitas traer una referencia?
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.02em] text-white md:text-4xl">
                Hablemos de tu importacion
              </h2>
              <p className="mt-3 max-w-xl text-sm font-semibold leading-6 text-white/74">
                Te ayudamos a comprar, importar, nacionalizar y entregar las partes que tu operacion necesita.
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

      <BrandFeaturedSection
        title="Nuestras marcas destacadas"
        items={importFeatured}
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

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-[1632px] gap-8 px-5 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr] md:px-8">
          <div>
            <Image
              src="/logo-geu-import.png"
              alt="GEU Import"
              width={2000}
              height={452}
              className="h-auto w-[250px] max-w-full object-contain"
            />
            <p className="mt-5 max-w-[280px] text-sm leading-6 text-slate-600">
              Conectamos mercados y generamos oportunidades para que tu negocio no tenga limites.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Enlaces rapidos</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {navItems.slice(0, 6).map((item) => (
                <Link key={item.label} href={item.href} className={item.active ? "text-[#e31313]" : "hover:text-[#e31313]"}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Servicios</h3>
            <div className="mt-4 grid gap-2 text-sm font-bold text-slate-500">
              {["Importacion", "Fletes", "Aduana", "Abastecimiento", "Distribucion"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.12em]">Certificaciones</h3>
            <div className="mt-5 flex gap-3">
              {["ISO 9001", "BASC", "OEA"].map((item) => (
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
