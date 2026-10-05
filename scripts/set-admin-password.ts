// Cambia la contraseña de los administradores de GEU directamente en la base.
//
//   npx tsx scripts/set-admin-password.ts                 → nueva contraseña aleatoria para cada administrador
//   npx tsx scripts/set-admin-password.ts admin@geu.com.co → solo ese correo
//
// Imprime las contraseñas nuevas una sola vez: guárdalas y entrégalas por un
// canal privado. Usa DATABASE_URL de .env.local.
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { DIVISIONS, DIVISION_ADMIN_EMAILS } from "../lib/divisions";

config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("Falta DATABASE_URL.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

function generatePassword() {
  // 16 caracteres sin símbolos confusos (0/O, 1/l/I).
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(16);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function main() {
  const only = process.argv[2]?.trim().toLowerCase();
  const emails = only ? [only] : DIVISIONS.map((division) => DIVISION_ADMIN_EMAILS[division]);

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      console.log(`${email}: no existe como administrador, se omite.`);
      continue;
    }
    const password = generatePassword();
    await prisma.user.update({ where: { email }, data: { passwordHash: await hash(password, 10) } });
    console.log(`${email}  →  ${password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
