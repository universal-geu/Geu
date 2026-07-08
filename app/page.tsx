import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { geuCompanies } from "./data/geu-companies";

const homeCards = [
  {
    ...geuCompanies[0],
    image: "/home-cauchos.png",
    alt: "Rollos de caucho industrial en una fabrica iluminada en azul.",
  },
  {
    ...geuCompanies[1],
    image: "/home-import.png",
    alt: "Contenedor rojo en puerto industrial al atardecer.",
  },
  {
    ...geuCompanies[2],
    image: "/home-innovation.png",
    alt: "Bombillo luminoso en entorno tecnologico.",
  },
  {
    ...geuCompanies[3],
    image: "/home-energy.png",
    alt: "Paneles solares y aerogeneradores al atardecer.",
  },
  {
    ...geuCompanies[4],
    image: "/home-plastic.png",
    alt: "Perfiles plasticos industriales sobre materia prima blanca.",
  },
];

export default function Home() {
  return (
    <main
      className="geu-entry-home"
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
        background: "#ffffff",
        color: "#0b2f7e",
        padding: 0,
      }}
    >
      <Link
        href="/quienes-somos"
        className="geu-entry-about"
        style={{
          position: "absolute",
          top: "clamp(1.2rem, 4.7vh, 2.1rem)",
          right: "clamp(1rem, 2vw, 1.9rem)",
          zIndex: 4,
          color: "#0b419a",
          fontSize: "clamp(0.72rem, 0.86vw, 0.9rem)",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        Nosotros
      </Link>

      <header
        className="geu-entry-brand"
        aria-label="Grupo Empresarial Universal"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          margin: 0,
          padding: "clamp(1.4rem, 4vh, 3rem) clamp(1rem, 3vw, 2rem) clamp(1.1rem, 3vh, 1.8rem)",
          flex: "0 0 auto",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url('/geu-home-texture.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          borderBottom: "1px solid rgba(15,23,42,0.12)",
        }}
      >
        <span className="geu-entry-logo-wrap">
          <Image
            src="/home-geu-logo.png"
            alt="GEU Grupo Empresarial Universal"
            width={2048}
            height={768}
            priority
            style={{
              width: "min(56vw, 48rem)",
              minWidth: "22rem",
              height: "auto",
              objectFit: "contain",
            }}
            className="geu-entry-logo"
          />
        </span>
      </header>

      <section
        className="geu-entry-grid"
        aria-label="Unidades de negocio GEU"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gridAutoRows: "1fr",
          gap: 0,
          width: "100%",
          margin: 0,
          flex: "1 1 auto",
          minHeight: "clamp(26rem, 55vh, 43rem)",
        }}
      >
        {homeCards.map((company, index) => (
          <Link
            key={company.slug}
            href={company.href}
            aria-label={`Entrar a ${company.name}`}
            className="geu-entry-card"
            style={
              {
                "--accent": company.accent,
                "--card-index": index,
                position: "relative",
                display: "block",
                minHeight: "100%",
                overflow: "hidden",
                isolation: "isolate",
                background: "#05070b",
                color: "white",
                borderRight: index < homeCards.length - 1 ? "3px solid #ffffff" : "0",
                opacity: 1,
                transform: "none",
                animation: "none",
              } as CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.image}
              alt={company.alt}
              className="geu-entry-card-image"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <span
              className="geu-entry-card-shade"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
              }}
            />
            <span className="geu-entry-card-glow" />
            <span className="geu-entry-card-scan" />
              <span
                className="geu-entry-card-copy"
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "clamp(1.25rem, 4.5vh, 3.2rem)",
                  zIndex: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "min(82%, 17rem)",
                  textAlign: "center",
                  textTransform: "uppercase",
                  transform: "translateX(-50%)",
                }}
              >
              <span
                className="geu-entry-accent"
                style={{
                  display: "block",
                  width: "clamp(2.6rem, 5vw, 4rem)",
                  height: "0.16rem",
                  marginBottom: "clamp(0.42rem, 1.3vh, 0.7rem)",
                  background: company.accent,
                }}
              />
              <span
                className="geu-entry-eyebrow"
                style={{
                  fontSize: "clamp(0.78rem, 1vw, 1rem)",
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: 0,
                }}
              >
                {company.eyebrow}
              </span>
              <span
                  className="geu-entry-title"
                  style={{
                  marginTop: "0.05rem",
                  fontSize: "clamp(1.35rem, 2.1vw, 2.25rem)",
                  fontWeight: 950,
                  lineHeight: 0.9,
                  letterSpacing: 0,
                }}
              >
                {company.title}
              </span>
              <span
                className="geu-entry-description"
                style={{
                  maxWidth: "15rem",
                  marginTop: "clamp(0.35rem, 1vh, 0.58rem)",
                  color: "rgba(255,255,255,0.86)",
                  fontSize: "clamp(0.66rem, 0.82vw, 0.86rem)",
                  fontWeight: 700,
                  lineHeight: 1.24,
                  textTransform: "none",
                }}
              >
                {company.description}
              </span>
              <span
                className="geu-entry-cta"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginTop: "clamp(0.95rem, 2.1vh, 1.35rem)",
                  color: "#ffffff",
                  fontSize: "clamp(0.78rem, 0.95vw, 1rem)",
                  fontWeight: 800,
                  lineHeight: 1,
                  textTransform: "none",
                }}
              >
                Entrar <span aria-hidden="true">→</span>
              </span>
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}
