import type { TextSlot } from "@/lib/text-slots";

// Editable copy of the "Nosotros" pages (misión/visión/propósito, valores,
// cifras and section labels). The defaults below are the texts the pages
// used to hardcode; each one becomes a text slot (group "Nosotros") so it can
// be changed from "Editar textos en tiempo real".

export type NosotrosDivision = "Cauchos" | "Import" | "Plastic" | "Energy";

type Item = { title: string; description: string };
type Metric = { value: string; label: string };
type LabelKey = "eyebrow" | "valores" | "filosofia" | "cifras" | "ecosistema" | "promesa";

const PREFIX: Record<NosotrosDivision, string> = {
  Cauchos: "cauchos",
  Import: "import",
  Plastic: "plastic",
  Energy: "energy",
};

const GROUP_VISION =
  "Para el año 2035, ser uno de los grupos empresariales líderes en Latinoamérica en soluciones industriales y tecnológicas, reconocido por su innovación, excelencia y generación de valor para clientes, aliados y colaboradores.";
const GROUP_PURPOSE =
  "Impulsar el desarrollo de la industria conectando oportunidades globales con las necesidades de Latinoamérica.";

const GROUP_VALUES: Item[] = [
  { title: "Integridad", description: "Actuamos con ética, transparencia y coherencia en cada decisión." },
  { title: "Compromiso", description: "Cumplimos lo que prometemos y asumimos cada desafío con responsabilidad." },
  { title: "Innovación", description: "Buscamos constantemente mejores soluciones para nuestros clientes y el mercado." },
  { title: "Excelencia", description: "Trabajamos con altos estándares de calidad en todo lo que hacemos." },
  { title: "Orientación al cliente", description: "Escuchamos, entendemos y generamos soluciones que aportan valor." },
  { title: "Trabajo en equipo", description: "Creemos en la colaboración como motor del crecimiento y los resultados." },
  { title: "Pasión por servir", description: "Disfrutamos ayudar a nuestros clientes a alcanzar sus objetivos." },
];

const BASE_LABELS: Partial<Record<LabelKey, string>> = {
  valores: "Valores corporativos",
  filosofia: "Filosofía empresarial",
  promesa: "Promesa de marca",
};

const CONTENT: Record<
  NosotrosDivision,
  { pilares: Item[]; valores: Item[]; metricas: Metric[]; labels: Partial<Record<LabelKey, string>> }
> = {
  Cauchos: {
    pilares: [
      {
        title: "Misión",
        description:
          "Consolidar empresas industriales que creen soluciones confiables y eleven el estándar técnico del mercado colombiano.",
      },
      { title: "Visión", description: GROUP_VISION },
      { title: "Propósito", description: GROUP_PURPOSE },
    ],
    valores: GROUP_VALUES,
    metricas: [
      { value: "50+", label: "Años de experiencia" },
      { value: "1200+", label: "Clientes" },
      { value: "5", label: "Unidades de negocio" },
      { value: "98%", label: "Satisfacción del cliente" },
    ],
    labels: { ...BASE_LABELS, cifras: "Cifras del grupo", ecosistema: "Nuestro ecosistema" },
  },
  Import: {
    pilares: [
      {
        title: "Misión",
        description:
          "Conectar la industria con soluciones de clase mundial, generando valor a través de la innovación, la confianza y un servicio excepcional.",
      },
      { title: "Visión", description: GROUP_VISION },
      { title: "Propósito", description: GROUP_PURPOSE },
    ],
    valores: GROUP_VALUES,
    metricas: [],
    labels: BASE_LABELS,
  },
  Plastic: {
    pilares: [
      {
        title: "Misión",
        description:
          "Consolidar empresas industriales que creen soluciones confiables y eleven el estándar técnico del mercado colombiano.",
      },
      { title: "Visión", description: GROUP_VISION },
      { title: "Propósito", description: GROUP_PURPOSE },
    ],
    valores: GROUP_VALUES,
    metricas: [],
    labels: BASE_LABELS,
  },
  Energy: {
    pilares: [
      {
        title: "Misión",
        description:
          "Impulsar la transición energética mediante soluciones innovadoras que generen eficiencia, sostenibilidad y valor para nuestros clientes y la sociedad.",
      },
      {
        title: "Visión",
        description:
          "Para el año 2035, ser una empresa referente en Latinoamérica en soluciones para infraestructura energética, reconocida por su innovación, calidad y compromiso con el desarrollo sostenible.",
      },
      {
        title: "Propósito",
        description:
          "Contribuir a un futuro más sostenible desarrollando soluciones que impulsen la transformación energética de Latinoamérica.",
      },
    ],
    valores: [
      { title: "Compromiso", description: "Trabajamos con responsabilidad para construir un mejor futuro." },
      { title: "Innovación", description: "Buscamos constantemente nuevas tecnologías que generen impacto positivo." },
      { title: "Sostenibilidad", description: "Cada decisión considera el bienestar del planeta y de las futuras generaciones." },
      { title: "Excelencia", description: "Diseñamos soluciones con altos estándares de calidad y desempeño." },
      { title: "Integridad", description: "Actuamos con transparencia, ética y responsabilidad." },
      { title: "Trabajo en equipo", description: "Creemos que los grandes proyectos se construyen colaborando." },
      { title: "Pasión por transformar", description: "Nos inspira crear soluciones que generen un cambio positivo." },
    ],
    metricas: [],
    labels: { ...BASE_LABELS, eyebrow: "Nosotros" },
  },
};

const LABEL_NAMES: Record<LabelKey, string> = {
  eyebrow: "Antetítulo de la portada",
  valores: "Antetítulo de valores",
  filosofia: "Antetítulo de filosofía",
  cifras: "Antetítulo de cifras",
  ecosistema: "Antetítulo de ecosistema",
  promesa: "Antetítulo de cierre",
};

const pilarKey = (division: NosotrosDivision, index: number, part: "titulo" | "texto") =>
  `${PREFIX[division]}-nosotros-pilar-${index + 1}-${part}`;
const valorKey = (division: NosotrosDivision, index: number, part: "titulo" | "texto") =>
  `${PREFIX[division]}-nosotros-valor-${index + 1}-${part}`;
const cifraKey = (division: NosotrosDivision, index: number, part: "valor" | "etiqueta") =>
  `${PREFIX[division]}-nosotros-cifra-${index + 1}-${part}`;
const labelKey = (division: NosotrosDivision, label: LabelKey) => `${PREFIX[division]}-nosotros-label-${label}`;

export function getNosotrosTextSlots(): TextSlot[] {
  return (Object.keys(CONTENT) as NosotrosDivision[]).flatMap((division) => {
    const content = CONTENT[division];
    const slot = (key: string, label: string, defaultValue: string, multiline = false): TextSlot => ({
      key,
      label: `Nosotros · ${label}`,
      group: "Nosotros",
      division,
      defaultValue,
      multiline,
    });

    return [
      ...(Object.entries(content.labels) as Array<[LabelKey, string]>).map(([label, value]) =>
        slot(labelKey(division, label), LABEL_NAMES[label], value),
      ),
      ...content.pilares.flatMap((item, index) => [
        slot(pilarKey(division, index, "titulo"), `${item.title} · Título`, item.title),
        slot(pilarKey(division, index, "texto"), `${item.title} · Texto`, item.description, true),
      ]),
      ...content.valores.flatMap((item, index) => [
        slot(valorKey(division, index, "titulo"), `Valor ${index + 1} · Título`, item.title),
        slot(valorKey(division, index, "texto"), `Valor ${index + 1} · Texto`, item.description, true),
      ]),
      ...content.metricas.flatMap((item, index) => [
        slot(cifraKey(division, index, "valor"), `Cifra ${index + 1} · Valor`, item.value),
        slot(cifraKey(division, index, "etiqueta"), `Cifra ${index + 1} · Etiqueta`, item.label),
      ]),
    ];
  });
}

// Resolved copy for a Nosotros page; `t` is the page's resolveText wrapper.
export function getNosotrosContent(division: NosotrosDivision, t: (key: string) => string) {
  const content = CONTENT[division];
  return {
    pilares: content.pilares.map((_, index) => ({
      title: t(pilarKey(division, index, "titulo")),
      description: t(pilarKey(division, index, "texto")),
    })),
    valores: content.valores.map((_, index) => ({
      title: t(valorKey(division, index, "titulo")),
      description: t(valorKey(division, index, "texto")),
    })),
    metricas: content.metricas.map((_, index) => ({
      value: t(cifraKey(division, index, "valor")),
      label: t(cifraKey(division, index, "etiqueta")),
    })),
    label: (label: LabelKey) => t(labelKey(division, label)),
  };
}
