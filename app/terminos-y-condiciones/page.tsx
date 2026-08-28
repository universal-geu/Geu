import type { Metadata } from "next";
import LegalPageLayout from "../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Términos y condiciones | GEU Grupo Empresarial Universal",
  description: "Términos y condiciones de uso y compra en los sitios web de GEU Grupo Empresarial Universal.",
};

export const dynamic = "force-dynamic";

export default async function TerminosYCondicionesPage() {
  return (
    <LegalPageLayout title="Términos y condiciones" updatedAt="10 de agosto de 2026">
      <h2>1. Quiénes somos</h2>
      <p>
        Estos términos y condiciones regulan el acceso y uso de los sitios web operados por{" "}
        <strong>Grupo Empresarial Universal</strong> (nombre comercial <strong>GEU</strong>), identificado
        con NIT <strong>830.085.540</strong>, con domicilio en Carrera 29 #10-25, Bogotá D.C., Colombia,
        incluyendo sus unidades de negocio Universal de Cauchos, GEU Import, GEU Structure, GEU Energy y
        GEU Plastic (en conjunto, &quot;GEU&quot;, &quot;nosotros&quot; o &quot;la empresa&quot;).
      </p>
      <p>
        Al navegar, registrarte, solicitar una cotización o realizar una compra en cualquiera de nuestros
        sitios, aceptas estos términos en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos
        no usar el sitio.
      </p>

      <h2>2. Registro de cuenta</h2>
      <p>
        Para comprar, solicitar cotizaciones o hacer seguimiento a pedidos es necesario crear una cuenta con
        información veraz, completa y actualizada (nombre, empresa, correo, teléfono y dirección). Eres
        responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu
        cuenta.
      </p>
      <p>
        GEU puede suspender o cancelar cuentas que incumplan estos términos, que suministren información
        falsa, o que se usen de forma fraudulenta.
      </p>

      <h2>3. Productos, precios y disponibilidad</h2>
      <p>
        Los precios publicados están en pesos colombianos (COP) e incluyen los impuestos aplicables, salvo
        que se indique lo contrario. Los precios, referencias, imágenes, especificaciones técnicas y
        disponibilidad de inventario pueden cambiar sin previo aviso y no constituyen una oferta vinculante
        hasta la confirmación del pedido.
      </p>
      <p>
        Hacemos lo posible por que la información de cada producto sea precisa; sin embargo, pueden
        presentarse errores tipográficos o de sistema. En caso de un error evidente en el precio o la
        descripción de un producto, GEU se reserva el derecho de corregirlo, cancelar el pedido afectado y
        reembolsar cualquier valor ya pagado.
      </p>

      <h2>4. Cotizaciones y pedidos especiales</h2>
      <p>
        Las solicitudes de evaluación técnica o &quot;piezas a la medida&quot; (por ejemplo, a través de
        &quot;Diseña tu pieza&quot;) no constituyen una compra ni generan cobro automático. Son una solicitud
        de estudio que nuestro equipo técnico revisa y responde con viabilidad, tiempos y condiciones
        comerciales antes de cualquier producción o cobro.
      </p>

      <h2>5. Pago, facturación y entrega</h2>
      <p>
        El pedido se entiende confirmado una vez se procesa el pago por los medios habilitados en el sitio o
        se acuerda por escrito una condición de pago distinta (por ejemplo, crédito empresarial). GEU emite
        la factura electrónica correspondiente conforme a la normativa de la DIAN.
      </p>
      <p>
        Los tiempos de entrega informados son estimados y pueden variar según la ciudad de destino, el
        transportador y la disponibilidad del producto. GEU no es responsable por retrasos atribuibles a
        terceros transportadores, fuerza mayor o caso fortuito.
      </p>

      <h2>6. Garantías, cambios y devoluciones</h2>
      <p>
        Los productos cuentan con la garantía indicada en su ficha (por defecto, 1 año de garantía del
        fabricante), cubriendo defectos de fabricación bajo condiciones normales de uso. La garantía no cubre
        desgaste normal, mal uso, instalación incorrecta o modificaciones realizadas por terceros.
      </p>
      <p>
        Conforme al Estatuto del Consumidor colombiano (Ley 1480 de 2011), el cliente puede solicitar la
        garantía o ejercer el derecho de retracto (cuando aplique) contactando a nuestro equipo de servicio
        al cliente dentro de los plazos legales, adjuntando la factura o comprobante de compra.
      </p>

      <h2>7. Propiedad intelectual</h2>
      <p>
        Los logotipos, marcas, textos, imágenes, catálogos y contenido de este sitio son propiedad de GEU o
        de sus licenciantes y están protegidos por las leyes de propiedad intelectual. Queda prohibida su
        reproducción, distribución o uso comercial sin autorización previa y escrita.
      </p>

      <h2>8. Responsabilidad</h2>
      <p>
        GEU no será responsable por daños indirectos, lucro cesante o perjuicios derivados del uso del sitio,
        salvo en los casos en que la ley aplicable no permita limitar dicha responsabilidad. El sitio se
        ofrece &quot;tal cual&quot; y &quot;según disponibilidad&quot;.
      </p>

      <h2>9. Modificaciones</h2>
      <p>
        GEU puede actualizar estos términos en cualquier momento. Los cambios rigen desde su publicación en
        esta página, indicando la fecha de última actualización. El uso continuado del sitio implica la
        aceptación de los términos vigentes.
      </p>

      <h2>10. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se someterá
        a los jueces competentes de Bogotá D.C., sin perjuicio de los mecanismos de protección al consumidor
        ante la Superintendencia de Industria y Comercio.
      </p>

      <h2>11. Contacto</h2>
      <p>
        Para preguntas sobre estos términos puedes escribirnos a{" "}
        <a href="mailto:atencionalcliente@universaldecauchos.com">atencionalcliente@universaldecauchos.com</a>{" "}
        o llamarnos al 320 88 999 33.
      </p>
    </LegalPageLayout>
  );
}
