import type { Metadata } from "next";
import Link from "next/link";
import LegalPageLayout from "../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Política de privacidad | GEU Grupo Empresarial Universal",
  description: "Cómo GEU Grupo Empresarial Universal recolecta, usa y protege la información en sus sitios web.",
};

export const dynamic = "force-dynamic";

export default async function PoliticaDePrivacidadPage() {
  return (
    <LegalPageLayout title="Política de privacidad" updatedAt="10 de agosto de 2026">
      <p>
        Esta política explica de forma general qué información recolectamos a través de los sitios web de{" "}
        <strong>Grupo Empresarial Universal</strong> (GEU), NIT 830.085.540, y cómo la usamos. Para el detalle
        sobre tus derechos como titular de datos personales y cómo ejercerlos, consulta nuestra{" "}
        <Link href="/tratamiento-de-datos-personales">Política de tratamiento de datos personales</Link>.
      </p>

      <h2>1. Información que recolectamos</h2>
      <ul>
        <li>
          <strong>Datos de cuenta:</strong> nombre, empresa, correo electrónico, teléfono, ciudad y dirección
          que registras al crear tu cuenta o completar tu perfil.
        </li>
        <li>
          <strong>Datos de pedidos y cotizaciones:</strong> productos consultados, comprados o solicitados,
          historial de pedidos y el detalle de las solicitudes de evaluación técnica que envías.
        </li>
        <li>
          <strong>Datos técnicos:</strong> dirección IP, tipo de navegador y páginas visitadas, recolectados
          automáticamente para el funcionamiento y seguridad del sitio.
        </li>
      </ul>

      <h2>2. Para qué usamos tu información</h2>
      <ul>
        <li>Procesar pedidos, cotizaciones y solicitudes de evaluación técnica.</li>
        <li>Gestionar tu cuenta, historial de compras y comunicarnos contigo sobre su estado.</li>
        <li>Emitir facturas y cumplir obligaciones contables, tributarias y legales.</li>
        <li>Mejorar nuestros productos, catálogo y experiencia de navegación.</li>
        <li>Prevenir fraude y proteger la seguridad de la plataforma.</li>
      </ul>

      <h2>3. Con quién compartimos información</h2>
      <p>
        No vendemos tu información personal. La compartimos únicamente con proveedores que nos ayudan a
        operar el sitio bajo acuerdos de confidencialidad — por ejemplo, servicios de alojamiento de
        imágenes y archivos, pasarelas de pago y transportadoras — y solo en la medida necesaria para prestar
        el servicio, o cuando la ley nos obligue a entregarla a una autoridad competente.
      </p>

      <h2>4. Almacenamiento y seguridad</h2>
      <p>
        La información se almacena en infraestructura con controles de acceso y cifrado en tránsito.
        Algunos de nuestros proveedores de infraestructura operan servidores fuera de Colombia; en esos casos
        aplicamos las garantías exigidas por la normativa de protección de datos para transferencias
        internacionales.
      </p>

      <h2>5. Cookies</h2>
      <p>
        Usamos cookies y tecnologías similares para mantener tu sesión iniciada, recordar tu carrito de
        compras y entender cómo se usa el sitio. Puedes desactivar las cookies desde la configuración de tu
        navegador, aunque algunas funciones (como iniciar sesión) podrían dejar de funcionar correctamente.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Como titular de tus datos personales puedes solicitar acceso, actualización, rectificación,
        supresión o revocación de tu autorización en cualquier momento. El procedimiento completo está
        descrito en la{" "}
        <Link href="/tratamiento-de-datos-personales">Política de tratamiento de datos personales</Link>.
      </p>

      <h2>7. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política para reflejar cambios operativos, legales o técnicos. La fecha de
        última actualización se muestra al inicio de esta página.
      </p>

      <h2>8. Contacto</h2>
      <p>
        Para preguntas sobre esta política escríbenos a{" "}
        <a href="mailto:atencionalcliente@universaldecauchos.com">atencionalcliente@universaldecauchos.com</a>{" "}
        o llama al 320 88 999 33.
      </p>
    </LegalPageLayout>
  );
}
