import type { ReactNode } from "react";
import SiteFooter from "./site-footer";
import { getSiteTexts, resolveText } from "@/lib/site-texts";

const navItems = [
  { label: "Inicio", href: "/" },
  { label: "Nosotros", href: "/quienes-somos" },
];

type LegalPageLayoutProps = {
  title: string;
  updatedAt: string;
  children: ReactNode;
};

export default async function LegalPageLayout({ title, updatedAt, children }: LegalPageLayoutProps) {
  const siteTexts = await getSiteTexts();
  const t = (key: string) => resolveText(key, siteTexts);

  return (
    <main className="min-h-screen bg-white text-[#071832]">
      <section className="mx-auto max-w-[840px] px-6 py-16 md:px-8 md:py-20">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#075ed8]">Legal</p>
        <span className="mt-3 block h-[2px] w-16 bg-[#075ed8]" />
        <h1 className="mt-6 text-[clamp(2rem,4vw,3rem)] font-black leading-[1.05] tracking-[-0.02em]">
          {title}
        </h1>
        <p className="mt-3 text-sm font-semibold text-slate-500">Última actualización: {updatedAt}</p>

        <div className="legal-prose mt-12">{children}</div>
      </section>

      <SiteFooter
        logoSrc="/home-geu-logo.png"
        logoAlt="GEU Grupo Empresarial Universal"
        logoWidth={190}
        tagline={t("footer-copyright-name")}
        navItems={navItems}
        accent="#075ed8"
        siteTexts={siteTexts}
        columns={[]}
      />
    </main>
  );
}
