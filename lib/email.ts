import { Resend } from "resend";
import { DIVISION_BRAND, type DivisionName } from "@/lib/divisions";

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "GEU <onboarding@resend.dev>";

let client: Resend | null | undefined;

function getClient() {
  if (client !== undefined) return client;

  if (!process.env.RESEND_API_KEY) {
    client = null;
    return client;
  }

  client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getClient();

  if (!resend) {
    console.warn(`[email] RESEND_API_KEY no configurada, se omite el envío a ${to}: "${subject}"`);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[email] No fue posible enviar el correo:", error);
  }
}

export function emailLayout(title: string, bodyHtml: string, division: DivisionName = "Cauchos") {
  const brand = DIVISION_BRAND[division];

  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background: #f5f5f5; padding: 32px 16px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: ${brand.accent}; padding: 20px 28px;">
          <span style="color: #ffffff; font-weight: 900; font-size: 20px; letter-spacing: 0.04em;">GEU</span>
          <span style="color: #ffffff; opacity: 0.85; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; display: block; margin-top: 2px;">
            ${brand.label}
          </span>
        </div>
        <div style="padding: 28px;">
          <h1 style="margin: 0 0 16px; font-size: 20px; color: #16384f;">${title}</h1>
          ${bodyHtml}
        </div>
      </div>
    </div>
  `;
}
