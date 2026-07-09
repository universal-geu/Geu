import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import {
  descripcionProducto,
  productosCatalogo,
} from "../app/data/catalog";
import {
  DIVISIONS,
  DIVISION_ADMIN_EMAILS,
  DIVISION_ADMIN_NAMES,
  DIVISION_ADMIN_PASSWORD,
} from "../lib/divisions";

// Historical product-type categories used by the static seed catalog to
// tell Cauchos and Import items apart, independent of the current
// industry-based "categoria" taxonomy admins pick from going forward.
const SEED_CAUCHOS_CATEGORIES = [
  "Sellos y empaques",
  "Laminas y rollos",
  "Mangueras",
  "Piezas tecnicas",
  "Fabricacion especial",
] as const;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run prisma db seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

async function main() {
  const adminPasswordHash = await hash(DIVISION_ADMIN_PASSWORD, 10);

  for (const division of DIVISIONS) {
    const email = DIVISION_ADMIN_EMAILS[division];
    const fullName = DIVISION_ADMIN_NAMES[division];

    await prisma.user.upsert({
      where: { email },
      update: {
        fullName,
        role: "ADMIN",
        division,
        passwordHash: adminPasswordHash,
      },
      create: {
        fullName,
        email,
        passwordHash: adminPasswordHash,
        role: "ADMIN",
        division,
      },
    });
  }

  await prisma.product.deleteMany();

  for (const [index, producto] of productosCatalogo.entries()) {
    const stock = producto.stock ?? 12;
    const stockMinimo = producto.stockMinimo ?? 3;

    await prisma.product.create({
      data: {
        slug: producto.slug,
        sku:
          producto.sku ||
          producto.slug.replace(/-/g, "").toUpperCase().slice(0, 10) ||
          `SKU${Date.now()}${index}`,
        oemReference: producto.oemReferencia || null,
        alternativeReferences: {
          set: producto.referenciasAlternas || [],
        },
        category: producto.categoria,
        name: producto.nombre,
        brand: producto.marca,
        division: (SEED_CAUCHOS_CATEGORIES as readonly string[]).includes(producto.categoria)
          ? "Cauchos"
          : "Import",
        price: producto.precioValor,
        previousPrice: Math.max(
          producto.precioValor,
          Number(producto.precioAnterior.replace(/\D/g, "")) || producto.precioValor,
        ),
        stock,
        minimumStock: stockMinimo,
        image: producto.imagen,
        galleryImages: producto.imagenesExtra || [],
        availability: stock <= 0 ? "Agotado" : producto.disponibilidad,
        description:
          producto.descripcion ||
          descripcionProducto({
            nombre: producto.nombre,
            categoria: producto.categoria,
            marca: producto.marca,
          }),
        application:
          producto.aplicacion ||
          `Aplicación comercial para ${producto.categoria.toLowerCase()}.`,
        compatibility: {
          set: producto.compatibilidad || [producto.marca, producto.categoria],
        },
        warranty:
          producto.garantia ||
          "Garantía técnica según aplicación y condiciones de uso.",
        featured: index < 4,
        active: true,
        inventoryMovements: {
          create: {
            type: "CREATED",
            quantity: stock,
            stockAfter: stock,
            note: "Inventario inicial sembrado",
          },
        },
      },
    });
  }
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
