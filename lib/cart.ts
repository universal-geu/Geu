import { prisma } from "@/lib/prisma";
import { formatearMoneda } from "@/app/data/catalog";

export type PersistedCartItem = {
  id: string;
  nombre: string;
  precio: string;
  imagen: string;
  cantidad: number;
};

// The client-side cart id is either a plain product slug, or (for a
// variant/"medida" selection) a composite "slug::variantSku" string. The DB
// keeps slug and variant sku in separate columns — this is the only place
// that string gets built and taken apart.
export function parseCartItemId(id: string): { slug: string; variantSku: string } {
  const separatorIndex = id.indexOf("::");
  if (separatorIndex === -1) return { slug: id, variantSku: "" };
  return {
    slug: id.slice(0, separatorIndex),
    variantSku: id.slice(separatorIndex + 2),
  };
}

function buildCartItemId(productId: string, variantSku: string) {
  return variantSku ? `${productId}::${variantSku}` : productId;
}

// The client can't be trusted to report the correct price — always look up
// the product's real price server-side before persisting a cart item.
async function getTrustedPrice(productId: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const product = await prisma.product.findUnique({
    where: { slug: productId },
    select: { price: true },
  });

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  return formatearMoneda(product.price);
}

// A variant sku is client-supplied — always verify it actually belongs to
// the product before trusting it (mirrors getTrustedPrice above).
async function getTrustedVariantLabel(productId: string, variantSku: string) {
  if (!variantSku) return "";
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const variant = await prisma.productVariant.findFirst({
    where: { sku: variantSku, product: { slug: productId } },
    select: { label: true },
  });

  if (!variant) {
    throw new Error("VARIANT_NOT_FOUND");
  }

  return variant.label;
}

export async function getCartItemsForUser(userId: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return items.map((item) => ({
    id: buildCartItemId(item.productId, item.variantSku),
    nombre: item.name,
    precio: item.price,
    imagen: item.image,
    cantidad: item.quantity,
  }));
}

export async function addCartItemForUser(
  userId: string,
  item: Omit<PersistedCartItem, "cantidad"> & { cantidad?: number },
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const { slug, variantSku } = parseCartItemId(item.id);
  const quantityToAdd = Math.max(1, Math.trunc(item.cantidad ?? 1));
  const trustedPrice = await getTrustedPrice(slug);
  const variantLabel = await getTrustedVariantLabel(slug, variantSku);

  await prisma.cartItem.upsert({
    where: {
      userId_productId_variantSku: {
        userId,
        productId: slug,
        variantSku,
      },
    },
    update: {
      name: item.nombre,
      price: trustedPrice,
      image: item.imagen,
      variantLabel,
      quantity: {
        increment: quantityToAdd,
      },
    },
    create: {
      userId,
      productId: slug,
      variantSku,
      variantLabel,
      name: item.nombre,
      price: trustedPrice,
      image: item.imagen,
      quantity: quantityToAdd,
    },
  });

  return getCartItemsForUser(userId);
}

export async function updateCartItemQuantityForUser(
  userId: string,
  productId: string,
  variantSku: string,
  action: "increment" | "decrement",
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  const item = await prisma.cartItem.findUnique({
    where: {
      userId_productId_variantSku: {
        userId,
        productId,
        variantSku,
      },
    },
  });

  if (!item) {
    return getCartItemsForUser(userId);
  }

  if (action === "decrement" && item.quantity <= 1) {
    await prisma.cartItem.delete({
      where: {
        userId_productId_variantSku: {
          userId,
          productId,
          variantSku,
        },
      },
    });
  } else {
    await prisma.cartItem.update({
      where: {
        userId_productId_variantSku: {
          userId,
          productId,
          variantSku,
        },
      },
      data: {
        quantity: {
          [action === "increment" ? "increment" : "decrement"]: 1,
        },
      },
    });
  }

  return getCartItemsForUser(userId);
}

export async function removeCartItemForUser(
  userId: string,
  productId: string,
  variantSku: string,
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  await prisma.cartItem.deleteMany({
    where: {
      userId,
      productId,
      variantSku,
    },
  });

  return getCartItemsForUser(userId);
}

export async function clearCartForUser(userId: string) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return [];
}

export async function syncCartItemsForUser(
  userId: string,
  items: PersistedCartItem[],
) {
  if (!prisma) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  for (const item of items) {
    const { slug, variantSku } = parseCartItemId(item.id);
    let trustedPrice: string;
    let variantLabel: string;
    try {
      trustedPrice = await getTrustedPrice(slug);
      variantLabel = await getTrustedVariantLabel(slug, variantSku);
    } catch {
      // Guest cart references a product (or medida) that no longer exists —
      // skip it instead of trusting the client-supplied price.
      continue;
    }

    await prisma.cartItem.upsert({
      where: {
        userId_productId_variantSku: {
          userId,
          productId: slug,
          variantSku,
        },
      },
      update: {
        name: item.nombre,
        price: trustedPrice,
        image: item.imagen,
        variantLabel,
        quantity: {
          increment: item.cantidad,
        },
      },
      create: {
        userId,
        productId: slug,
        variantSku,
        variantLabel,
        name: item.nombre,
        price: trustedPrice,
        image: item.imagen,
        quantity: item.cantidad,
      },
    });
  }

  return getCartItemsForUser(userId);
}
