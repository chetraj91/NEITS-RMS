import { prisma } from "../config/prisma";

export async function createSale(data: any) {
  const customer = data.customerId
    ? await prisma.customer.findUnique({
        where: { id: data.customerId },
      })
    : null;

  if (data.customerId && !customer) {
    throw new Error("Customer not found.");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("No sale items found.");
  }

  const saleCount = await prisma.sale.count();

  const saleNumber = `SAL-${String(saleCount + 1).padStart(5, "0")}`;

  let subtotal = 0;

  for (const item of data.items) {
    const inventory = await prisma.inventory.findUnique({
      where: {
        id: item.inventoryId,
      },
    });

    if (!inventory) {
      throw new Error("Inventory item not found.");
    }

    if (inventory.quantity < item.quantity) {
      throw new Error(
        `${inventory.itemName} has only ${inventory.quantity} item(s) in stock.`
      );
    }

    subtotal += item.quantity * item.sellingPrice;
  }

  const discount = Number(data.discount || 0);
  const tax = Number(data.tax || 0);
  const paidAmount = Number(data.paidAmount || 0);

  const totalAmount = subtotal - discount + tax;
  const dueAmount = totalAmount - paidAmount;

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        saleNumber,
        customerId: data.customerId || null,
        totalAmount,
        discount,
        tax,
        paidAmount,
        dueAmount,
        paymentMethod: data.paymentMethod,
        remarks: data.remarks,
      },
    });

    for (const item of data.items) {
      const inventory = await tx.inventory.findUnique({
        where: {
          id: item.inventoryId,
        },
      });

      if (!inventory) continue;

      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          inventoryId: inventory.id,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          total: item.quantity * item.sellingPrice,
        },
      });

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          quantity: inventory.quantity - item.quantity,
        },
      });
    }

    return sale;
  });
}

export async function getSales() {
  return prisma.sale.findMany({
    include: {
      customer: true,
      saleItems: {
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

export async function getSale(id: string) {
  return prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      saleItems: {
        include: {
          inventory: true,
        },
      },
    },
  });
}

export async function updateSale(id: string, data: any) {
  return prisma.sale.update({
    where: {
      id,
    },
    data: {
      customerId: data.customerId,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
      discount: data.discount,
      tax: data.tax,
      paidAmount: data.paidAmount,
      dueAmount: data.dueAmount,
    },
  });
}

export async function deleteSale(id: string) {
  const sale = await prisma.sale.findUnique({
    where: {
      id,
    },
    include: {
      saleItems: true,
    },
  });

  if (!sale) {
    throw new Error("Sale not found.");
  }

  return prisma.$transaction(async (tx) => {
    for (const item of sale.saleItems) {
      const inventory = await tx.inventory.findUnique({
        where: {
          id: item.inventoryId,
        },
      });

      if (inventory) {
        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            quantity: inventory.quantity + item.quantity,
          },
        });
      }
    }

    await tx.saleItem.deleteMany({
      where: {
        saleId: id,
      },
    });

    return tx.sale.delete({
      where: {
        id,
      },
    });
  });
}