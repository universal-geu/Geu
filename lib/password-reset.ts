import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { emailLayout, escapeHtml, sendEmail } from "@/lib/email";

// "Olvidé mi contraseña" without a tokens table: the link carries a signed,
// short-lived JWT bound to a fingerprint of the user's current password hash.
// Once the password changes, the fingerprint no longer matches, so each link
// works only once (and any older links die with it).

const RESET_TTL = "1h";
const encoder = new TextEncoder();

function getResetKey() {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret) {
    throw new Error("APP_SESSION_SECRET no está configurada.");
  }
  // Distinct from the session key so a session token can never pass as a reset token.
  return encoder.encode(`password-reset:${secret}`);
}

function fingerprint(passwordHash: string) {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

// Never built from the request's Host header — a forged Host would otherwise
// put a valid reset token inside a link to someone else's domain.
function getSiteBaseUrl() {
  const configured = process.env.APP_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionHost) return `https://${productionHost}`;
  return "http://localhost:3000";
}

/** Emails a reset link when the address belongs to an active customer; silent otherwise. */
export async function requestPasswordReset(email: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, fullName: true, role: true, active: true, passwordHash: true },
  });

  // Admin passwords are rotated with scripts/set-admin-password.ts, never by email.
  if (!user || !user.active || user.role !== "CUSTOMER") return;

  const token = await new SignJWT({ sub: user.id, fp: fingerprint(user.passwordHash) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(RESET_TTL)
    .sign(getResetKey());

  const link = `${getSiteBaseUrl()}/restablecer-contrasena?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: user.email,
    subject: "Crea una nueva contraseña",
    html: emailLayout(
      "Restablece tu contraseña",
      `<p style="color:#6e7379;font-size:14px;line-height:22px;">
        Hola ${escapeHtml(user.fullName)}, recibimos una solicitud para crear una nueva contraseña en tu cuenta.
      </p>
      <p style="margin:24px 0;">
        <a href="${link}" style="display:inline-block;background:#075ed8;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:999px;">
          Crear nueva contraseña
        </a>
      </p>
      <p style="color:#6e7379;font-size:13px;line-height:20px;">
        El enlace vence en 1 hora y solo se puede usar una vez. Si no pediste este cambio, ignora este correo: tu contraseña sigue igual.
      </p>`,
      "Cauchos",
    ),
  });
}

/** Sets the new password and returns the user, or throws INVALID_RESET_TOKEN. */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  let payload: { sub?: string; fp?: unknown };
  try {
    ({ payload } = await jwtVerify(token, getResetKey()));
  } catch {
    throw new Error("INVALID_RESET_TOKEN");
  }

  const user = payload.sub
    ? await prisma.user.findUnique({ where: { id: payload.sub } })
    : null;

  if (
    !user ||
    !user.active ||
    user.role !== "CUSTOMER" ||
    payload.fp !== fingerprint(user.passwordHash)
  ) {
    throw new Error("INVALID_RESET_TOKEN");
  }

  const passwordHash = await hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return { id: user.id, email: user.email, role: user.role, division: user.division };
}
