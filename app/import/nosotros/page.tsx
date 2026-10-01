import Image from "next/image";
import CauchosHeader from "../../components/cauchos-header";
import SiteFooter from "../../components/site-footer";
import { getSiteImages, resolveImage } from "@/lib/site-images";
import { getSiteTexts, resolveText } from "@/lib/site-texts";
import { getNosotrosContent } from "@/lib/nosotros-texts";

export const dynamic = "force-dynamic";



function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">
      <span className="h-px w-8 bg-[#e31313]" />
      {children}
    </p>
  );
}

export default async function ImportNosotrosPage() {
  const siteImages = await getSiteImages();
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);
  const nosotros = getNosotrosContent("Import", t);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-950">
      <CauchosHeader division="Import" />

      <section className="relative overflow-hidden bg-[#e4eaf1] md:bg-white">
        <Image
          src={resolveImage("import-nosotros-banner", siteImages)}
          alt="Logística portuaria GEU Import"
          width={1920}
          height={768}
          priority
          className="absolute bottom-0 right-0 h-auto w-[210%] max-w-none md:inset-0 md:h-full md:w-full md:max-w-full md:object-cover md:object-center"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[84vw] bg-gradient-to-b from-[#e4eaf1] via-[#e4eaf1]/0 to-transparent md:hidden"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 pb-[66vw] pt-10 md:px-8 md:py-32">
          <h1 className="max-w-2xl text-4xl font-medium leading-[1.15] tracking-[-0.01em] text-slate-950 md:text-6xl">
            {t("import-nosotros-hero-titulo")}
          </h1>
          <p className="mt-8 max-w-xl text-[15px] font-normal leading-8 text-slate-600">
            {t("import-nosotros-hero-subtitulo")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-[#e31313]/[0.07] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <ul className="grid gap-y-14 md:grid-cols-3 md:gap-x-14 md:gap-y-0">
            {nosotros.pilares.map((pilar, index) => (
              <li
                key={index}
                className={`pt-8 md:pt-0 ${index === 0 ? "" : "border-t border-slate-200 md:border-t-0 md:border-l md:pl-14"}`}
              >
                <h2 className="text-lg font-bold uppercase tracking-[0.06em] text-[#e31313]">
                  {pilar.title}
                </h2>
                <p className="mt-4 text-sm font-normal leading-7 text-slate-500">
                  {pilar.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div
          className="pointer-events-none absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-[#e31313]/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>{nosotros.label("valores")}</SectionLabel>
          <h2 className="mt-5 max-w-lg text-2xl font-medium leading-tight tracking-[-0.01em] text-slate-950 md:text-3xl">
            {t("import-valores-titulo")}
          </h2>

          <ul className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {nosotros.valores.map((valor, index) => (
              <li key={index} className="group border-t border-slate-200 pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#e31313]/25 bg-[#e31313]/[0.06] font-mono text-[10px] font-medium tabular-nums text-[#e31313]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-950">
                    {valor.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm font-normal leading-6 text-slate-500">
                  {valor.description}
                </p>
                <span className="mt-4 block h-px w-0 bg-[#e31313] transition-all duration-500 ease-out group-hover:w-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-[1632px] grid-cols-2 gap-3 px-5 py-10 md:grid-cols-4 md:px-8">
          {(["import-nosotros-1", "import-nosotros-2", "import-nosotros-3", "import-nosotros-4"] as const).map(
            (key) => (
              <div key={key} className="relative aspect-[4/3] overflow-hidden rounded-[6px]">
                <Image
                  src={resolveImage(key, siteImages)}
                  alt="GEU Import"
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-[1632px] px-5 py-20 md:px-8">
          <SectionLabel>{nosotros.label("filosofia")}</SectionLabel>
          <p className="mt-8 max-w-2xl border-l border-[#e31313]/40 pl-8 text-xl font-normal leading-9 tracking-[-0.005em] text-slate-700 md:text-2xl">
            {t("import-filosofia-texto")}
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#140505]">
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, rgba(20,5,5,0.98) 0%, rgba(31,8,8,0.9) 55%, rgba(227,19,19,0.3) 100%), radial-gradient(circle at 15% 80%, rgba(227,19,19,0.32), transparent 36%)",
          }}
        />
        <div className="relative mx-auto max-w-[1632px] px-5 py-24 md:px-8 md:py-28">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ff8080]">
            <span className="h-px w-8 bg-[#e31313]" />
            {nosotros.label("promesa")}
          </p>
          <p className="mt-8 max-w-3xl text-3xl font-medium leading-tight tracking-[-0.015em] text-white md:text-5xl">
            {t("import-promesa-titulo")}
          </p>
        </div>
      </section>

      <SiteFooter
        logoSrc="/logo-geu-import.png"
        logoAlt="GEU Import"
        logoWidth={220}
        tagline={t("footer-import-tagline")}
        accent="#e31313"
        siteTexts={siteTexts}
        columns={[]}
      />
    </main>
  );
}
