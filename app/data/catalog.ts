import type { DivisionName } from "@/lib/divisions";

export const categoriasData = [
  {
    nombre: "Alimentos, Farmacéuticos y cosméticos",
    color: "#2f9e44",
    icono: "✚",
  },
  {
    nombre: "Agroindustria",
    color: "#5c940d",
    icono: "☘",
  },
  {
    nombre: "Petróleo, minería, gas, energías renovables y petroquímica",
    color: "#e8590c",
    icono: "◈",
  },
  {
    nombre: "Químico, aseo y plásticos",
    color: "#1971c2",
    icono: "◆",
  },
  {
    nombre: "Construcción, infraestructura, obra civil, cemento y agregados",
    color: "#868e96",
    icono: "▲",
  },
  {
    nombre: "Transporte, logística y puertos marítimos",
    color: "#0c8599",
    icono: "▶",
  },
  {
    nombre: "Manufactura, metalmecánica, siderúrgica y textiles",
    color: "#495057",
    icono: "⬢",
  },
  {
    nombre: "Ferretería y otros",
    color: "#c92a2a",
    icono: "✦",
  },
] as const;

export type Categoria = string;
export const categorias: string[] = categoriasData.map((item) => item.nombre);

// Placeholder subcategory groups for the Cauchos category menu, shown until
// real products are assigned to each of the 8 industry categories from the
// admin panel. Matches the "column of grouped links" layout used by
// homecenter.com.co's category flyout.
export const cauchosCategorySubcategories: Record<string, { name: string; items: string[] }[]> = {
  "Alimentos, Farmacéuticos y cosméticos": [
    {
      name: "Sellos y Empaques Sanitarios",
      items: ["Empaques para envases", "Sellos herméticos", "Juntas sanitarias", "O-rings grado alimenticio"],
    },
    {
      name: "Mangueras Sanitarias",
      items: ["Mangueras para líquidos alimenticios", "Mangueras para vapor", "Mangueras de silicona"],
    },
    {
      name: "Componentes para Envasado",
      items: ["Tapas y válvulas", "Membranas dosificadoras", "Diafragmas"],
    },
    {
      name: "Accesorios de Higiene Industrial",
      items: ["Guantes técnicos", "Cintas antideslizantes", "Bandas transportadoras"],
    },
  ],
  Agroindustria: [
    {
      name: "Mangueras Agrícolas",
      items: ["Mangueras de riego", "Mangueras para fumigación", "Mangueras de succión"],
    },
    {
      name: "Sellos para Maquinaria Agrícola",
      items: ["Empaques para tractores", "Retenes", "Juntas de motor"],
    },
    {
      name: "Bandas y Correas",
      items: ["Correas trapezoidales", "Bandas transportadoras", "Correas dentadas"],
    },
    {
      name: "Piezas de Desgaste",
      items: ["Rodillos de caucho", "Ruedas y llantas sólidas", "Topes y amortiguadores"],
    },
  ],
  "Petróleo, minería, gas, energías renovables y petroquímica": [
    {
      name: "Mangueras Industriales",
      items: ["Mangueras para petróleo", "Mangueras para gas", "Mangueras hidráulicas de alta presión"],
    },
    {
      name: "Sellos y Empaques Técnicos",
      items: ["Empaques para válvulas", "O-rings resistentes a químicos", "Juntas para bridas"],
    },
    {
      name: "Componentes para Perforación",
      items: ["Revestimientos de caucho", "Protectores de tubería", "Empaques de pozo"],
    },
    {
      name: "Energías Renovables",
      items: ["Sellos para paneles solares", "Juntas para turbinas eólicas", "Amortiguadores técnicos"],
    },
  ],
  "Químico, aseo y plásticos": [
    {
      name: "Mangueras Químicas",
      items: ["Mangueras resistentes a ácidos", "Mangueras para solventes", "Mangueras de descarga química"],
    },
    {
      name: "Sellos Anticorrosivos",
      items: ["Empaques químicos", "O-rings de vitón", "Juntas resistentes a solventes"],
    },
    {
      name: "Componentes para Plásticos",
      items: ["Rodillos para extrusión", "Bandas para líneas de producción", "Piezas técnicas moldeadas"],
    },
    {
      name: "Productos de Aseo Industrial",
      items: ["Escobillas técnicas", "Mangueras de limpieza", "Guantes resistentes a químicos"],
    },
  ],
  "Construcción, infraestructura, obra civil, cemento y agregados": [
    {
      name: "Sellos para Construcción",
      items: ["Juntas de dilatación", "Empaques para tuberías", "Sellos impermeabilizantes"],
    },
    {
      name: "Mangueras para Obra Civil",
      items: ["Mangueras para concreto", "Mangueras de succión", "Mangueras para bombeo"],
    },
    {
      name: "Amortiguación y Soportes",
      items: ["Apoyos de neopreno", "Placas antivibratorias", "Topes de caucho"],
    },
    {
      name: "Piezas para Maquinaria Pesada",
      items: ["Orugas de caucho", "Rodillos para maquinaria", "Fajas transportadoras"],
    },
  ],
  "Transporte, logística y puertos marítimos": [
    {
      name: "Defensas y Amortiguación Portuaria",
      items: ["Defensas para muelles", "Parachoques industriales", "Topes de atraque"],
    },
    {
      name: "Mangueras para Transporte",
      items: ["Mangueras para combustibles", "Mangueras de carga y descarga", "Mangueras flexibles"],
    },
    {
      name: "Sellos para Vehículos de Carga",
      items: ["Empaques para contenedores", "Juntas para remolques", "Burletes"],
    },
    {
      name: "Bandas Transportadoras",
      items: ["Bandas para carga", "Bandas modulares", "Rodillos de transporte"],
    },
  ],
  "Manufactura, metalmecánica, siderúrgica y textiles": [
    {
      name: "Bandas y Correas Industriales",
      items: ["Correas de transmisión", "Bandas transportadoras", "Correas dentadas"],
    },
    {
      name: "Sellos Técnicos para Maquinaria",
      items: ["Retenes", "O-rings", "Empaques para prensas"],
    },
    {
      name: "Piezas de Caucho a Medida",
      items: ["Piezas moldeadas", "Recubrimientos de rodillos", "Amortiguadores industriales"],
    },
    {
      name: "Textiles Técnicos",
      items: ["Telas recubiertas de caucho", "Bandas textiles", "Lonas industriales"],
    },
  ],
  "Ferretería y otros": [
    {
      name: "Sellos y Empaques Generales",
      items: ["O-rings estándar", "Empaques planos", "Juntas universales"],
    },
    {
      name: "Mangueras de Uso General",
      items: ["Mangueras de jardín", "Mangueras de aire", "Mangueras multiuso"],
    },
    {
      name: "Accesorios de Caucho",
      items: ["Topes de puerta", "Bases antideslizantes", "Protectores de esquina"],
    },
    {
      name: "Herramientas y Repuestos",
      items: ["Guantes de trabajo", "Bandas elásticas", "Repuestos varios"],
    },
  ],
};
export const disponibilidades = [
  "Entrega inmediata",
  "Disponible por pedido",
  "Recoger en tienda",
  "Agotado",
] as const;
export type Disponibilidad = (typeof disponibilidades)[number];

export type ProductoCatalogo = {
  slug: string;
  sku?: string;
  oemReferencia?: string;
  referenciasAlternas?: string[];
  categoria: Categoria;
  nombre: string;
  marca: string;
  division?: DivisionName;
  precio: string;
  precioAnterior: string;
  precioValor: number;
  displayPriceOverride?: string;
  displaySecondaryLabel?: string;
  stock?: number;
  stockMinimo?: number;
  estadoInventario?: "in-stock" | "low-stock" | "out-of-stock";
  puedeComprar?: boolean;
  descuento: string;
  imagen: string;
  imagenesExtra?: string[];
  disponibilidad: Disponibilidad;
  subcategoria?: string;
  categoriaMenor?: string;
  descripcion?: string;
  aplicacion?: string;
  compatibilidad?: string[];
  garantia?: string;
  destacado?: boolean;
};

export const productosCatalogo: ProductoCatalogo[] = [
  {
    slug: "farola-led-pulse-s1",
    categoria: "Luces y direccionales",
    nombre: "Farola LED Pulse S1",
    marca: "Unipars",
    precio: "$189.900",
    precioAnterior: "$239.900",
    precioValor: 189900,
    descuento: "-21%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "kit-direccional-orbit-pro",
    categoria: "Luces y direccionales",
    nombre: "Kit direccional Orbit Pro",
    marca: "Original Parts",
    precio: "$154.500",
    precioAnterior: "$198.000",
    precioValor: 154500,
    descuento: "-18%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "luz-auxiliar-nexo-beam",
    categoria: "Luces y direccionales",
    nombre: "Luz auxiliar Nexo Beam",
    marca: "ProLine",
    precio: "$267.900",
    precioAnterior: "$329.900",
    precioValor: 267900,
    descuento: "-19%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "modulo-trasero-vector-light",
    categoria: "Luces y direccionales",
    nombre: "Módulo trasero Vector Light",
    marca: "MotorTech",
    precio: "$221.000",
    precioAnterior: "$279.000",
    precioValor: 221000,
    descuento: "-20%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Recoger en tienda",
  },
  {
    slug: "juego-exploradoras-nova-led",
    categoria: "Luces y direccionales",
    nombre: "Juego exploradoras Nova LED",
    marca: "Unipars",
    precio: "$312.400",
    precioAnterior: "$389.000",
    precioValor: 312400,
    descuento: "-20%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "motor-ventilador-axis-compact",
    categoria: "Motores y ventiladores",
    nombre: "Motor ventilador Axis Compact",
    marca: "MotorTech",
    precio: "$338.500",
    precioAnterior: "$410.000",
    precioValor: 338500,
    descuento: "-17%",
    imagen: "/motor-ventilador-axis-compact.png",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "ventilador-tecnico-flux-one",
    categoria: "Motores y ventiladores",
    nombre: "Ventilador técnico Flux One",
    marca: "Unipars",
    precio: "$286.000",
    precioAnterior: "$349.000",
    precioValor: 286000,
    descuento: "-18%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "rotor-de-enfriamiento-magna-air",
    categoria: "Motores y ventiladores",
    nombre: "Rotor de enfriamiento Magna Air",
    marca: "Original Parts",
    precio: "$452.900",
    precioAnterior: "$525.000",
    precioValor: 452900,
    descuento: "-14%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "motor-axial-dynamic-core",
    categoria: "Motores y ventiladores",
    nombre: "Motor axial Dynamic Core",
    marca: "ProLine",
    precio: "$518.000",
    precioAnterior: "$620.000",
    precioValor: 518000,
    descuento: "-16%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "sistema-cooler-turbo-grid",
    categoria: "Motores y ventiladores",
    nombre: "Sistema cooler Turbo Grid",
    marca: "Unipars",
    precio: "$197.900",
    precioAnterior: "$249.000",
    precioValor: 197900,
    descuento: "-21%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Recoger en tienda",
  },
  {
    slug: "juego-de-bujes-exact-mill",
    categoria: "Línea mecanizado",
    nombre: "Juego de bujes Exact Mill",
    marca: "ProLine",
    precio: "$175.500",
    precioAnterior: "$219.000",
    precioValor: 175500,
    descuento: "-19%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "pieza-torneada-vector-cut",
    categoria: "Línea mecanizado",
    nombre: "Pieza torneada Vector Cut",
    marca: "Unipars",
    precio: "$248.000",
    precioAnterior: "$304.000",
    precioValor: 248000,
    descuento: "-18%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "modulo-de-ajuste-torque-base",
    categoria: "Línea mecanizado",
    nombre: "Módulo de ajuste Torque Base",
    marca: "MotorTech",
    precio: "$329.000",
    precioAnterior: "$405.000",
    precioValor: 329000,
    descuento: "-19%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "set-precision-prime-axis",
    categoria: "Línea mecanizado",
    nombre: "Set precisión Prime Axis",
    marca: "Original Parts",
    precio: "$589.000",
    precioAnterior: "$699.000",
    precioValor: 589000,
    descuento: "-16%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "acople-tecnico-linear-fit",
    categoria: "Línea mecanizado",
    nombre: "Acople técnico Linear Fit",
    marca: "Unipars",
    precio: "$214.700",
    precioAnterior: "$268.000",
    precioValor: 214700,
    descuento: "-19%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Recoger en tienda",
  },
  {
    slug: "boquilla-injet-flow-x",
    categoria: "Línea inyección y extrusión",
    nombre: "Boquilla Injet Flow X",
    marca: "Original Parts",
    precio: "$394.500",
    precioAnterior: "$479.000",
    precioValor: 394500,
    descuento: "-18%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "modulo-extrusor-delta-pack",
    categoria: "Línea inyección y extrusión",
    nombre: "Módulo extrusor Delta Pack",
    marca: "Unipars",
    precio: "$459.000",
    precioAnterior: "$569.000",
    precioValor: 459000,
    descuento: "-19%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "camara-de-inyeccion-smart-melt",
    categoria: "Línea inyección y extrusión",
    nombre: "Cámara de inyección Smart Melt",
    marca: "ProLine",
    precio: "$619.000",
    precioAnterior: "$749.000",
    precioValor: 619000,
    descuento: "-17%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "set-termico-fusion-gate",
    categoria: "Línea inyección y extrusión",
    nombre: "Set térmico Fusion Gate",
    marca: "MotorTech",
    precio: "$281.900",
    precioAnterior: "$349.000",
    precioValor: 281900,
    descuento: "-19%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "unidad-compacta-stream-mold",
    categoria: "Línea inyección y extrusión",
    nombre: "Unidad compacta Stream Mold",
    marca: "Unipars",
    precio: "$198.000",
    precioAnterior: "$248.000",
    precioValor: 198000,
    descuento: "-20%",
    imagen: "/hero-unipars.jpg",
    disponibilidad: "Recoger en tienda",
  },
  {
    slug: "sello-mecanico-industrial-nbr",
    categoria: "Sellos y empaques",
    subcategoria: "Sellos y empaques",
    categoriaMenor: "Sellos mecánicos",
    nombre: "Sello mecánico industrial NBR",
    marca: "SelloPro",
    precio: "$89.900",
    precioAnterior: "$112.000",
    precioValor: 89900,
    descuento: "-20%",
    imagen: "/cauchos-product-sellos.png",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "empaque-brida-vulcanizado",
    categoria: "Sellos y empaques",
    subcategoria: "Sellos y empaques",
    categoriaMenor: "Empaques",
    nombre: "Empaque de brida vulcanizado",
    marca: "Universal de Cauchos",
    precio: "$64.500",
    precioAnterior: "$79.000",
    precioValor: 64500,
    descuento: "-18%",
    imagen: "/cauchos-product-sellos.png",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "lamina-caucho-nitrilo-5mm",
    categoria: "Laminas y rollos",
    subcategoria: "Laminas y rollos",
    categoriaMenor: "Láminas técnicas",
    nombre: "Lámina de caucho nitrilo 5mm",
    marca: "TecnoCaucho",
    precio: "$148.000",
    precioAnterior: "$182.000",
    precioValor: 148000,
    descuento: "-19%",
    imagen: "/featured-laminas-caucho.png",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "rollo-caucho-natural-industrial",
    categoria: "Laminas y rollos",
    subcategoria: "Laminas y rollos",
    categoriaMenor: "Rollos industriales",
    nombre: "Rollo de caucho natural industrial",
    marca: "Universal de Cauchos",
    precio: "$312.000",
    precioAnterior: "$379.000",
    precioValor: 312000,
    descuento: "-18%",
    imagen: "/featured-laminas-caucho.png",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "manguera-hidraulica-alta-presion",
    categoria: "Mangueras",
    subcategoria: "Mangueras",
    categoriaMenor: "Mangueras hidráulicas",
    nombre: "Manguera hidráulica alta presión",
    marca: "Manguflex",
    precio: "$198.900",
    precioAnterior: "$249.000",
    precioValor: 198900,
    descuento: "-20%",
    imagen: "/featured-mangueras-industriales.png",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "manguera-neumatica-trenzada",
    categoria: "Mangueras",
    subcategoria: "Mangueras",
    categoriaMenor: "Mangueras neumáticas",
    nombre: "Manguera neumática trenzada",
    marca: "Universal de Cauchos",
    precio: "$121.500",
    precioAnterior: "$149.000",
    precioValor: 121500,
    descuento: "-18%",
    imagen: "/featured-mangueras-industriales.png",
    disponibilidad: "Entrega inmediata",
  },
  {
    slug: "soporte-antivibratorio-motor",
    categoria: "Piezas tecnicas",
    subcategoria: "Piezas tecnicas",
    categoriaMenor: "Soportes técnicos",
    nombre: "Soporte antivibratorio para motor",
    marca: "TecnoCaucho",
    precio: "$96.000",
    precioAnterior: "$118.000",
    precioValor: 96000,
    descuento: "-19%",
    imagen: "/featured-perfiles-caucho.png",
    disponibilidad: "Recoger en tienda",
  },
  {
    slug: "rodillo-caucho-industrial",
    categoria: "Piezas tecnicas",
    subcategoria: "Piezas tecnicas",
    categoriaMenor: "Rodillos técnicos",
    nombre: "Rodillo de caucho industrial",
    marca: "Universal de Cauchos",
    precio: "$276.000",
    precioAnterior: "$339.000",
    precioValor: 276000,
    descuento: "-19%",
    imagen: "/featured-perfiles-caucho.png",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "pieza-caucho-a-medida-troquelada",
    categoria: "Fabricacion especial",
    subcategoria: "Fabricacion especial",
    categoriaMenor: "Piezas a medida",
    nombre: "Pieza de caucho troquelada a medida",
    marca: "Universal de Cauchos",
    precio: "$210.000",
    precioAnterior: "$258.000",
    precioValor: 210000,
    descuento: "-19%",
    imagen: "/offer-productos-caucho.png",
    disponibilidad: "Disponible por pedido",
  },
  {
    slug: "prototipo-caucho-moldeado",
    categoria: "Fabricacion especial",
    subcategoria: "Fabricacion especial",
    categoriaMenor: "Desarrollo a medida",
    nombre: "Prototipo de caucho moldeado",
    marca: "TecnoCaucho",
    precio: "$389.000",
    precioAnterior: "$465.000",
    precioValor: 389000,
    descuento: "-16%",
    imagen: "/offer-productos-caucho.png",
    disponibilidad: "Disponible por pedido",
  },
];

export const slugCategoria = (categoria: string) =>
  categoria
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const categoriaDesdeSlug = (slug: string | null) =>
  categorias.find((categoria) => slugCategoria(categoria) === slug) ?? null;

export const categoriaMeta = (categoria: string) =>
  categoriasData.find((item) => item.nombre === categoria) ?? categoriasData[0];

export const productoPorSlug = (slug: string) =>
  productosCatalogo.find((producto) => producto.slug === slug) ?? null;

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatearMoneda(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatearDescuento(
  precioActual: number,
  precioAnterior: number,
) {
  const precioBase = Math.max(precioActual, precioAnterior, 1);
  const descuento = Math.max(
    0,
    Math.round(((precioBase - precioActual) / precioBase) * 100),
  );

  return `-${descuento}%`;
}

export function descripcionProducto({
  nombre,
  categoria,
  marca,
}: {
  nombre: string;
  categoria: string;
  marca: string;
}) {
  return `${nombre} de la línea ${categoria}, marca ${marca}, pensado para reposición confiable y operación continua.`;
}
