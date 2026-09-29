import Image from "next/image";
import Link from "next/link";
import SolutionsCarousel from "../energy/solutions-carousel";
import InnovationHeader from "./innovation-header";
import SiteFooter from "../components/site-footer";
import { getSiteImages, resolveImage, type SiteImages } from "@/lib/site-images";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

export const dynamic = "force-dynamic";

function getSolutions(siteImages: SiteImages) {
  return [
    {
      title: "Autoservicio 24/7",
      text: "Tu equipo se sirve solo: bebidas y snacks disponibles a cualquier hora, sin filas ni intermediarios.",
      image: resolveImage("innovation-tarjeta-autoservicio", siteImages),
    },
    {
      title: "Pago sin contacto",
      text: "Cada producto se registra al instante: cobro automático y trazabilidad total del consumo.",
      image: resolveImage("innovation-tarjeta-pago", siteImages),
    },
    {
      title: "Asistente GEU",
      text: "Un asistente siempre listo para reposición, mantenimiento y soporte técnico en sitio.",
      image: resolveImage("innovation-tarjeta-asistente", siteImages),
    },
    {
      title: "Espacios colaborativos",
      text: "Puntos GEU Innovation pensados para integrarse al ritmo de tu oficina o punto de venta.",
      image: resolveImage("innovation-tarjeta-espacios", siteImages),
    },
  ];
}

export default async function InnovationPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const solutions = getSolutions(siteImages);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <InnovationHeader />

      <section className="relative isolate flex min-h-screen flex-col overflow-hidden border-b border-white/10">
        <video
          src={resolveImage("innovation-hero-video", siteImages)}
          poster={resolveImage("innovation-principal", siteImages)}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover object-[58%_28%]"
        />
        <div className="absolute inset-0 bg-black/38" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.08)_56%,rgba(0,0,0,0.6)_100%)]" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col items-center justify-center px-5 text-center md:px-8">
          <div className="innovation-hero-intro flex max-w-2xl flex-col items-center">
            <h1 className="font-[family:var(--font-display)] text-5xl font-black uppercase leading-none tracking-[0.02em] text-white/85 md:text-7xl">
              {t("innovation-hero-titulo")}
            </h1>
            <Link
              href="#soluciones"
              className="mt-8 inline-flex items-center gap-3 rounded-[3px] border border-[#0498b4]/70 px-6 py-3.5 text-[12px] font-black uppercase tracking-[0.12em] text-[#0498b4] hover:bg-[#0498b4] hover:text-black"
            >
              Explorar soluciones <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-10 left-5 hidden flex-col items-center gap-3 md:left-8 lg:flex">
          <span className="h-8 w-px bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full border border-[#0498b4]" />
          <span className="[writing-mode:vertical-rl] text-[9px] font-black uppercase tracking-[0.3em] text-white/45">
            Scroll
          </span>
        </div>
      </section>

      <section id="soluciones" className="border-b border-white/10 bg-[#f2f2f2] text-slate-950">
        <div className="py-14">
          <h2 className="mx-auto max-w-xl px-5 text-center text-3xl font-black tracking-[-0.02em] md:px-8 md:text-4xl">
            {t("innovation-soluciones-titulo")}
          </h2>
          <div className="mx-auto mt-10 max-w-[1500px] px-5 md:px-8">
            <SolutionsCarousel items={solutions} hideDots />
          </div>
        </div>
      </section>

      <section id="sistema" className="relative overflow-hidden border-b border-white/10 bg-black">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[1920px] sm:aspect-[3/2] md:aspect-[1672/941]">
          <Image
            src={resolveImage("innovation-sistema-banner", siteImages)}
            alt="Asistente GEU Innovation junto a un punto inteligente, listo para dar soporte"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.02)_26%,rgba(0,0,0,0.02)_66%,rgba(0,0,0,0.78)_100%)]" />

          <div className="absolute inset-0 flex items-center pb-6 sm:pb-16 md:pb-28">
            <div className="mx-auto w-full max-w-[1500px] px-5 md:px-8">
              <div className="max-w-md">
                <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-[#0498b4]">
                  {t("innovation-sistema-eyebrow")} <span className="h-px w-10 bg-[#0498b4]" />
                </p>
                <h2 className="mt-3 font-[family:var(--font-display)] text-2xl font-black leading-[1.05] tracking-[-0.02em] text-white md:text-4xl">
                  {t("innovation-sistema-titulo")}
                </h2>
                <p className="mt-3 hidden max-w-sm text-sm font-semibold leading-6 text-white/80 md:block">
                  {t("innovation-sistema-subtitulo")}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-innovation.png"
        logoAlt="GEU Innovation"
        logoWidth={220}
        tagline={t("footer-innovation-tagline")}
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
