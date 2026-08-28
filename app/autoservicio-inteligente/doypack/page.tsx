import Image from "next/image";
import InnovationHeader from "../innovation-header";
import SiteFooter from "../../components/site-footer";
import { getSiteTexts, resolveText } from "@/lib/site-texts";
import { getSiteImages, resolveImage } from "@/lib/site-images";

export const dynamic = "force-dynamic";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Cauchos", href: "/cauchos" },
  { label: "Import", href: "/import" },
  { label: "Structure", href: "/innovation" },
  { label: "Energy", href: "/energy" },
  { label: "Plastic", href: "/plastic" },
  { label: "Nosotros", href: "/autoservicio-inteligente/nosotros" },
  { label: "Contacto", href: "mailto:innovation@geu.com.co" },
];

const stripPhotosBase = [
  { key: "doypack-galeria-1", alt: "Amigos compartiendo un doypack en una noche de juegos" },
  { key: "doypack-galeria-2", alt: "Pareja compartiendo un doypack en un festival de música" },
  { key: "doypack-galeria-3", alt: "Grupo de amigos compartiendo un doypack en una finca" },
];

function Marquee({ label, count }: { label: string; count: number }) {
  return (
    <div className="bg-[#0498b4]">
      <div className="mx-auto flex max-w-[1500px] items-center justify-center gap-x-8 px-5 py-3 md:gap-x-14 md:px-8">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className="whitespace-nowrap text-xs font-black uppercase tracking-[0.16em] text-white"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function InnovationDoypackPage() {
  const siteTexts = await getSiteTexts();
  const siteImages = await getSiteImages();
  const t = (key: string) => resolveText(key, siteTexts);

  const stripPhotos = stripPhotosBase.map(({ key, ...item }) => ({
    ...item,
    src: resolveImage(key, siteImages),
    key,
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <InnovationHeader />

      <section className="relative h-screen w-full overflow-hidden border-b border-white/10">
        <video
          src={resolveImage("doypack-hero-video", siteImages)}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.08)_56%,rgba(0,0,0,0.55)_100%)]" />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 md:left-8">
          <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-black uppercase tracking-[0.3em] text-white/70">
            Doypack
          </span>
        </div>
      </section>

      <div className="border-t border-t-[#0498b4] bg-black">
        <div className="mx-auto grid max-w-[1500px] grid-cols-3 px-5 py-3 md:px-8">
          {stripPhotos.map((photo) => (
            <span
              key={photo.key}
              className="text-center text-xs font-black uppercase tracking-[0.16em] text-white/85"
            >
              Empaque
            </span>
          ))}
        </div>
      </div>

      <section className="bg-white">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-0.5 px-5 py-5 md:grid-cols-3 md:px-8">
          {stripPhotos.map((photo) => (
            <div key={photo.key} className="relative aspect-[16/10]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white text-slate-950">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center gap-10 px-5 py-16 md:flex-row md:justify-center md:px-8 md:py-24">
          <div className="relative w-full shrink-0 md:w-[440px]">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-lg border border-[#0498b4]/40 bg-white">
              <Image
                src={resolveImage("doypack-producto", siteImages)}
                alt="Doypack GEU Innovation, empaque flexible con tapa dosificadora"
                fill
                sizes="(min-width: 768px) 420px, 80vw"
                className="object-contain p-4"
              />
            </div>

            <div className="absolute -bottom-6 right-6 h-24 w-32 overflow-hidden rounded-lg border-4 border-white shadow-[0_14px_28px_rgba(15,23,42,0.18)] md:right-0">
              <div className="relative h-full w-full">
                <Image
                  src={resolveImage("doypack-tapa-detalle", siteImages)}
                  alt="Detalle de la tapa dosificadora del doypack"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 max-w-xl shrink-0">
            <h2 className="text-3xl font-black tracking-[-0.02em] text-[#0498b4] md:text-4xl">
              {t("innovation-doypack-titulo")}
            </h2>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-6 text-slate-500">
              {t("innovation-doypack-descripcion")}
            </p>
          </div>
        </div>
      </section>

      <Marquee label="Tetrapack" count={7} />

      <section className="bg-white text-slate-950">
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-8 md:py-24">
          <h2 className="text-center text-3xl font-black tracking-[-0.02em] text-[#0498b4] md:text-4xl">
            {t("innovation-doypack-uso-titulo")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm font-semibold leading-6 text-slate-500">
            {t("innovation-doypack-uso-descripcion")}
          </p>

          <div className="mt-10 flex flex-col items-start gap-8 md:flex-row">
            <div className="relative w-full md:w-2/3">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
                <Image
                  src={resolveImage("doypack-skate-main", siteImages)}
                  alt="Persona patinando con un doypack en su cinturón"
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="absolute -bottom-8 right-4 hidden h-32 w-40 overflow-hidden rounded-lg border-4 border-white shadow-[0_18px_34px_rgba(15,23,42,0.2)] sm:block md:right-10">
                <Image
                  src={resolveImage("doypack-skate-detail", siteImages)}
                  alt="Detalle del doypack sujeto al cinturón"
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>

            <p className="max-w-sm text-sm font-semibold leading-6 text-slate-500 md:mt-2">
              {t("innovation-doypack-uso-detalle")}
            </p>
          </div>

          <p className="mt-14 text-right text-2xl font-black tracking-[-0.02em] text-[#0498b4] md:mt-10">
            {t("innovation-doypack-uso-etiqueta")}
          </p>
        </div>
      </section>

      <section className="relative aspect-[16/9] w-full overflow-hidden border-b border-white/10 md:aspect-[21/9]">
        <Image
          src={resolveImage("doypack-cierre-festival", siteImages)}
          alt="Amigos disfrutando un doypack en un festival de música"
          fill
          sizes="100vw"
          className="object-cover"
        />
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
