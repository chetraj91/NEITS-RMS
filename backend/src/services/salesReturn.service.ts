import { prisma } from "../config/prisma";
import { getNextSalesReturnNumber } from "./salesReturnNumber.service";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function createSalesReturn(data: any) {
  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new Error(
      "Sales return must contain at least one item."
    );
  }

  const saleId =
    data.saleId
      ? String(data.saleId)
      : null;

  const customerId =
    data.customerId
      ? String(data.customerId)
      : null;

  const supplierId =
    data.supplierId
      ? String(data.supplierId)
      : null;

  const refundMethod =
    String(
      data.refundMethod ||
        "CUSTOMER_CREDIT"
    ).trim() || "CUSTOMER_CREDIT";

  const reason =
    data.reason
      ? String(data.reason).trim()
      : null;

  const notes =
    data.notes
      ? String(data.notes).trim()
      : null;

  const returnNumber =
    await getNextSalesReturnNumber();

  const result =
    await prisma.$transaction(
      async (tx) => {
        // =================================================
        // ORIGINAL SALE
        // =================================================

        let sale: any = null;

        if (saleId) {
          sale =
            await tx.sale.findUnique({
              where: {
                id: saleId,
              },
              include: {
                customer: true,
                items: true,
              },
            });

          if (!sale) {
            throw new Error(
              "Original sale not found."
            );
          }
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
              "Every return item must have an inventory item."
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

          const inventory =
            await tx.inventory.findUnique({
              where: {
                id: inventoryId,
              },
              select: {
                id: true,
                itemName: true,
                sellingPrice: true,
                supplierId: true,
              },
            });

          if (!inventory) {
            throw new Error(
              "Inventory item not found."
            );
          }

          // ===============================================
          // ORIGINAL SALE VALIDATION
          // ===============================================

          let saleItem: any = null;

          if (sale) {
            saleItem =
              sale.items.find(
                (saleItem: any) =>
                  saleItem.inventoryId ===
                  inventoryId
              );

            if (!saleItem) {
              throw new Error(
                `${inventory.itemName} was not part of the original sale.`
              );
            }

            const previousReturns =
              await tx.salesReturnItem.aggregate({
                where: {
                  saleItemId:
                    saleItem.id,
                },
                _sum: {
                  quantity: true,
                },
              });

            const alreadyReturned =
              Number(
                previousReturns._sum.quantity ||
                  0
              );

            const availableToReturn =
              Math.max(
                0,
                Number(
                  saleItem.quantity
                ) - alreadyReturned
              );

            if (
              quantity >
              availableToReturn
            ) {
              throw new Error(
                `Return quantity for ${inventory.itemName} exceeds the available quantity to return. Available: ${availableToReturn}.`
              );
            }
          }

          const sellingPrice =
            Number(
              item.sellingPrice ??
                saleItem?.sellingPrice ??
                inventory.sellingPrice ??
                0
            );

          if (
            !Number.isFinite(
              sellingPrice
            ) ||
            sellingPrice < 0
          ) {
            throw new Error(
              `Invalid return price for ${inventory.itemName}.`
            );
          }

          const total =
            quantity *
            sellingPrice;

          totalAmount += total;

          returnItems.push({
            inventoryId,
            saleItemId:
              saleItem?.id || null,
            quantity,
            sellingPrice,
            total,
            supplierId:
              supplierId ||
              inventory.supplierId ||
              null,
          });
        }

        // =================================================
        // CUSTOMER
        // =================================================

        const finalCustomerId =
          customerId ||
          sale?.customerId ||
          null;

        // =================================================
        // CREATE SALES RETURN
        // =================================================

        const salesReturn =
          await tx.salesReturn.create({
            data: {
              returnNumber,
              saleId,
              customerId:
                finalCustomerId,
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
        // RETURN ITEMS + RESTORE STOCK
        // =================================================

        for (const item of returnItems) {

          await tx.salesReturnItem.create({
            data: {
              salesReturnId:
                salesReturn.id,
              saleItemId:
                item.saleItemId,
              inventoryId:
                item.inventoryId,
              quantity:
                item.quantity,
              sellingPrice:
                item.sellingPrice,
              total:
                item.total,
            },
          });

          const stockUpdate =
            await tx.inventory.updateMany({
              where: {
                id:
                  item.inventoryId,
              },
              data: {
                quantity: {
                  increment:
                    item.quantity,
                },
              },
            });

          if (
            stockUpdate.count !== 1
          ) {
            throw new Error(
              "Unable to restore inventory stock."
            );
          }
        }

        // =================================================
        // CASH REFUND
        // =================================================

        if (
          refundMethod ===
          "CASH_REFUND"
        ) {
          if (totalAmount > 0) {
            await tx.cashBook.create({
              data: {
                particulars:
                  `Sales Return - ${returnNumber} (CASH)`,
                debit:
                  totalAmount,
                credit: 0,
                balance: 0,
              },
            });
          }
        }

        // =================================================
        // RETURN RESULT
        // =================================================

        return tx.salesReturn.findUnique({
          where: {
            id: salesReturn.id,
          },
          include: {
            sale: true,
            customer: true,
            supplier: true,
            items: {
              include: {
                inventory: true,
                saleItem: true,
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
// GET SALES RETURNS
// =========================================================

export async function getSalesReturns() {
  return prisma.salesReturn.findMany({
    include: {
      sale: true,
      customer: true,
      supplier: true,
      items: {
        include: {
          inventory: true,
          saleItem: true,
        },
      },
    },
    orderBy: {
      returnDate: "desc",
    },
  });
}

// =========================================================
// GET ONE SALES RETURN
// =========================================================

export async function getSalesReturn(
  id: string
) {
  return prisma.salesReturn.findUnique({
    where: {
      id,
    },
    include: {
      sale: true,
      customer: true,
      supplier: true,
      items: {
        include: {
          inventory: true,
          saleItem: true,
        },
      },
    },
  });
}