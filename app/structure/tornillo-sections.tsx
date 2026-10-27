import Image from "next/image";
import TornilloCarrusel, { type Aplicacion } from "./tornillo-carrusel";
import "./tornillo.css";

// Contenido de la línea "Tornillo" de GEU Structure (tornillos de cimentación
// sin concreto). Fuente: propuesta GEU-TORNILLO (Drive › GEU › GEU-TORNILLO),
// tomada de la presentación "2026 ExpoSolar American Ground Screw".

const ASSETS = "/structure-tornillo/";
// Escala de las barras ICC: la carga máxima (5,82 tf) queda cerca del 100 %.
const MAX_TF = 6;

const partesTornillo = [
  { titulo: ["Acero", "galvanizado"], texto: "Mayor resistencia a la corrosión.", img: "detalle-acero.jpg" },
  { titulo: ["Longitud según proyecto"], texto: "Disponible en diferentes diámetros y longitudes.", img: "detalle-longitud.jpg" },
  { titulo: ["Hélice continua soldada"], texto: "Genera mayor torque para máxima capacidad de carga.", img: "detalle-helice.jpg" },
  { titulo: ["Diseño cónico compactador"], texto: "Desplaza y compacta el suelo durante la instalación.", img: "detalle-cono.jpg" },
];

const cargasICC = [
  { diametro: "76 mm", suelo: "Arena sedimentosa", tension: 0.77, compresion: 1.11, lateral: 0.8 },
  { diametro: "76 mm", suelo: "Arcilla arenosa", tension: 2.87, compresion: 3.69, lateral: 1.07 },
  { diametro: "114 mm", suelo: "Arena sedimentosa", tension: 1.54, compresion: 2.26, lateral: 1.6 },
  { diametro: "114 mm", suelo: "Arcilla arenosa", tension: 4.37, compresion: 5.82, lateral: 1.99 },
];

const aplicaciones: Aplicacion[] = [
  { titulo: "Campos solares", img: "aplic-campos-solares.jpg" },
  { titulo: "Depósitos solares", img: "aplic-depositos-solares.jpg" },
  { titulo: "Obras municipales", img: "aplic-obras-municipales.jpg" },
  { titulo: "Señales", img: "aplic-senales-v2.jpg" },
  { titulo: "Cercas", img: "aplic-cercas.jpg" },
  { titulo: "Iluminación", img: "aplic-iluminacion-v2.jpg" },
  { titulo: "Muros de privacidad", img: "aplic-muros.jpg" },
  { titulo: "Construcción de casas", img: "aplic-casas.jpg" },
  { titulo: "Carreteras y autopistas", img: "aplic-carreteras.jpg" },
  { titulo: "Paisajismo", img: "aplic-paisajismo.jpg" },
  { titulo: "Contenedores modulares", img: "aplic-contenedores.jpg" },
];

type Pieza = { titulo: string; img: string; cubrir?: boolean };

const adaptadores: Pieza[] = [
  { titulo: "Adaptador 01", img: "adaptador-acople-eje.jpg", cubrir: true },
  { titulo: "Adaptador 02", img: "adaptador-cuadrado.jpg" },
  { titulo: "Adaptador 03", img: "adaptador-brida.jpg" },
];

const bridas: Pieza[] = [
  { titulo: "Modelos soldados", img: "brida-soldada-hex.jpg" },
  { titulo: "Modelos planos", img: "brida-plana-tubo.jpg" },
  { titulo: "Modelos en U", img: "brida-u-acero.jpg" },
];

const pasosConcreto = [
  "Limpieza de la obra",
  "Inspección de la obra",
  "Excavación",
  "Encofrado",
  "Refuerzo",
  "Colocación del hormigón",
  "Fraguado",
  "Retiro del encofrado",
  "Limpieza de la obra",
  "Construcción",
];

const pasosTornillo = [
  ["Inspección", "de la obra"],
  ["Colocación", "de los tornillos"],
  ["Construcción", "carga el mismo día"],
] as const;

const pasosEliminados = ["Excavación", "Encofrado", "Refuerzo", "Fraguado", "Retiro de encofrado", "Limpiezas"];

const fmt = (n: number) => n.toFixed(2).replace(".", ",");

function Barra({ clase, etiqueta, valor }: { clase: string; etiqueta: string; valor: number }) {
  return (
    <div>
      <div className="bar__lbl">
        <span className="sr-only">{etiqueta}</span>
        <b>
          {fmt(valor)} <small>tf</small>
        </b>
      </div>
      <div className="bar__track">
        <i className={clase} style={{ width: `${(valor / MAX_TF) * 100}%` }} />
      </div>
    </div>
  );
}

function Piezas({ items }: { items: Pieza[] }) {
  return (
    <div className="acc__row">
      {items.map((p) => (
        <figure key={p.img} className={p.cubrir ? "is-cover" : undefined}>
          <Image src={`${ASSETS}${p.img}`} alt={p.titulo} width={600} height={600} loading="lazy" />
          <figcaption>{p.titulo}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function TornilloSections() {
  return (
    <div className="tn">
      {/* 01 · Qué es */}
      <section className="sec intro-sec" id="producto">
        <div className="wrap">
          <div className="intro__head">
            <p className="eyebrow">Tecnología y diseño</p>
            <h2>Ingeniería que comienza desde el suelo.</h2>
            <p className="lead">
              Un anclaje moderno y rentable para proyectos pequeños y grandes. Fabricado en{" "}
              <strong>acero galvanizado</strong>, se atornilla directamente al terreno y está disponible en
              diferentes diámetros y longitudes para adaptarse al suelo y a las cargas.
            </p>
          </div>
          <div className="info">
            <svg className="info__lines" viewBox="0 0 1200 640" aria-hidden="true">
              <g className="info__rings">
                <circle cx="600" cy="330" r="120" />
                <circle cx="600" cy="330" r="175" />
                <circle cx="600" cy="330" r="235" />
              </g>
              <g className="info__paths">
                <path d="M430 150H515L567.5 63.6" />
                <path d="M620.9 178.5H690L770 150" />
                <path d="M430 470H510L575.6 482.4" />
                <path d="M619.7 644.8L690 470H770" />
              </g>
              <g className="info__dots">
                <circle cx="567.5" cy="63.6" r="5" />
                <circle cx="620.9" cy="178.5" r="5" />
                <circle cx="575.6" cy="482.4" r="5" />
                <circle cx="619.7" cy="644.8" r="5" />
              </g>
            </svg>
            <Image
              className="info__screw"
              src={`${ASSETS}tornillo-hd.png`}
              alt="Tornillo de cimentación de acero galvanizado"
              width={180}
              height={1939}
            />
            <div className="info__cards">
              {partesTornillo.map((p, i) => (
                <article key={p.img} className="pcard">
                  <div className="pcard__txt">
                    <span className="pcard__n">{String(i + 1).padStart(2, "0")}</span>
                    <h3>
                      {p.titulo.map((linea, j) => (
                        <span key={linea}>
                          {j > 0 && <br />}
                          {linea}
                        </span>
                      ))}
                    </h3>
                    <p>{p.texto}</p>
                  </div>
                  <Image
                    className="pcard__img"
                    src={`${ASSETS}${p.img}`}
                    alt={`Detalle: ${p.titulo.join(" ")}`}
                    width={352}
                    height={352}
                    loading="lazy"
                  />
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 02 · Alianza */}
      <section className="alliance">
        <div className="wrap alliance__in">
          <p className="eyebrow">Alianza estratégica en Colombia</p>
          <h2>Ingeniería norteamericana con respaldo local</h2>
          <div className="alliance__grid">
            <div className="partner">
              <Image src={`${ASSETS}logo-ags.png`} alt="American Ground Screw" width={460} height={219} />
              <p>Líder estadounidense en cimentación rápida libre de concreto.</p>
            </div>
            <div className="partner__plus">+</div>
            <div className="partner">
              <Image src={`${ASSETS}logo-tallerdos.png`} alt="Taller Dos Arquitectos" width={1147} height={394} />
              <p>Estructuración arquitectónica con soporte técnico local en Colombia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 · Ventajas */}
      <section className="sec sec--white" id="ventajas">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Rendimiento</p>
            <h2>Menos espera. Más avance en obra.</h2>
            <p className="lead">Así se compara el proceso de una cimentación en concreto con uno de tornillos de tierra.</p>
          </div>
          <div className="compare">
            <div className="col col--concrete">
              <div className="col__head">
                <b>Concreto</b>
                <span className="pill pill--warn">Depende del clima</span>
              </div>
              <ol className="steps">
                {pasosConcreto.map((paso, i) => (
                  <li key={i}>{paso}</li>
                ))}
              </ol>
            </div>
            <div className="col col--screw">
              <div className="col__head">
                <b>Tornillos de tierra</b>
                <span className="pill pill--ok">Independiente del clima</span>
              </div>
              <ol className="flow">
                {pasosTornillo.map(([titulo, detalle], i) => (
                  <li key={titulo}>
                    <span className="flow__n">{String(i + 1).padStart(2, "0")}</span>
                    <b>{titulo}</b>
                    <small>{detalle}</small>
                  </li>
                ))}
              </ol>
              <div className="cut">
                <span className="cut__lbl">Se eliminan</span>
                <p>{pasosEliminados.join(" · ")}</p>
              </div>
              <div className="big">
                <span className="big__n">−70%</span>
                <span className="big__t">pasos operativos eliminados frente a la cimentación en concreto</span>
              </div>
            </div>
          </div>
          <div className="stats">
            <div>
              <b>11 → 3</b>
              <span>De 11 procesos constructivos a 3 etapas de ejecución inmediata</span>
            </div>
            <div>
              <b>0%</b>
              <span>Concreto en la cimentación</span>
            </div>
            <div>
              <b>Mismo día</b>
              <span>La estructura recibe carga sin tiempo de fraguado</span>
            </div>
          </div>
        </div>
      </section>

      {/* 04 · Sostenibilidad */}
      <section className="sec green" id="sostenibilidad">
        <div className="wrap eco">
          <div>
            <p className="eyebrow">Sostenibilidad</p>
            <h2>Menor impacto ambiental</h2>
            <p className="lead">
              Una solución de cimentación que se integra con el entorno, reduce la intervención del terreno y
              favorece un desarrollo más sostenible.
            </p>
            <div className="eco__grid">
              <div className="eco__card">
                <span className="eco__ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7" />
                  </svg>
                </span>
                <div>
                  <b>Declaración Ambiental de Producto (EPD)</b>
                  <p>Información verificada sobre el desempeño ambiental.</p>
                </div>
              </div>
              <div className="eco__card">
                <span className="eco__ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21V11M12 11c0-3-2-6-6-6 0 4 2 6 6 6zM12 13c0-3 2-6 6-6 0 4-2 6-6 6z" />
                  </svg>
                </span>
                <div>
                  <b>Mínima alteración del terreno</b>
                  <p>Instalación sin excavaciones masivas, conservando el suelo natural.</p>
                </div>
              </div>
              <div className="eco__card">
                <span className="eco__ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9z" />
                    <text x="12.2" y="15.6" textAnchor="middle">
                      CO2
                    </text>
                  </svg>
                </span>
                <div>
                  <b>Menor huella de carbono</b>
                  <p>Reduce las emisiones frente a soluciones de cimentación tradicionales.</p>
                </div>
              </div>
              <div className="eco__card">
                <span className="eco__ic">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3M18 3v4h-4M6 21v-4h4" />
                  </svg>
                </span>
                <div>
                  <b>Desmontables y reutilizables</b>
                  <p>Se pueden retirar y reinstalar en otro sitio, prolongando su vida útil.</p>
                </div>
              </div>
            </div>
          </div>
          <Image
            className="eco__img"
            src={`${ASSETS}sostenibilidad-flores.jpg`}
            alt="Tornillos de cimentación bajo paneles solares entre flores silvestres"
            width={900}
            height={900}
            loading="lazy"
          />
        </div>
      </section>

      {/* 05 · Aplicaciones */}
      <section className="sec" id="aplicaciones">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Aplicaciones</p>
            <h2>Una solución para múltiples sectores</h2>
            <p className="lead">
              Desde infraestructura energética hasta equipamiento urbano, los tornillos de cimentación se adaptan a
              una amplia variedad de usos.
            </p>
          </div>
          <TornilloCarrusel items={aplicaciones} />
        </div>
      </section>

      {/* 06 · Cargas ICC */}
      <section className="sec dark" id="icc">
        <div className="wrap icc">
          <div>
            <p className="eyebrow">Certificación ICC</p>
            <h2>Cargas admisibles certificadas</h2>
            <p className="lead">
              Una línea de tornillos ha sido ensayada y certificada por <strong>ICC</strong>. El informe ICC-ESR
              presenta límites de carga para los modelos de uso común y sirve de referencia sobre el cumplimiento de
              estándares internacionales de construcción.
            </p>
            <p className="muted">
              La industria solar no siempre utiliza la norma ICC como estándar habitual; la certificación aporta
              información adicional sobre las capacidades del producto.
            </p>
            <div className="legend">
              <span>
                <i className="dot d1" />
                Tensión axial
              </span>
              <span>
                <i className="dot d2" />
                Compresión
              </span>
              <span>
                <i className="dot d3" />
                Lateral
              </span>
            </div>
          </div>
          <div className="icc__cards">
            {cargasICC.map((c) => (
              <article key={`${c.diametro}-${c.suelo}`} className="icard">
                <header>
                  <span className="icard__d">Ø {c.diametro}</span>
                  <span className="icard__s">{c.suelo}</span>
                </header>
                <Barra clase="d1" etiqueta="Tensión axial" valor={c.tension} />
                <Barra clase="d2" etiqueta="Compresión" valor={c.compresion} />
                <Barra clase="d3" etiqueta="Lateral" valor={c.lateral} />
              </article>
            ))}
          </div>
        </div>
        <p className="wrap notes">
          Empotramiento 1.600 – 2.000 mm. tf = tonelada de fuerza. ICC requiere factor de seguridad 2.0. Arena
          sedimentosa: 13 golpes SPT. Arcilla arenosa: 25 golpes SPT e índice de plasticidad 30.
        </p>
      </section>

      {/* 07 · Instalación */}
      <section className="sec sec--white" id="instalacion">
        <div className="wrap install">
          <div>
            <p className="eyebrow">Montaje</p>
            <h2>Opciones de instalación</h2>
            <p className="lead">La elección del equipo depende de la longitud del tornillo y de las condiciones del suelo.</p>
            <ol className="opts">
              <li>
                <span>01</span>
                <div>
                  <b>Máquina manual eléctrica</b>
                  <p>Adecuada para suelos favorables y sin grandes obstrucciones.</p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <b>Equipo hidráulico</b>
                  <p>Montado en minicargador o excavadora; aporta presión para suelos difíciles.</p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <b>Perforadora de roca</b>
                  <p>Permite perforar previamente cuando existe una obstrucción de roca sólida.</p>
                </div>
              </li>
            </ol>
            <div className="params">
              <div>
                <small>Torque</small>
                <b>6.000–8.000</b>
                <span>ft-lb · alto torque</span>
              </div>
              <div>
                <small>Velocidad</small>
                <b>10–12</b>
                <span>RPM · baja velocidad</span>
              </div>
              <div className="params--warn">
                <small>Límite</small>
                <b>&lt; 20</b>
                <span>RPM para asegurar el enganche con el suelo</span>
              </div>
            </div>
          </div>
          <Image
            className="install__img"
            src={`${ASSETS}instalacion-pilote.jpg`}
            alt="Excavadora con cabezal hidráulico instalando un tornillo de cimentación"
            width={619}
            height={1100}
            loading="lazy"
          />
        </div>
        <div className="wrap">
          <div className="install-video">
            <div className="install-video__text">
              <h3>
                Instalación <em>sin excavaciones</em>
              </h3>
              <ul className="proc">
                <li>
                  <span className="proc__ic">
                    <svg viewBox="0 0 24 24">
                      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
                    </svg>
                  </span>
                  Rápida
                </li>
                <li>
                  <span className="proc__ic">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7" />
                    </svg>
                  </span>
                  Menor
                  <br />
                  intervención
                </li>
                <li>
                  <span className="proc__ic">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
                    </svg>
                  </span>
                  Adaptable
                </li>
              </ul>
            </div>
            <div className="video-frame">
              <video
                src={`${ASSETS}video-instalacion.mp4`}
                poster={`${ASSETS}video-instalacion-poster.jpg`}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Animación de la instalación de un tornillo de cimentación"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 08 · Accesorios */}
      <section className="sec" id="accesorios">
        <div className="wrap">
          <div className="head">
            <p className="eyebrow">Accesorios y componentes</p>
            <h2>Adaptadores, bridas y conexiones</h2>
          </div>
          <div className="acc">
            <div className="acc__group">
              <h3>Adaptadores para equipos de instalación</h3>
              <p>
                Conectan el equipo de accionamiento con la cabeza del tornillo. Disponibles para{" "}
                <strong>venta o alquiler</strong>.
              </p>
              <Piezas items={adaptadores} />
            </div>
            <div className="acc__group">
              <h3>Bridas para la estructura superior</h3>
              <p>
                En aplicaciones solares es común insertar un tubo de 2” o 3” Schedule 40, por lo que las bridas no
                siempre son necesarias.
              </p>
              <Piezas items={bridas} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
