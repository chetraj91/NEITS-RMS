import { prisma } from "../config/prisma";
import { getNextPurchaseReturnNumber } from "./purchaseReturnNumber.service";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function createPurchaseReturn(data: any) {
  if (
    !data.supplierId ||
    String(data.supplierId).trim() === ""
  ) {
    throw new Error("Supplier is required.");
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new Error(
      "Purchase return must contain at least one item."
    );
  }

  const supplierId =
    String(data.supplierId).trim();

  const refundMethod =
    String(
      data.refundMethod ||
        "SUPPLIER_CREDIT"
    ).trim() || "SUPPLIER_CREDIT";

  const reason =
    data.reason
      ? String(data.reason).trim()
      : null;

  const notes =
    data.notes
      ? String(data.notes).trim()
      : null;

  const returnNumber =
    await getNextPurchaseReturnNumber();

  const result =
    await prisma.$transaction(
      async (tx) => {
        // =================================================
        // SUPPLIER
        // =================================================

        const supplier =
          await tx.supplier.findUnique({
            where: {
              id: supplierId,
            },
          });

        if (!supplier) {
          throw new Error(
            "Supplier not found."
          );
        }

        // =================================================
        // VALIDATE RETURN ITEMS
        // =================================================

        let totalAmount = 0;

        const returnItems: any[] = [];

        for (const item of data.items) {
          const inventoryId =
            String(
              item.inventoryId || ""
            ).trim();

          if (!inventoryId) {
            throw new Error(
              "Every purchase return item must have an inventory item."
            );
          }

          const quantity =
            Number(item.quantity);

          if (
            !Number.isInteger(quantity) ||
            quantity <= 0
          ) {
            throw new Error(
              "Return quantity must be a whole number greater than zero."
            );
          }

          // -----------------------------------------------
          // INVENTORY
          // -----------------------------------------------

          const inventory =
            await tx.inventory.findUnique({
              where: {
                id: inventoryId,
              },

              select: {
                id: true,
                itemName: true,
                quantity: true,
                purchasePrice: true,
                supplierId: true,
              },
            });

          if (!inventory) {
            throw new Error(
              "Inventory item not found."
            );
          }

          // -----------------------------------------------
          // SUPPLIER VALIDATION
          // -----------------------------------------------

          if (
            inventory.supplierId !==
            supplierId
          ) {
            throw new Error(
              `${inventory.itemName} does not belong to the selected supplier.`
            );
          }

          // -----------------------------------------------
          // STOCK VALIDATION
          // -----------------------------------------------

          if (
            quantity >
            Number(inventory.quantity || 0)
          ) {
            throw new Error(
              `Return quantity for ${inventory.itemName} cannot exceed available stock. Available: ${inventory.quantity}.`
            );
          }

          const purchasePrice =
            Number(
              item.purchasePrice ??
                inventory.purchasePrice ??
                0
            );

          if (
            !Number.isFinite(
              purchasePrice
            ) ||
            purchasePrice < 0
          ) {
            throw new Error(
              `Invalid purchase price for ${inventory.itemName}.`
            );
          }

          const total =
            quantity *
            purchasePrice;

          totalAmount += total;

          returnItems.push({
            inventoryId,
            quantity,
            purchasePrice,
            total,
          });
        }

        // =================================================
        // CREATE PURCHASE RETURN
        // =================================================

        const purchaseReturn =
          await tx.purchaseReturn.create({
            data: {
              returnNumber,
              supplierId,
              totalAmount,
              refundAmount:
                totalAmount,
              refundMethod,
              reason,
              notes,
            },
          });

        // =================================================
        // RETURN ITEMS + REDUCE STOCK
        // =================================================

        for (const item of returnItems) {
          await tx.purchaseReturnItem.create({
            data: {
              purchaseReturnId:
                purchaseReturn.id,

              inventoryId:
                item.inventoryId,

              quantity:
                item.quantity,

              purchasePrice:
                item.purchasePrice,

              total:
                item.total,
            },
          });

          const stockUpdate =
            await tx.inventory.updateMany({
              where: {
                id: item.inventoryId,
                quantity: {
                  gte: item.quantity,
                },
              },

              data: {
                quantity: {
                  decrement:
                    item.quantity,
                },
              },
            });

          if (
            stockUpdate.count !== 1
          ) {
            throw new Error(
              "Unable to reduce inventory stock."
            );
          }
        }

        // =================================================
        // CASH REFUND FROM SUPPLIER
        // =================================================
        //
        // Supplier returns money to us,
        // therefore Cash Book = CASH IN.
        // =================================================

        if (
          refundMethod ===
            "CASH_REFUND" &&
          totalAmount > 0
        ) {
          await tx.cashBook.create({
            data: {
              particulars:
                `Purchase Return - ${returnNumber} (CASH)`,

              debit: 0,

              credit:
                totalAmount,

              balance: 0,
            },
          });
        }

        // =================================================
        // RETURN RESULT
        // =================================================

        return tx.purchaseReturn.findUnique({
          where: {
            id:
              purchaseReturn.id,
          },

          include: {
            purchase: true,
            supplier: true,

            items: {
              include: {
                inventory: true,
                purchaseItem: true,
              },
            },
          },
        });
      }
    );

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return result;
}

// =========================================================
// GET PURCHASE RETURNS
// =========================================================

export async function getPurchaseReturns() {
  return prisma.purchaseReturn.findMany({
    include: {
      purchase: true,
      supplier: true,

      items: {
        include: {
          inventory: true,
          purchaseItem: true,
        },
      },
    },

    orderBy: {
      returnDate: "desc",
    },
  });
}

// =========================================================
// GET ONE PURCHASE RETURN
// =========================================================

export async function getPurchaseReturn(
  id: string
) {
  return prisma.purchaseReturn.findUnique({
    where: {
      id,
    },

    include: {
      purchase: true,
      supplier: true,

      items: {
        include: {
          inventory: true,
          purchaseItem: true,
        },
      },
    },
  });
}