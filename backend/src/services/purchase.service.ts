import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function createPurchase(data: any) {
  const {
    supplierId,
    purchaseDate,
    supplierInvoiceNumber,
    invoiceNumber,
    paymentMethod = "CASH",
    remarks,
    discount = 0,
    tax = 0,
    paidAmount = 0,
    items,
  } = data;

  if (!supplierId) {
    throw new Error("Supplier is required.");
  }

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "Purchase must contain at least one item."
    );
  }

  for (const item of items) {
    if (!item.inventoryId) {
      throw new Error(
        "Every purchase item must have an inventory item."
      );
    }

    if (
      Number(item.quantity) <= 0
    ) {
      throw new Error(
        "Purchase quantity must be greater than zero."
      );
    }

    if (
      Number(item.purchasePrice) < 0
    ) {
      throw new Error(
        "Purchase price cannot be negative."
      );
    }
  }

  // =====================================================
  // PURCHASE NUMBER
  // =====================================================

  const purchaseCount =
    await prisma.purchase.count();

  const purchaseNumber =
    `PUR-${String(
      purchaseCount + 1
    ).padStart(5, "0")}`;

  // =====================================================
  // CALCULATE TOTALS
  // =====================================================

  let itemsTotal = 0;

  for (const item of items) {
    itemsTotal +=
      Number(item.quantity) *
      Number(item.purchasePrice);
  }

  const discountAmount =
    Math.max(
      0,
      Number(discount || 0)
    );

  const taxAmount =
    Math.max(
      0,
      Number(tax || 0)
    );

  const totalAmount =
    Math.max(
      0,
      itemsTotal -
        discountAmount +
        taxAmount
    );

  const paid =
    Math.max(
      0,
      Number(paidAmount || 0)
    );

  const dueAmount =
    Math.max(
      0,
      totalAmount - paid
    );

  // =====================================================
  // SUPPLIER INVOICE NUMBER
  // =====================================================

  const finalSupplierInvoiceNumber =
    String(
      supplierInvoiceNumber ??
        invoiceNumber ??
        ""
    ).trim() || null;

  // =====================================================
  // CREATE PURCHASE
  // =====================================================

  const purchase =
    await prisma.$transaction(
      async (tx) => {
        const purchase =
          await tx.purchase.create({
            data: {
              purchaseNumber,

              supplierId,

              purchaseDate:
                purchaseDate
                  ? new Date(
                      purchaseDate
                    )
                  : new Date(),

              totalAmount,

              supplierInvoiceNumber:
                finalSupplierInvoiceNumber,

              paymentMethod:
                paymentMethod || "CASH",

              paidAmount:
                paid,

              dueAmount:
                dueAmount,

              notes:
                remarks
                  ? String(
                      remarks
                    ).trim()
                  : null,
            },
          });

        // ===============================================
        // PURCHASE PAYMENT → CASH BOOK OUT
        // ===============================================

        if (paid > 0) {
          await tx.cashBook.create({
            data: {
              particulars:
                `Purchase Payment - ${purchase.purchaseNumber} - ${
                  paymentMethod || "CASH"
                }`,

              debit: paid,

              credit: 0,

              balance: 0,
            },
          });
        }

        // =================================================
        // PURCHASE ITEMS
        // =================================================

        for (const item of items) {
          const quantity =
            Number(
              item.quantity
            );

          const purchasePrice =
            Number(
              item.purchasePrice
            );

          const sellingPrice =
            Number(
              item.sellingPrice ??
                0
            );

          const total =
            quantity *
            purchasePrice;

          await tx.purchaseItem.create({
            data: {
              purchaseId:
                purchase.id,

              inventoryId:
                item.inventoryId,

              quantity,

              purchasePrice,

              total,
            },
          });

          // ===============================================
          // ADD STOCK
          // ===============================================

          await tx.inventory.update({
            where: {
              id: item.inventoryId,
            },

            data: {
              quantity: {
                increment:
                  quantity,
              },

              purchasePrice,

              sellingPrice,
            },
          });
        }

        return purchase;
      }
    );

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return purchase;
}

// =====================================================
// GET ALL PURCHASES
// =====================================================

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

// =====================================================
// GET SINGLE PURCHASE
// =====================================================

export async function getPurchase(
  id: string
) {
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

// =====================================================
// DELETE PURCHASE
// =====================================================

export async function deletePurchase(
  id: string
) {
  const purchase =
    await prisma.purchase.delete({
      where: {
        id,
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return purchase;
}