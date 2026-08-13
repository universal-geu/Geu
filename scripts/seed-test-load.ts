// Load-test seed: creates 500 clearly-marked test users and 50 orders for
// one of them, against the real database (there is no separate staging DB
// for this project). Every row this script creates is tagged so it can be
// found and deleted later:
//   - users:  email ends in @test.geu.local, fullName starts with "TEST - "
//   - orders: adminNotes === "SEED_TEST_LOAD"
//
// Run with: npx tsx scripts/seed-test-load.ts
// Clean up with: npx tsx scripts/cleanup-test-load.ts

import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: ".env.local" });

const TEST_EMAIL_DOMAIN = "test.geu.local";
const TEST_NAME_PREFIX = "TEST - ";
const TEST_ORDER_MARKER = "SEED_TEST_LOAD";
const USER_COUNT = 500;
const ORDER_COUNT = 50;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

const CITIES: { city: string; department: string }[] = [
  { city: "Bogotá", department: "Cundinamarca" },
  { city: "Medellín", department: "Antioquia" },
  { city: "Cali", department: "Valle del Cauca" },
  { city: "Barranquilla", department: "Atlántico" },
  { city: "Cartagena", department: "Bolívar" },
  { city: "Bucaramanga", department: "Santander" },
  { city: "Pereira", department: "Risaralda" },
  { city: "Manizales", department: "Caldas" },
  { city: "Ibagué", department: "Tolima" },
  { city: "Cúcuta", department: "Norte de Santander" },
];

const FIRST_NAMES = [
  "Juan", "María", "Carlos", "Laura", "Andrés", "Camila", "Diego", "Valentina",
  "Santiago", "Daniela", "Felipe", "Isabella", "Miguel", "Sofía", "Jorge", "Paula",
];
const LAST_NAMES = [
  "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez",
  "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Vargas",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

async function main() {
  console.log(`Creating ${USER_COUNT} test users...`);
  const passwordHash = await hash("test-password-not-real", 10);

  const userRows = Array.from({ length: USER_COUNT }, (_, i) => {
    const n = i + 1;
    const firstName = pick(FIRST_NAMES, i);
    const lastName = pick(LAST_NAMES, i + 7);
    const location = pick(CITIES, i);
    return {
      fullName: `${TEST_NAME_PREFIX}${firstName} ${lastName} ${String(n).padStart(3, "0")}`,
      email: `test-user-${String(n).padStart(3, "0")}@${TEST_EMAIL_DOMAIN}`,
      passwordHash,
      role: "CUSTOMER" as const,
      phone: `300${String(1000000 + n).padStart(7, "0")}`,
      city: location.city,
      addressLine1: `Calle de prueba #${n}`,
      active: true,
    };
  });

  await prisma.user.createMany({ data: userRows, skipDuplicates: true });
  console.log(`✓ ${USER_COUNT} test users created (or already existed).`);

  const buyer = await prisma.user.findUnique({
    where: { email: `test-user-001@${TEST_EMAIL_DOMAIN}` },
  });
  if (!buyer) throw new Error("Test buyer not found after createMany.");

  const products = await prisma.product.findMany({
    where: { active: true },
    take: 60,
    select: { slug: true, name: true, price: true, image: true, division: true },
  });
  if (products.length === 0) throw new Error("No active products found to build orders from.");

  const { count: deletedCount } = await prisma.order.deleteMany({
    where: { adminNotes: TEST_ORDER_MARKER },
  });
  if (deletedCount > 0) console.log(`Removed ${deletedCount} previously-seeded test orders first.`);

  console.log(`Creating ${ORDER_COUNT} orders for ${buyer.email}...`);

  const statuses = ["PENDING", "PAID", "CANCELLED"] as const;
  const shippingStatuses = ["PENDING", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

  for (let i = 0; i < ORDER_COUNT; i++) {
    const itemCount = 1 + (i % 4);
    const items = Array.from({ length: itemCount }, (_, j) => {
      const product = products[(i * 3 + j) % products.length];
      const quantity = 1 + ((i + j) % 3);
      return {
        productId: product.slug,
        division: product.division,
        name: product.name,
        image: product.image,
        unitPrice: product.price,
        quantity,
        lineTotal: product.price * quantity,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const location = pick(CITIES, i);
    const createdAt = new Date(Date.now() - i * 1000 * 60 * 60 * 6); // spread over the past ~12 days

    await prisma.order.create({
      data: {
        userId: buyer.id,
        status: pick([...statuses], i),
        paymentStatus: i % 3 === 0 ? "PAID" : "PENDING",
        shippingStatus: pick([...shippingStatuses], i),
        division: items[0].division,
        customerName: buyer.fullName,
        customerEmail: buyer.email,
        customerPhone: buyer.phone ?? "3000000000",
        department: location.department,
        city: location.city,
        addressLine1: buyer.addressLine1 ?? "Calle de prueba",
        adminNotes: TEST_ORDER_MARKER,
        subtotal,
        totalItems,
        createdAt,
        items: { create: items },
      },
    });
  }

  console.log(`✓ ${ORDER_COUNT} orders created for ${buyer.email}.`);
  console.log("\nDone. To remove all of this test data later, run:");
  console.log("  npx tsx scripts/cleanup-test-load.ts");
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
