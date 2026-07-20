import { prisma } from "../config/prisma";

export async function createPurchase(data: any) {
  const {
    supplierId,
    purchaseDate,
    paymentMethod,
    invoiceNumber,
    remarks,
    discount = 0,
    tax = 0,
    paidAmount = 0,
    items,
  } = data;

  if (!items || items.length === 0) {
    throw new Error("Purchase must contain at least one item.");
  }

  const purchaseCount = await prisma.purchase.count();

  const purchaseNumber = `PUR-${String(purchaseCount + 1).padStart(5, "0")}`;

  let totalAmount = 0;

  for (const item of items) {
    totalAmount += item.quantity * item.purchasePrice;
  }

  totalAmount = totalAmount - discount + tax;

  const dueAmount = totalAmount - paidAmount;

  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        totalAmount,
        discount,
        tax,
        paidAmount,
        dueAmount,
        paymentMethod,
        invoiceNumber,
        remarks,
      },
    });

    for (const item of items) {
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
          total: item.quantity * item.purchasePrice,
        },
      });

      await tx.inventory.update({
        where: {
          id: item.inventoryId,
        },
        data: {
          quantity: {
            increment: item.quantity,
          },
          purchasePrice: item.purchasePrice,
          sellingPrice: item.sellingPrice,
        },
      });
    }

    return purchase;
  });
}

export async function getPurchases() {
  return prisma.purchase.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPurchase(id: string) {
  return prisma.purchase.findUnique({
    where: {
      id,
    },
    include: {
      supplier: true,
      items: {
        include: {
          inventory: true,
        },
      },
    },
  });
}

export async function deletePurchase(id: string) {
  return prisma.purchase.delete({
    where: {
      id,
    },
  });
}