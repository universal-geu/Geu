import type { Metadata } from "next";
import LegalPageLayout from "../components/legal-page-layout";

export const metadata: Metadata = {
  title: "Tratamiento de datos personales | GEU Grupo Empresarial Universal",
  description:
    "Política de tratamiento de datos personales de GEU Grupo Empresarial Universal, conforme a la Ley 1581 de 2012.",
};

export const dynamic = "force-dynamic";

export default async function TratamientoDeDatosPersonalesPage() {
  return (
    <LegalPageLayout title="Tratamiento de datos personales" updatedAt="10 de agosto de 2026">
      <p>
        En cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas que las modifiquen o
        reglamenten, <strong>Grupo Empresarial Universal</strong> (GEU) informa su política para el
        tratamiento de datos personales de clientes, usuarios registrados y visitantes de sus sitios web.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        <strong>Razón social:</strong> Grupo Empresarial Universal
        <br />
        <strong>Nombre comercial:</strong> GEU (Universal de Cauchos, GEU Import, GEU Structure, GEU Energy,
        GEU Plastic)
        <br />
        <strong>NIT:</strong> 830.085.540
        <br />
        <strong>Domicilio:</strong> Carrera 29 #10-25, Bogotá D.C., Colombia
        <br />
        <strong>Correo:</strong>{" "}
        <a href="mailto:atencionalcliente@universaldecauchos.com">atencionalcliente@universaldecauchos.com</a>
        <br />
        <strong>Teléfono:</strong> 320 88 999 33
      </p>

      <h2>2. Datos que tratamos</h2>
      <p>
        Recolectamos los datos que nos suministras directamente al crear una cuenta, realizar un pedido,
        solicitar una cotización o comunicarte con nuestro equipo comercial: nombre, empresa, correo
        electrónico, teléfono, ciudad, dirección y, cuando aplica, información técnica del producto o pieza
        que solicitas.
      </p>
      <p>No solicitamos ni tratamos datos sensibles (salud, origen étnico, opiniones políticas, etc.).</p>

      <h2>3. Finalidades del tratamiento</h2>
      <ul>
        <li>Gestionar el registro, autenticación y administración de tu cuenta.</li>
        <li>Procesar pedidos, cotizaciones, facturación, envíos y garantías.</li>
        <li>Atender solicitudes, PQRS y comunicaciones de servicio al cliente.</li>
        <li>Enviar información comercial sobre productos y promociones, cuando hayas autorizado recibirla.</li>
        <li>Cumplir obligaciones legales, contables y tributarias.</li>
        <li>Realizar análisis estadísticos internos para mejorar nuestros productos y servicio.</li>
      </ul>

      <h2>4. Derechos del titular</h2>
      <p>Como titular de tus datos personales tienes derecho a:</p>
      <ul>
        <li>Conocer, actualizar y rectificar tus datos personales.</li>
        <li>
          Solicitar prueba de la autorización otorgada para el tratamiento, salvo que la ley exceptúe este
          requisito.
        </li>
        <li>
          Ser informado sobre el uso que se le ha dado a tus datos personales, previa solicitud.
        </li>
        <li>Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley.</li>
        <li>
          Revocar la autorización y/o solicitar la supresión del dato, cuando no exista un deber legal o
          contractual que nos obligue a conservarlo.
        </li>
        <li>Acceder de forma gratuita a tus datos personales que hayan sido objeto de tratamiento.</li>
      </ul>

      <h2>5. Procedimiento para ejercer tus derechos</h2>
      <p>
        Puedes ejercer cualquiera de estos derechos enviando una solicitud al correo{" "}
        <a href="mailto:atencionalcliente@universaldecauchos.com">atencionalcliente@universaldecauchos.com</a>{" "}
        indicando: nombre completo, documento de identidad, descripción clara de la solicitud (acceso,
        actualización, rectificación, supresión o revocación) y los medios de contacto para dar respuesta.
      </p>
      <p>
        Responderemos tu solicitud dentro de los 10 días hábiles siguientes a su recepción. Si no es posible
        atenderla en ese plazo, te informaremos los motivos y la fecha en que se atenderá, la cual no podrá
        superar los 5 días hábiles siguientes al vencimiento del primer plazo, conforme al artículo 14 de la
        Ley 1581 de 2012.
      </p>

      <h2>6. Vigencia y conservación de los datos</h2>
      <p>
        Tus datos se conservarán mientras exista una relación contractual o comercial vigente, y
        posteriormente durante los plazos exigidos por la normativa contable, tributaria y comercial
        aplicable en Colombia. Una vez cumplidos estos plazos, y a menos que exista otro deber legal de
        conservación, los datos serán eliminados o anonimizados de forma segura.
      </p>

      <h2>7. Seguridad de la información</h2>
      <p>
        GEU implementa medidas técnicas, humanas y administrativas razonables para proteger tus datos
        personales contra pérdida, uso indebido, acceso no autorizado o alteración.
      </p>

      <h2>8. Cambios en esta política</h2>
      <p>
        Cualquier cambio sustancial en esta política será informado a través de este mismo sitio web,
        actualizando la fecha que aparece al inicio de la página.
      </p>
    </LegalPageLayout>
  );
}
