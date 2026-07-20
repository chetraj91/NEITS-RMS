import { prisma } from "../config/prisma";

export async function addRepairPart(data: {
  repairJobId: string;
  inventoryId: string;
  quantity: number;
}) {
  const repairJob = await prisma.repairJob.findUnique({
    where: {
      id: data.repairJobId,
    },
  });

  if (!repairJob) {
    throw new Error("Repair job not found.");
  }

  const inventory = await prisma.inventory.findUnique({
    where: {
      id: data.inventoryId,
    },
  });

  if (!inventory) {
    throw new Error("Inventory item not found.");
  }

  if (inventory.quantity < data.quantity) {
    throw new Error(
      `${inventory.itemName} has only ${inventory.quantity} item(s) available.`
    );
  }

  const total = inventory.sellingPrice * data.quantity;

  return prisma.$transaction(async (tx) => {
    const repairPart = await tx.repairPart.create({
      data: {
        repairJobId: data.repairJobId,
        inventoryId: data.inventoryId,
        quantity: data.quantity,
        unitPrice: inventory.sellingPrice,
        total,
      },
    });

    await tx.inventory.update({
      where: {
        id: inventory.id,
      },
      data: {
        quantity: inventory.quantity - data.quantity,
      },
    });

    return repairPart;
  });
}

export async function getRepairParts(repairJobId: string) {
  return prisma.repairPart.findMany({
    where: {
      repairJobId,
    },
    include: {
      inventory: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function deleteRepairPart(id: string) {
  const repairPart = await prisma.repairPart.findUnique({
    where: {
      id,
    },
    include: {
      inventory: true,
    },
  });

  if (!repairPart) {
    throw new Error("Repair part not found.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.inventory.update({
      where: {
        id: repairPart.inventoryId,
      },
      data: {
        quantity: repairPart.inventory.quantity + repairPart.quantity,
      },
    });

    await tx.repairPart.delete({
      where: {
        id,
      },
    });

    return true;
  });
}