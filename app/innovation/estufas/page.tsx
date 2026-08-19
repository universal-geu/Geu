import Image from "next/image";
import InnovationHeader from "../innovation-header";
import SolutionsCarousel from "../../energy/solutions-carousel";
import CountUpStats from "../count-up-stats";
import SiteFooter from "../../components/site-footer";
import { getSiteTexts, resolveText } from "@/lib/site-texts";
import { getSiteImages, resolveImage } from "@/lib/site-images";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Innovation", href: "/innovation", active: true },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/innovation/nosotros" },
  { label: "Contacto", href: "/innovation/estufas#contacto" },
];

const stovesProjectBase = [
  {
    title: "Encuentro con la comunidad",
    text: "Visitamos a las familias para entender sus necesidades antes de entregar cada estufa.",
    key: "estufas-proyecto-1",
  },
  {
    title: "Transporte hasta la vereda",
    text: "Llevamos cada estufa hasta comunidades de dificil acceso en zonas rurales.",
    key: "estufas-proyecto-2",
  },
  {
    title: "Instalación y capacitación",
    text: "Instalamos la estufa y capacitamos a la familia en su uso seguro y eficiente.",
    key: "estufas-proyecto-3",
  },
  {
    title: "Estufa ecoeficiente GEU",
    text: "Un diseño pensado para reducir el consumo de leña y mejorar la calidad del aire en el hogar.",
    key: "estufas-proyecto-4",
  },
  {
    title: "Acompañamiento en sitio",
    text: "Nuestro equipo resuelve dudas y ajusta la estufa junto a cada familia.",
    key: "estufas-proyecto-5",
  },
  {
    title: "Comunidad conectada",
    text: "Cada entrega fortalece el vínculo entre GEU y las comunidades donde trabajamos.",
    key: "estufas-proyecto-6",
  },
];

const manufacturingBase = [
  {
    title: "Corte y armado del chasis",
    text: "Cortamos y armamos la estructura base de cada estufa en acero calibre industrial.",
    key: "estufas-fabrica-1",
  },
  {
    title: "Soldadura estructural",
    text: "Soldamos cada unión a mano para garantizar resistencia y durabilidad.",
    key: "estufas-fabrica-2",
  },
  {
    title: "Ensamble de puertas y detalles",
    text: "Ensamblamos puertas, bisagras y detalles funcionales de cada estufa.",
    key: "estufas-fabrica-3",
  },
  {
    title: "Acabados y pintura",
    text: "Aplicamos pintura de alta temperatura resistente al uso diario.",
    key: "estufas-fabrica-4",
  },
  {
    title: "Control de calidad",
    text: "Cada estufa lleva un sello de identificación y pasa control de calidad.",
    key: "estufas-fabrica-5",
  },
  {
    title: "Producto terminado",
    text: "Estufas listas para ser entregadas a las familias que las necesitan.",
    key: "estufas-fabrica-6",
  },
];

const stovesImpact = [
  { value: 120, unit: "+", label: "Estufas entregadas" },
  { value: 480, unit: "+", label: "Personas beneficiadas" },
  { value: 15, unit: "", label: "Municipios atendidos" },
  { value: 100, unit: "%", label: "Fabricación artesanal nacional" },
];

export default async function InnovationEstufasPage() {
  const siteTexts = await getSiteTexts();
  const siteImages = await getSiteImages();
  const t = (key: string) => resolveText(key, siteTexts);

  const stovesProject = stovesProjectBase.map(({ key, ...item }) => ({
    ...item,
    image: resolveImage(key, siteImages),
  }));

  const manufacturing = manufacturingBase.map(({ key, ...item }) => ({
    ...item,
    image: resolveImage(key, siteImages),
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <InnovationHeader />

      <div className="h-20" />

      <section id="proyectos" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="py-14">
          <div className="mx-auto max-w-[1500px] px-5 md:px-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
              {t("innovation-proyecto-estufas-eyebrow")}
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.02em] md:text-4xl">
              {t("innovation-proyecto-estufas-titulo")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              {t("innovation-proyecto-estufas-subtitulo")}
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-[1500px] px-5 md:px-8">
            <SolutionsCarousel items={stovesProject} hideDots />
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-video w-full max-w-[1920px]">
          <video
            src={resolveImage("estufas-fabrica-video", siteImages)}
            poster={resolveImage("estufas-fabrica-video-poster", siteImages)}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.05)_35%,rgba(0,0,0,0.05)_65%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="w-full max-w-[1500px]">
              <CountUpStats items={stovesImpact} />
            </div>
          </div>
        </div>
      </section>

      <section id="fabricacion" className="border-b border-white/10 bg-white text-slate-950">
        <div className="py-14">
          <div className="mx-auto max-w-[1500px] px-5 md:px-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
              {t("innovation-fabricacion-eyebrow")}
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.02em] md:text-4xl">
              {t("innovation-fabricacion-titulo")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              {t("innovation-fabricacion-subtitulo")}
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-[1500px] px-5 md:px-8">
            <SolutionsCarousel items={manufacturing} hideDots />
          </div>
        </div>
      </section>

      <section id="contacto" className="overflow-hidden bg-black">
        <div className="relative mx-auto aspect-[1672/941] w-full max-w-[1920px]">
          <Image
            src={resolveImage("estufas-contacto-fondo", siteImages)}
            alt="Familia y equipo GEU reunidos junto a la estufa instalada, con vista a las montañas"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href="mailto:innovation@geu.com.co"
              className="inline-flex items-center gap-3 rounded-[3px] border border-white bg-white px-8 py-4 text-[12px] font-black uppercase tracking-[0.12em] text-[#071225] shadow-[0_12px_30px_rgba(0,0,0,0.25)] hover:bg-[#0498b4] hover:text-white"
            >
              Contacto <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-innovation.png"
        logoAlt="GEU Innovation"
        logoWidth={220}
        tagline={t("footer-innovation-tagline")}
        navItems={navItems}
        accent="#0498b4"
        variant="dark"
        darkBg="#050505"
        siteTexts={siteTexts}
        maxWidth="1500px"
        columns={[]}
      />
    </main>
  );
}
