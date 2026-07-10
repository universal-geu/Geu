import { prisma } from "@/lib/prisma";
import { DIVISION_ADMIN_EMAILS, type DivisionName } from "@/lib/divisions";
import { emailLayout, sendEmail } from "@/lib/email";

export type QuoteStatus = "NEW" | "CONTACTED" | "CLOSED";

export type CreateQuoteInput = {
  fullName: string;
  company: string;
  nit: string;
  phone: string;
  division: DivisionName;
  requestType: string;
  productDetails: string;
  process: string[];
  conditions: string[];
  quantityAndDeadline: string;
};

export async function createQuote(input: CreateQuoteInput) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  if (!input.fullName || !input.company || !input.productDetails) {
    throw new Error("INVALID_QUOTE");
  }

  const quote = await prisma.quote.create({
    data: {
      fullName: input.fullName,
      company: input.company,
      nit: input.nit,
      phone: input.phone,
      division: input.division,
      requestType: input.requestType,
      productDetails: input.productDetails,
      process: input.process,
      conditions: input.conditions,
      quantityAndDeadline: input.quantityAndDeadline,
    },
  });

  void sendEmail({
    to: DIVISION_ADMIN_EMAILS[input.division],
    subject: `Nueva solicitud de evaluación técnica — ${input.company}`,
    html: emailLayout(
      "Nueva solicitud de evaluación técnica",
      `
        <p style="margin: 0 0 12px; color: #4b5563; font-size: 14px; line-height: 1.6;">
          ${input.fullName} (${input.company}) envió una nueva solicitud desde el sitio.
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #16384f;">
          <tr><td style="padding: 6px 0; font-weight: 700;">NIT</td><td style="padding: 6px 0;">${input.nit}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Teléfono</td><td style="padding: 6px 0;">${input.phone}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Tipo</td><td style="padding: 6px 0;">${input.requestType}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Producto</td><td style="padding: 6px 0;">${input.productDetails}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Proceso</td><td style="padding: 6px 0;">${input.process.join(", ")}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Condiciones</td><td style="padding: 6px 0;">${input.conditions.join(", ")}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Cantidad / entrega</td><td style="padding: 6px 0;">${input.quantityAndDeadline}</td></tr>
        </table>
      `,
      input.division,
    ),
  });

  return quote;
}

export async function getQuotesForDivision(division: DivisionName) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  return prisma.quote.findMany({
    where: { division },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) {
    throw new Error("QUOTE_NOT_FOUND");
  }

  return prisma.quote.update({ where: { id }, data: { status } });
}
