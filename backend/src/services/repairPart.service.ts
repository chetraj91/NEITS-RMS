import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function addRepairPart(data: {
  repairJobId: string;
  inventoryId: string;
  quantity: number;
  price?: number;
}) {
  console.log("===== addRepairPart() CALLED =====");
  console.log(data);

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

  // =====================================================
  // PRICE
  //
  // If a custom repair price is supplied, use it.
  // Otherwise use the inventory selling price.
  // =====================================================

  const repairPartPrice =
    data.price !== undefined
      ? Number(data.price)
      : Number(inventory.sellingPrice);

  if (
    !Number.isFinite(repairPartPrice) ||
    repairPartPrice < 0
  ) {
    throw new Error(
      "Part price must be a valid amount."
    );
  }

  const repairPart = await prisma.$transaction(
    async (tx) => {
      const repairPart =
        await tx.repairPart.create({
          data: {
            repairJobId:
              data.repairJobId,

            inventoryId:
              data.inventoryId,

            quantity:
              data.quantity,

            price:
              repairPartPrice,
          },
        });

      await tx.inventory.update({
        where: {
          id: inventory.id,
        },
        data: {
          quantity:
            inventory.quantity -
            data.quantity,
        },
      });

      const parts =
        await tx.repairPart.findMany({
          where: {
            repairJobId:
              data.repairJobId,
          },
        });

      console.log("Repair Parts:");
      console.log(parts);

      const totalEstimate =
        parts.reduce(
          (sum, part) =>
            sum +
            part.price *
              part.quantity,
          0
        );

      console.log(
        "Repair Job ID:",
        data.repairJobId
      );

      console.log(
        "Total Estimate:",
        totalEstimate
      );

      console.log(
        "Advance:",
        repairJob.advanceAmount
      );

      await tx.repairJob.update({
        where: {
          id: data.repairJobId,
        },
        data: {
          estimatedCost:
            totalEstimate,

          totalAmount:
            totalEstimate,

          balanceAmount:
            totalEstimate -
            repairJob.advanceAmount,
        },
      });

      console.log(
        "Repair Job Updated"
      );

      return repairPart;
    }
  );

  // =========================================
  // AUTOMATIC EXCEL BACKUP
  // =========================================

  triggerAutomaticExcelBackup();

  return repairPart;
}

export async function getRepairParts(
  repairJobId: string
) {
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

export async function deleteRepairPart(
  id: string
) {
  const repairPart =
    await prisma.repairPart.findUnique({
      where: {
        id,
      },
      include: {
        inventory: true,
      },
    });

  if (!repairPart) {
    throw new Error(
      "Repair part not found."
    );
  }

  await prisma.$transaction(
    async (tx) => {
      await tx.inventory.update({
        where: {
          id: repairPart.inventoryId,
        },
        data: {
          quantity:
            repairPart.inventory
              .quantity +
            repairPart.quantity,
        },
      });

      await tx.repairPart.delete({
        where: {
          id,
        },
      });

      const remainingParts =
        await tx.repairPart.findMany({
          where: {
            repairJobId:
              repairPart.repairJobId,
          },
        });

      const totalEstimate =
        remainingParts.reduce(
          (sum, part) =>
            sum +
            part.price *
              part.quantity,
          0
        );

      const job =
        await tx.repairJob.findUnique({
          where: {
            id: repairPart.repairJobId,
          },
        });

      await tx.repairJob.update({
      where: {
      id: repairPart.repairJobId,
      },
      data: {
      estimatedCost:
      totalEstimate,

      totalAmount:
      totalEstimate,

      balanceAmount:
      totalEstimate -
      (job?.advanceAmount ?? 0),
      },
      });
     }
     );

  // =========================================
  // AUTOMATIC EXCEL BACKUP
  // =========================================

  triggerAutomaticExcelBackup();

  return true;
}