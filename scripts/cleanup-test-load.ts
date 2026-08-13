// Removes everything created by scripts/seed-test-load.ts:
// test users (email @test.geu.local) and their orders (cascade-deletes
// order items, cart items, and quotes automatically via onDelete: Cascade).
//
// Run with: npx tsx scripts/cleanup-test-load.ts

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });

const TEST_EMAIL_DOMAIN = "test.geu.local";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function main() {
  const testUsers = await prisma.user.findMany({
    where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
    select: { id: true },
  });
  console.log(`Found ${testUsers.length} test users to delete.`);

  if (testUsers.length === 0) {
    console.log("Nothing to clean up.");
    return;
  }

  const { count } = await prisma.user.deleteMany({
    where: { email: { endsWith: `@${TEST_EMAIL_DOMAIN}` } },
  });
  console.log(`✓ Deleted ${count} test users (their orders, cart items, and quotes cascaded).`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
