import Image from "next/image";
import InnovationHeader from "../innovation-header";
import SolutionsCarousel from "../../energy/solutions-carousel";
import CountUpStats from "../count-up-stats";
import SiteFooter from "../../components/site-footer";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

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

const stovesProject = [
  {
    title: "Encuentro con la comunidad",
    text: "Visitamos a las familias para entender sus necesidades antes de entregar cada estufa.",
    image: "/geu-innovation-project-1.png",
  },
  {
    title: "Transporte hasta la vereda",
    text: "Llevamos cada estufa hasta comunidades de dificil acceso en zonas rurales.",
    image: "/geu-innovation-project-2.png",
  },
  {
    title: "Instalación y capacitación",
    text: "Instalamos la estufa y capacitamos a la familia en su uso seguro y eficiente.",
    image: "/geu-innovation-project-3.png",
  },
  {
    title: "Estufa ecoeficiente GEU",
    text: "Un diseño pensado para reducir el consumo de leña y mejorar la calidad del aire en el hogar.",
    image: "/geu-innovation-project-4.png",
  },
  {
    title: "Acompañamiento en sitio",
    text: "Nuestro equipo resuelve dudas y ajusta la estufa junto a cada familia.",
    image: "/geu-innovation-project-5.png",
  },
  {
    title: "Comunidad conectada",
    text: "Cada entrega fortalece el vínculo entre GEU y las comunidades donde trabajamos.",
    image: "/geu-innovation-project-6.png",
  },
];

const manufacturing = [
  {
    title: "Corte y armado del chasis",
    text: "Cortamos y armamos la estructura base de cada estufa en acero calibre industrial.",
    image: "/geu-innovation-fabrica-1.jpg",
  },
  {
    title: "Soldadura estructural",
    text: "Soldamos cada unión a mano para garantizar resistencia y durabilidad.",
    image: "/geu-innovation-fabrica-2.jpg",
  },
  {
    title: "Ensamble de puertas y detalles",
    text: "Ensamblamos puertas, bisagras y detalles funcionales de cada estufa.",
    image: "/geu-innovation-fabrica-3.jpg",
  },
  {
    title: "Acabados y pintura",
    text: "Aplicamos pintura de alta temperatura resistente al uso diario.",
    image: "/geu-innovation-fabrica-4.jpg",
  },
  {
    title: "Control de calidad",
    text: "Cada estufa lleva un sello de identificación y pasa control de calidad.",
    image: "/geu-innovation-fabrica-5.jpg",
  },
  {
    title: "Producto terminado",
    text: "Estufas listas para ser entregadas a las familias que las necesitan.",
    image: "/geu-innovation-fabrica-6.jpg",
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
  const t = (key: string) => resolveText(key, siteTexts);

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
            <SolutionsCarousel items={stovesProject} />
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-video w-full max-w-[1920px]">
          <video
            src="/geu-innovation-fabrica-video.mp4"
            poster="/geu-innovation-fabrica-video.png"
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
            <SolutionsCarousel items={manufacturing} />
          </div>
        </div>
      </section>

      <section id="contacto" className="overflow-hidden bg-black">
        <div className="relative mx-auto aspect-[1672/941] w-full max-w-[1920px]">
          <Image
            src="/geu-innovation-project-6.png"
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
