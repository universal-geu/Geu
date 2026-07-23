import { categoriasData, importCategoriasData, plasticCategoriasData } from "@/app/data/catalog";

export function categoryLabelKey(division: string, nombre: string): string {
  return `category-label:${division}:${nombre}`;
}

export type SiteTexts = Record<string, string>;

export function resolveText(key: string, siteTexts: SiteTexts, fallback?: string): string {
  const stored = siteTexts[key]?.trim();
  if (stored) return stored;
  if (fallback !== undefined) return fallback;
  return TEXT_SLOTS.find((slot) => slot.key === key)?.defaultValue ?? "";
}

export type TextSlot = {
  key: string;
  label: string;
  group: string;
  division: "Cauchos" | "Import" | "Innovation" | "Plastic" | "Energy" | "Global";
  defaultValue: string;
  multiline?: boolean;
};

export const TEXT_SLOTS: TextSlot[] = [
  // ---- Global ----
  { key: "header-phone", label: "Teléfono servicio al cliente (header)", group: "Encabezado", division: "Global", defaultValue: "Servicio al cliente 320 88 999 33" },
  { key: "footer-social-facebook-url", label: "Facebook (URL, vacío = oculto)", group: "Redes sociales", division: "Global", defaultValue: "" },
  { key: "footer-social-instagram-url", label: "Instagram (URL, vacío = oculto)", group: "Redes sociales", division: "Global", defaultValue: "" },
  { key: "footer-social-linkedin-url", label: "LinkedIn (URL, vacío = oculto)", group: "Redes sociales", division: "Global", defaultValue: "" },
  { key: "footer-social-youtube-url", label: "YouTube (URL, vacío = oculto)", group: "Redes sociales", division: "Global", defaultValue: "" },
  { key: "footer-copyright-name", label: "Nombre en el copyright del footer", group: "Redes sociales", division: "Global", defaultValue: "GEU - Grupo Empresarial Universal" },

  // ---- Cauchos · Home ----
  { key: "cauchos-productos-eyebrow", label: "Productos · Antetítulo", group: "Página de inicio", division: "Cauchos", defaultValue: "Productos destacados" },
  { key: "cauchos-productos-titulo", label: "Productos · Título", group: "Página de inicio", division: "Cauchos", defaultValue: "Cauchos para compra empresarial" },
  { key: "cauchos-productos-subtitulo", label: "Productos · Subtítulo", group: "Página de inicio", division: "Cauchos", defaultValue: "Seleccion industrial para compras recurrentes, proyectos especiales y reposicion tecnica.", multiline: true },
  { key: "cauchos-ofertas-eyebrow", label: "Ofertas · Antetítulo", group: "Página de inicio", division: "Cauchos", defaultValue: "Ofertas especiales" },
  { key: "cauchos-ofertas-titulo", label: "Ofertas · Título", group: "Página de inicio", division: "Cauchos", defaultValue: "Soluciones listas para tu operacion" },
  { key: "oferta-cauchos-productos", label: "Oferta 1 · Texto", group: "Ofertas", division: "Cauchos", defaultValue: "Productos de caucho" },
  { key: "oferta-cauchos-industriales", label: "Oferta 2 · Texto", group: "Ofertas", division: "Cauchos", defaultValue: "Cauchos industriales" },
  { key: "oferta-mangueras-industriales", label: "Oferta 3 · Texto", group: "Ofertas", division: "Cauchos", defaultValue: "Mangueras industriales" },
  { key: "oferta-soportes-industriales", label: "Oferta 4 · Texto", group: "Ofertas", division: "Cauchos", defaultValue: "Soportes industriales" },
  { key: "marca-destacada-perfiles", label: "Marca destacada 1 · Texto", group: "Marcas destacadas", division: "Cauchos", defaultValue: "Perfiles de caucho" },
  { key: "marca-destacada-mangueras", label: "Marca destacada 2 · Texto", group: "Marcas destacadas", division: "Cauchos", defaultValue: "Mangueras industriales" },
  { key: "marca-destacada-laminas", label: "Marca destacada 3 · Texto", group: "Marcas destacadas", division: "Cauchos", defaultValue: "Laminas de caucho" },
  { key: "marca-destacada-soportes", label: "Marca destacada 4 · Texto", group: "Marcas destacadas", division: "Cauchos", defaultValue: "Soportes industriales" },
  { key: "cauchos-marcas-titulo", label: "Título de sección de marcas", group: "Página de inicio", division: "Cauchos", defaultValue: "Nuestras marcas destacadas" },
  { key: "cauchos-contacto-eyebrow", label: "Contacto · Antetítulo", group: "Página de inicio", division: "Cauchos", defaultValue: "Necesitas una solucion en caucho?" },
  { key: "cauchos-contacto-titulo", label: "Contacto · Título", group: "Página de inicio", division: "Cauchos", defaultValue: "Hablemos de tu proyecto" },
  { key: "cauchos-contacto-subtitulo", label: "Contacto · Subtítulo", group: "Página de inicio", division: "Cauchos", defaultValue: "Cuentanos que necesitas y nuestro asistente arma contigo la evaluacion tecnica para tu producto.", multiline: true },

  // ---- Cauchos · Footer ----
  { key: "footer-cauchos-tagline", label: "Footer · Frase de marca", group: "Footer", division: "Cauchos", defaultValue: "Construimos empresas que transforman industrias y generan valor para un futuro mejor.", multiline: true },
  { key: "footer-cauchos-col3-title", label: "Footer · Columna 3 (título)", group: "Footer", division: "Cauchos", defaultValue: "Cauchos" },
  { key: "footer-cauchos-col3-items", label: "Footer · Columna 3 (items, separados por coma)", group: "Footer", division: "Cauchos", defaultValue: "Soluciones, Productos, Industrias, Catalogos, Cotizacion" },
  { key: "footer-cauchos-col4-title", label: "Footer · Columna 4 (título)", group: "Footer", division: "Cauchos", defaultValue: "Certificaciones" },
  { key: "footer-cauchos-col4-items", label: "Footer · Columna 4 (items, separados por coma)", group: "Footer", division: "Cauchos", defaultValue: "ISO 9001, ISO 14001, ISO 45001" },

  // ---- Cauchos · Nosotros ----
  { key: "cauchos-nosotros-hero-titulo", label: "Nosotros · Título (usa salto de línea para 2 líneas)", group: "Nosotros", division: "Cauchos", defaultValue: "Impulsamos industrias.\nConstruimos el futuro.", multiline: true },
  { key: "cauchos-nosotros-hero-subtitulo", label: "Nosotros · Párrafo introductorio", group: "Nosotros", division: "Cauchos", defaultValue: "Somos una organización dedicada a consolidar, preservar y acrecentar la confianza de los clientes mediante soluciones integrales en caucho, importación, innovación, energía y plásticos, con procesos diseñados para generar valor sostenible.", multiline: true },
  { key: "cauchos-valores-titulo", label: "Nosotros · Título de valores", group: "Nosotros", division: "Cauchos", defaultValue: "Lo que guía cada decisión que tomamos." },
  { key: "cauchos-filosofia-texto", label: "Nosotros · Párrafo de filosofía", group: "Nosotros", division: "Cauchos", defaultValue: "Creemos que construir confianza industrial va más allá de vender productos; consiste en acompañar a nuestros clientes con soluciones técnicas, respaldo constante y compromiso con la calidad en cada operación.", multiline: true },
  { key: "cauchos-cifras-titulo", label: "Nosotros · Título de cifras", group: "Nosotros", division: "Cauchos", defaultValue: "Dos décadas construyendo confianza industrial." },
  { key: "cauchos-ecosistema-titulo", label: "Nosotros · Título de ecosistema", group: "Nosotros", division: "Cauchos", defaultValue: "Cinco unidades de negocio, una sola visión." },
  { key: "cauchos-promesa-titulo", label: "Nosotros · Título de cierre", group: "Nosotros", division: "Cauchos", defaultValue: "Un ecosistema que trabaja como uno solo." },
  { key: "cauchos-promesa-subtitulo", label: "Nosotros · Párrafo de cierre", group: "Nosotros", division: "Cauchos", defaultValue: "Integramos capacidades, tecnología y talento para ofrecer soluciones completas y generar valor en cada industria donde participamos.", multiline: true },

  // ---- Import · Home ----
  { key: "import-productos-eyebrow", label: "Productos · Antetítulo", group: "Página de inicio", division: "Import", defaultValue: "Productos destacados" },
  { key: "import-productos-titulo", label: "Productos · Título", group: "Página de inicio", division: "Import", defaultValue: "Importados para compra empresarial" },
  { key: "import-productos-subtitulo", label: "Productos · Subtítulo", group: "Página de inicio", division: "Import", defaultValue: "Seleccion de referencias para abastecimiento continuo, pedidos especiales y homologacion tecnica.", multiline: true },
  { key: "import-ofertas-eyebrow", label: "Ofertas · Antetítulo", group: "Página de inicio", division: "Import", defaultValue: "Ofertas Import" },
  { key: "import-ofertas-titulo", label: "Ofertas · Título", group: "Página de inicio", division: "Import", defaultValue: "Soluciones listas para importar" },
  { key: "import-oferta-1", label: "Oferta 1 · Texto", group: "Ofertas", division: "Import", defaultValue: "Repuestos importados" },
  { key: "import-oferta-2", label: "Oferta 2 · Texto", group: "Ofertas", division: "Import", defaultValue: "Abastecimiento global" },
  { key: "import-oferta-3", label: "Oferta 3 · Texto", group: "Ofertas", division: "Import", defaultValue: "Logistica internacional" },
  { key: "import-oferta-4", label: "Oferta 4 · Texto", group: "Ofertas", division: "Import", defaultValue: "Compras por pedido" },
  { key: "import-destacada-1", label: "Marca destacada 1 · Texto", group: "Marcas destacadas", division: "Import", defaultValue: "Importacion empresarial" },
  { key: "import-destacada-2", label: "Marca destacada 2 · Texto", group: "Marcas destacadas", division: "Import", defaultValue: "Proveedores verificados" },
  { key: "import-destacada-3", label: "Marca destacada 3 · Texto", group: "Marcas destacadas", division: "Import", defaultValue: "Logistica y aduana" },
  { key: "import-destacada-4", label: "Marca destacada 4 · Texto", group: "Marcas destacadas", division: "Import", defaultValue: "Abastecimiento recurrente" },
  { key: "import-marcas-titulo", label: "Título de sección de marcas", group: "Página de inicio", division: "Import", defaultValue: "Nuestras marcas destacadas" },
  { key: "import-contacto-eyebrow", label: "Contacto · Antetítulo", group: "Página de inicio", division: "Import", defaultValue: "Necesitas traer una referencia?" },
  { key: "import-contacto-titulo", label: "Contacto · Título", group: "Página de inicio", division: "Import", defaultValue: "Hablemos de tu importacion" },
  { key: "import-contacto-subtitulo", label: "Contacto · Subtítulo", group: "Página de inicio", division: "Import", defaultValue: "Te ayudamos a comprar, importar, nacionalizar y entregar las partes que tu operacion necesita.", multiline: true },

  // ---- Import · Footer ----
  { key: "footer-import-tagline", label: "Footer · Frase de marca", group: "Footer", division: "Import", defaultValue: "Conectamos mercados y generamos oportunidades para que tu negocio no tenga limites.", multiline: true },
  { key: "footer-import-col3-title", label: "Footer · Columna 3 (título)", group: "Footer", division: "Import", defaultValue: "Servicios" },
  { key: "footer-import-col3-items", label: "Footer · Columna 3 (items, separados por coma)", group: "Footer", division: "Import", defaultValue: "Importacion, Fletes, Aduana, Abastecimiento, Distribucion" },
  { key: "footer-import-col4-title", label: "Footer · Columna 4 (título)", group: "Footer", division: "Import", defaultValue: "Certificaciones" },
  { key: "footer-import-col4-items", label: "Footer · Columna 4 (items, separados por coma)", group: "Footer", division: "Import", defaultValue: "ISO 9001, BASC, OEA" },

  // ---- Import · Nosotros ----
  { key: "import-nosotros-hero-titulo", label: "Nosotros · Título", group: "Nosotros", division: "Import", defaultValue: "¿Quiénes somos?" },
  { key: "import-nosotros-hero-subtitulo", label: "Nosotros · Párrafo introductorio", group: "Nosotros", division: "Import", defaultValue: "GEU Group es un grupo empresarial que conecta la industria con soluciones de clase mundial mediante la importación, representación y desarrollo de productos y tecnologías que impulsan la productividad, la competitividad y el crecimiento de nuestros clientes.", multiline: true },
  { key: "import-valores-titulo", label: "Nosotros · Título de valores", group: "Nosotros", division: "Import", defaultValue: "Lo que guía cada decisión que tomamos." },
  { key: "import-filosofia-texto", label: "Nosotros · Párrafo de filosofía", group: "Nosotros", division: "Import", defaultValue: "Creemos que una importación exitosa va más allá de traer productos; consiste en conectar la industria con tecnologías, soluciones y fabricantes de clase mundial que impulsen la productividad, la competitividad y el crecimiento sostenible de nuestros clientes.", multiline: true },
  { key: "import-promesa-titulo", label: "Nosotros · Título de cierre", group: "Nosotros", division: "Import", defaultValue: "Conectamos la industria con soluciones de clase mundial." },

  // ---- Plastic · Home ----
  { key: "plastic-lineas-eyebrow", label: "Líneas · Antetítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Lineas Plastic" },
  { key: "plastic-lineas-titulo", label: "Líneas · Título", group: "Página de inicio", division: "Plastic", defaultValue: "Materiales y piezas para producir mejor." },
  { key: "plastic-lineas-subtitulo", label: "Líneas · Subtítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Un catalogo pensado para compras tecnicas, abastecimiento empresarial y desarrollos por aplicacion.", multiline: true },
  { key: "plastic-productos-eyebrow", label: "Productos · Antetítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Productos destacados" },
  { key: "plastic-productos-titulo", label: "Productos · Título", group: "Página de inicio", division: "Plastic", defaultValue: "Fichas de producto listas para cotizar." },
  { key: "plastic-productos-subtitulo", label: "Productos · Subtítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Seleccion tecnica para compras recurrentes, proyectos especiales y desarrollo por aplicacion.", multiline: true },
  { key: "plastic-ofertas-eyebrow", label: "Ofertas · Antetítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Ofertas Plastic" },
  { key: "plastic-ofertas-titulo", label: "Ofertas · Título", group: "Página de inicio", division: "Plastic", defaultValue: "Soluciones listas para producir" },
  { key: "plastic-oferta-1", label: "Oferta 1 · Texto", group: "Ofertas", division: "Plastic", defaultValue: "Extrusion PVC Rigido" },
  { key: "plastic-oferta-2", label: "Oferta 2 · Texto", group: "Ofertas", division: "Plastic", defaultValue: "Extrusion PVC Flexible" },
  { key: "plastic-oferta-3", label: "Oferta 3 · Texto", group: "Ofertas", division: "Plastic", defaultValue: "Perfileria para construccion" },
  { key: "plastic-oferta-4", label: "Oferta 4 · Texto", group: "Ofertas", division: "Plastic", defaultValue: "Perfileria para carroceria" },
  { key: "plastic-destacada-1", label: "Marca destacada 1 · Texto", group: "Marcas destacadas", division: "Plastic", defaultValue: "Perfiles" },
  { key: "plastic-destacada-2", label: "Marca destacada 2 · Texto", group: "Marcas destacadas", division: "Plastic", defaultValue: "Resinas" },
  { key: "plastic-destacada-3", label: "Marca destacada 3 · Texto", group: "Marcas destacadas", division: "Plastic", defaultValue: "Piezas tecnicas" },
  { key: "plastic-destacada-4", label: "Marca destacada 4 · Texto", group: "Marcas destacadas", division: "Plastic", defaultValue: "Extrusion" },
  { key: "plastic-marcas-titulo", label: "Título de sección de marcas", group: "Página de inicio", division: "Plastic", defaultValue: "Nuestras marcas destacadas" },
  { key: "plastic-contacto-eyebrow", label: "Contacto · Antetítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Tienes un proyecto plastico?" },
  { key: "plastic-contacto-titulo", label: "Contacto · Título", group: "Página de inicio", division: "Plastic", defaultValue: "Revisemos material, medidas y cantidades." },
  { key: "plastic-contacto-subtitulo", label: "Contacto · Subtítulo", group: "Página de inicio", division: "Plastic", defaultValue: "Envia tu requerimiento y te ayudamos a aterrizar la solucion tecnica y comercial.", multiline: true },

  // ---- Plastic · Footer ----
  { key: "footer-plastic-tagline", label: "Footer · Frase de marca", group: "Footer", division: "Plastic", defaultValue: "Soluciones plasticas tecnicas para empresas, manufactura, comercio y proyectos especiales.", multiline: true },
  { key: "footer-plastic-col3-title", label: "Footer · Columna 3 (título)", group: "Footer", division: "Plastic", defaultValue: "Servicios" },
  { key: "footer-plastic-col3-items", label: "Footer · Columna 3 (items, separados por coma)", group: "Footer", division: "Plastic", defaultValue: "Perfiles, Resinas, Piezas, Extrusion, Mecanizado" },
  { key: "footer-plastic-col4-title", label: "Footer · Columna 4 (título)", group: "Footer", division: "Plastic", defaultValue: "Materiales" },
  { key: "footer-plastic-col4-items", label: "Footer · Columna 4 (items, separados por coma)", group: "Footer", division: "Plastic", defaultValue: "PVC, Policarbonato, Acrilico, Polietileno" },

  // ---- Plastic · Nosotros ----
  { key: "plastic-nosotros-hero-titulo", label: "Nosotros · Título", group: "Nosotros", division: "Plastic", defaultValue: "¿Quiénes somos?" },
  { key: "plastic-nosotros-hero-subtitulo", label: "Nosotros · Párrafo introductorio", group: "Nosotros", division: "Plastic", defaultValue: "GEU Group es un grupo empresarial que conecta la industria con soluciones de clase mundial mediante la importación, representación y desarrollo de productos y tecnologías que impulsan la productividad, la competitividad y el crecimiento de nuestros clientes.", multiline: true },
  { key: "plastic-valores-titulo", label: "Nosotros · Título de valores", group: "Nosotros", division: "Plastic", defaultValue: "Lo que guía cada decisión que tomamos." },
  { key: "plastic-filosofia-texto", label: "Nosotros · Párrafo de filosofía", group: "Nosotros", division: "Plastic", defaultValue: "Creemos que transformar el plástico va más allá de fabricar piezas; consiste en acompañar a nuestros clientes con soluciones técnicas a medida, materiales confiables y desarrollo constante para cada aplicación industrial.", multiline: true },
  { key: "plastic-promesa-titulo", label: "Nosotros · Título de cierre", group: "Nosotros", division: "Plastic", defaultValue: "Conectamos la industria con soluciones de clase mundial." },

  // ---- Energy · Home ----
  { key: "energy-hero-eyebrow", label: "Héroe · Antetítulo", group: "Energy", division: "Energy", defaultValue: "GEU Energy" },
  { key: "energy-hero-titulo", label: "Héroe · Título", group: "Energy", division: "Energy", defaultValue: "Creamos la energía del mañana" },
  { key: "energy-hero-subtitulo", label: "Héroe · Subtítulo", group: "Energy", division: "Energy", defaultValue: "Soluciones energéticas inteligentes para un futuro sostenible.", multiline: true },
  { key: "energy-soluciones-titulo", label: "Soluciones · Título", group: "Energy", division: "Energy", defaultValue: "Diseñamos soluciones a la medida de tus necesidades." },
  { key: "energy-sistema-eyebrow", label: "Sistema · Antetítulo", group: "Energy", division: "Energy", defaultValue: "Diseña tu sistema" },
  { key: "energy-sistema-titulo", label: "Sistema · Título", group: "Energy", division: "Energy", defaultValue: "Soluciones a la medida de tu proyecto." },
  { key: "energy-sistema-subtitulo", label: "Sistema · Subtítulo", group: "Energy", division: "Energy", defaultValue: "Simula, cotiza y diseña un sistema energético eficiente con la ayuda de nuestra tecnología y de Gus.", multiline: true },
  { key: "footer-energy-tagline", label: "Footer · Frase de marca", group: "Footer", division: "Energy", defaultValue: "Soluciones energéticas inteligentes para un futuro sostenible.", multiline: true },

  // ---- Innovation · Home ----
  { key: "innovation-hero-titulo", label: "Héroe · Título", group: "Innovation", division: "Innovation", defaultValue: "Autoservicio inteligente" },
  { key: "innovation-soluciones-titulo", label: "Soluciones · Título", group: "Innovation", division: "Innovation", defaultValue: "Diseñamos puntos inteligentes a la medida de tu espacio." },
  { key: "innovation-sistema-eyebrow", label: "Sistema · Antetítulo", group: "Innovation", division: "Innovation", defaultValue: "Activa tu punto GEU" },
  { key: "innovation-sistema-titulo", label: "Sistema · Título", group: "Innovation", division: "Innovation", defaultValue: "Un sistema que se adapta a tu operación." },
  { key: "innovation-sistema-subtitulo", label: "Sistema · Subtítulo", group: "Innovation", division: "Innovation", defaultValue: "Simula, cotiza y activa un punto de autoservicio inteligente con la ayuda de nuestro equipo GEU Innovation.", multiline: true },
  { key: "innovation-proyectos-titulo", label: "Proyectos · Título", group: "Innovation", division: "Innovation", defaultValue: "Nuestros proyectos en el país" },
  { key: "innovation-proyectos-subtitulo", label: "Proyectos · Subtítulo", group: "Innovation", division: "Innovation", defaultValue: "Llevamos soluciones GEU Innovation a comunidades de todo el territorio nacional.", multiline: true },
  { key: "innovation-proyecto-estufas-eyebrow", label: "Proyecto estufas · Antetítulo", group: "Innovation", division: "Innovation", defaultValue: "Proyecto GEU" },
  { key: "innovation-proyecto-estufas-titulo", label: "Proyecto estufas · Título", group: "Innovation", division: "Innovation", defaultValue: "Estufas ecoeficientes para hogares rurales" },
  { key: "innovation-proyecto-estufas-subtitulo", label: "Proyecto estufas · Subtítulo", group: "Innovation", division: "Innovation", defaultValue: "Diseñamos, entregamos e instalamos estufas ecoeficientes en comunidades rurales, acompañando a cada familia con capacitación y seguimiento en sitio.", multiline: true },
  { key: "innovation-fabricacion-eyebrow", label: "Fabricación · Antetítulo", group: "Innovation", division: "Innovation", defaultValue: "Fabricación GEU" },
  { key: "innovation-fabricacion-titulo", label: "Fabricación · Título", group: "Innovation", division: "Innovation", defaultValue: "Así fabricamos nuestras estufas" },
  { key: "innovation-fabricacion-subtitulo", label: "Fabricación · Subtítulo", group: "Innovation", division: "Innovation", defaultValue: "Cada estufa se corta, suelda, arma y pinta a mano en nuestro taller antes de salir hacia una familia.", multiline: true },
  { key: "footer-innovation-tagline", label: "Footer · Frase de marca", group: "Footer", division: "Innovation", defaultValue: "Autoservicio inteligente para empresas en todo el país.", multiline: true },

  // ---- Quienes somos (corporativo) ----
  { key: "quienes-somos-hero-titulo", label: "Título (usa salto de línea para 2 líneas)", group: "Quiénes somos", division: "Global", defaultValue: "Impulsamos industrias.\nConstruimos el futuro.", multiline: true },
  { key: "quienes-somos-hero-subtitulo", label: "Párrafo introductorio", group: "Quiénes somos", division: "Global", defaultValue: "Somos una organización dedicada a consolidar, preservar y acrecentar la confianza de los clientes mediante soluciones integrales en caucho, importación, innovación, energía y plásticos, con procesos diseñados para generar valor sostenible.", multiline: true },
  { key: "quienes-somos-mision-texto", label: "Párrafo de misión", group: "Quiénes somos", division: "Global", defaultValue: "Consolidar empresas industriales que creen soluciones confiables y eleven el estándar técnico del mercado colombiano.", multiline: true },
  { key: "quienes-somos-vision-texto", label: "Párrafo de visión", group: "Quiénes somos", division: "Global", defaultValue: "Para el año 2035, ser uno de los grupos empresariales líderes en Latinoamérica en soluciones industriales y tecnológicas, reconocido por su innovación, excelencia y generación de valor para clientes, aliados y colaboradores.", multiline: true },
  { key: "quienes-somos-ecosistema-titulo", label: "Título de ecosistema", group: "Quiénes somos", division: "Global", defaultValue: "Nuestro ecosistema" },
  { key: "quienes-somos-contacto-titulo", label: "Título de cierre", group: "Quiénes somos", division: "Global", defaultValue: "Un ecosistema que trabaja como uno solo." },
  { key: "quienes-somos-contacto-subtitulo", label: "Párrafo de cierre", group: "Quiénes somos", division: "Global", defaultValue: "Integramos capacidades, tecnología y talento para ofrecer soluciones completas y generar valor en cada industria donde participamos.", multiline: true },
  { key: "footer-quienes-somos-tagline", label: "Footer · Frase de marca", group: "Quiénes somos", division: "Global", defaultValue: "Impulsamos industrias a través de soluciones integrales, innovación y compromiso con la excelencia.", multiline: true },

  // ---- Nombres de categorías del menú (no cambian la URL ni el filtro de productos) ----
  ...categoriasData.map((category) => ({
    key: categoryLabelKey("Cauchos", category.nombre),
    label: `Categoría · ${category.nombre}`,
    group: "Nombres de categorías",
    division: "Cauchos" as const,
    defaultValue: category.nombre,
  })),
  ...importCategoriasData.map((category) => ({
    key: categoryLabelKey("Import", category.nombre),
    label: `Categoría · ${category.nombre}`,
    group: "Nombres de categorías",
    division: "Import" as const,
    defaultValue: category.nombre,
  })),
  ...plasticCategoriasData.map((category) => ({
    key: categoryLabelKey("Plastic", category.nombre),
    label: `Categoría · ${category.nombre}`,
    group: "Nombres de categorías",
    division: "Plastic" as const,
    defaultValue: category.nombre,
  })),
];
