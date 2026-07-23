import Image from "next/image";
import Link from "next/link";
import { resolveText, type SiteTexts } from "@/lib/text-slots";

type FooterColumn = {
  title: string;
  items: string[];
  style?: "list" | "badges" | "chips";
};

type FooterNavItem = { label: string; href: string; active?: boolean };

type SiteFooterProps = {
  logoSrc: string;
  logoAlt: string;
  logoWidth?: number;
  tagline: string;
  navItems: FooterNavItem[];
  columns: FooterColumn[];
  accent: string;
  variant?: "light" | "dark";
  darkBg?: string;
  siteTexts: SiteTexts;
  maxWidth?: string;
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.6h2.55l.38-2.96h-2.93V8.55c0-.86.24-1.44 1.47-1.44h1.57V4.46A21 21 0 0 0 14.3 4.3c-2.26 0-3.8 1.38-3.8 3.9v2.24H7.94v2.96h2.56V21h3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <rect x="3.5" y="8.5" width="3" height="11.5" />
      <circle cx="5" cy="5" r="1.9" />
      <path d="M10.5 8.5H13.5V10.2C14.1 9 15.6 8.2 17.1 8.2C20 8.2 20.5 10.1 20.5 12.9V20H17.5V13.5C17.5 12 17.5 10.1 15.4 10.1C13.3 10.1 13 11.7 13 13.4V20H10.5V8.5Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
      <path d="M10.5 9.7 15 12l-4.5 2.3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function SiteFooter({
  logoSrc,
  logoAlt,
  logoWidth = 250,
  tagline,
  navItems,
  columns,
  accent,
  variant = "light",
  darkBg = "#061735",
  siteTexts,
  maxWidth = "1632px",
}: SiteFooterProps) {
  const isDark = variant === "dark";
  const phone = resolveText("header-phone", siteTexts);
  const copyrightName = resolveText("footer-copyright-name", siteTexts);
  const socials = [
    { key: "footer-social-facebook-url", Icon: FacebookIcon, label: "Facebook" },
    { key: "footer-social-instagram-url", Icon: InstagramIcon, label: "Instagram" },
    { key: "footer-social-linkedin-url", Icon: LinkedInIcon, label: "LinkedIn" },
    { key: "footer-social-youtube-url", Icon: YoutubeIcon, label: "YouTube" },
  ]
    .map((social) => ({ ...social, url: resolveText(social.key, siteTexts, "") }))
    .filter((social) => social.url);

  return (
    <footer
      className={isDark ? "text-white" : "border-t border-slate-200 bg-white"}
      style={isDark ? { backgroundColor: darkBg } : undefined}
    >
      <div
        className="mx-auto grid gap-8 px-5 py-10 md:px-8"
        style={{ maxWidth, gridTemplateColumns: `1.2fr repeat(${1 + columns.length}, 1fr)` }}
      >
        <div>
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={2000}
            height={452}
            className={`h-auto max-w-full object-contain ${isDark ? "brightness-0 invert" : ""}`}
            style={{ width: logoWidth }}
          />
          <p className={`mt-5 max-w-[280px] text-sm leading-6 ${isDark ? "text-white/70" : "text-slate-600"}`}>
            {tagline}
          </p>
        </div>

        <div>
          <h3 className={`text-sm font-black uppercase tracking-[0.12em] ${isDark ? "text-white" : "text-slate-950"}`}>
            Enlaces rapidos
          </h3>
          <div className={`mt-4 grid gap-2 text-sm font-bold ${isDark ? "text-white/82" : "text-slate-500"}`}>
            {navItems.slice(0, 7).map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={item.active ? { color: accent } : undefined}
                className={item.active ? "" : isDark ? "hover:text-white" : "hover:opacity-70"}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className={`text-sm font-black uppercase tracking-[0.12em] ${isDark ? "text-white" : "text-slate-950"}`}>
              {column.title}
            </h3>
            {column.style === "badges" ? (
              <div className="mt-5 flex flex-wrap gap-3">
                {column.items.map((item) => (
                  <span
                    key={item}
                    className={`flex h-16 w-16 items-center justify-center rounded-full border text-center text-[10px] font-black ${
                      isDark ? "border-white/25 text-white/80" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : column.style === "chips" ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {column.items.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full border px-3 py-2 text-center text-[10px] font-black ${
                      isDark ? "border-white/25 text-white/80" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <div className={`mt-4 grid gap-2 text-sm font-bold ${isDark ? "text-white/82" : "text-slate-500"}`}>
                {column.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className={`mx-auto flex flex-wrap items-center justify-between gap-3 border-t px-5 py-5 text-xs font-semibold md:px-8 ${
          isDark ? "border-white/10 text-white/55" : "border-slate-200 text-slate-500"
        }`}
        style={{ maxWidth }}
      >
        <span>
          © {new Date().getFullYear()} {copyrightName}
          {phone ? ` · ${phone}` : ""}
        </span>
        {socials.length > 0 && (
          <div className="flex gap-2">
            {socials.map((social) => (
              <a
                key={social.key}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                  isDark
                    ? "border-white/25 text-white/70 hover:border-white hover:text-white"
                    : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                <social.Icon />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
