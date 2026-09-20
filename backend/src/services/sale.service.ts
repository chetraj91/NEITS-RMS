import { prisma } from "../config/prisma";
import { getNextBillNumber } from "./billNumber.service";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

// =====================================================
// CREATE SALE
// =====================================================

export async function createSale(
  data: any
) {
  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new Error(
      "Sale must contain at least one item."
    );
  }

  // =====================================================
  // VALIDATE STOCK
  // =====================================================

  for (const item of data.items) {
    const quantity =
      Number(item.quantity);

    if (!item.inventoryId) {
      throw new Error(
        "Every sale item must have an inventory item."
      );
    }

    if (quantity <= 0) {
      throw new Error(
        "Sale quantity must be greater than zero."
      );
    }

    const inventory =
      await prisma.inventory.findUnique({
        where: {
          id: item.inventoryId,
        },

        select: {
          itemName: true,
          quantity: true,
        },
      });

    if (!inventory) {
      throw new Error(
        "Inventory item not found."
      );
    }

    if (
      inventory.quantity < quantity
    ) {
      throw new Error(
        `Insufficient stock for ${inventory.itemName}. Available: ${inventory.quantity}, requested: ${quantity}.`
      );
    }
  }

  // =====================================================
  // CALCULATE TOTAL
  // =====================================================

  const totalAmount =
    data.items.reduce(
      (
        sum: number,
        item: any
      ) =>
        sum +
        Number(item.quantity) *
          Number(
            item.sellingPrice
          ),
      0
    );

  const discount =
    Math.max(
      0,
      Number(
        data.discount || 0
      )
    );

  const grandTotal =
    Math.max(
      0,
      totalAmount - discount
    );

  // =====================================================
  // PAYMENT
  // =====================================================

  const paymentMethod =
    String(
      data.paymentMethod ||
        "CASH"
    ).trim() || "CASH";

  const paidAmount =
    Math.max(
      0,
      Math.min(
        Number(
          data.paidAmount || 0
        ),
        grandTotal
      )
    );

  const dueAmount =
    Math.max(
      0,
      grandTotal - paidAmount
    );

  // =====================================================
  // BILL NUMBER
  // =====================================================

  const invoiceNumber =
    await getNextBillNumber();

  // =====================================================
  // CREATE SALE + STOCK + CASH BOOK
  // =====================================================

  const sale =
    await prisma.$transaction(
      async (tx) => {
        const sale =
          await tx.sale.create({
            data: {
              invoiceNumber,

              customerId:
                data.customerId ||
                null,

              totalAmount,

              discount,

              grandTotal,

              paymentMethod,

              paidAmount,

              dueAmount,
            },
          });

        // =================================================
        // SALE ITEMS + STOCK REDUCTION
        // =================================================

        for (
          const item of data.items
        ) {
          const quantity =
            Number(
              item.quantity
            );

          const sellingPrice =
            Number(
              item.sellingPrice
            );

          const total =
            quantity *
            sellingPrice;

          await tx.saleItem.create({
            data: {
              saleId:
                sale.id,

              inventoryId:
                item.inventoryId,

              quantity,

              sellingPrice,

              total,
            },
          });

          const stockUpdate =
            await tx.inventory.updateMany({
              where: {
                id:
                  item.inventoryId,

                quantity: {
                  gte: quantity,
                },
              },

              data: {
                quantity: {
                  decrement:
                    quantity,
                },
              },
            });

          if (
            stockUpdate.count !== 1
          ) {
            throw new Error(
              "Stock changed during the sale. Please try again."
            );
          }
        }

        // =================================================
        // CASH BOOK
        //
        // Only actual money received goes into Cash Book.
        // Credit sale / unpaid amount does not.
        // =================================================

        if (paidAmount > 0) {
          await tx.cashBook.create({
            data: {
              particulars:
                `Sales Payment - ${invoiceNumber} (${paymentMethod})`,

              debit: 0,

              credit:
                paidAmount,

              balance: 0,
            },
          });
        }

        // =================================================
        // RETURN COMPLETE SALE
        // =================================================

        return tx.sale.findUnique({
          where: {
            id: sale.id,
          },

          include: {
            customer: true,

            items: {
              include: {
                inventory: true,
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

  return sale;
}

// =====================================================
// RECEIVE ADDITIONAL SALE PAYMENT
// =====================================================

export async function receiveSalePayment(
  saleId: string,
  data: {
    amount: number;
    method: string;
    remarks?: string;
  }
) {
  const amount =
    Number(data.amount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than 0."
    );
  }

  const method =
    String(
      data.method ||
        "CASH"
    ).trim() || "CASH";

  const updatedSale =
    await prisma.$transaction(
      async (tx) => {
        const sale =
          await tx.sale.findUnique({
            where: {
              id: saleId,
            },

            include: {
              customer: true,
            },
          });

        if (!sale) {
          throw new Error(
            "Sale not found."
          );
        }

        const currentPaid =
          Number(
            sale.paidAmount || 0
          );

        const currentDue =
          Math.max(
            0,
            Number(
              sale.grandTotal || 0
            ) - currentPaid
          );

        if (currentDue <= 0) {
          throw new Error(
            "This sale is already fully paid."
          );
        }

        if (amount > currentDue) {
          throw new Error(
            `Payment exceeds outstanding amount. Outstanding: Rs. ${currentDue.toFixed(
              2
            )}`
          );
        }

        const newPaid =
          currentPaid +
          amount;

        const newDue =
          Math.max(
            0,
            Number(
              sale.grandTotal || 0
            ) - newPaid
          );

        const updatedSale =
          await tx.sale.update({
            where: {
              id: saleId,
            },

            data: {
              paidAmount:
                newPaid,

              dueAmount:
                newDue,

              paymentMethod:
                method,
            },

            include: {
              customer: true,

              items: {
                include: {
                  inventory: true,
                },
              },
            },
          });

                // =================================================
        // CASH BOOK
        // =================================================

        await tx.cashBook.create({
          data: {
            particulars:
              `Sales Payment - ${sale.invoiceNumber} (${method})`,

            debit: 0,

            credit: amount,

            balance: 0,
          },
        });

        // =================================================
        // CUSTOMER LEDGER
        //
        // Record the actual payment once.
        //
        // The payment is not split according to invoice
        // allocation because this function is already
        // paying a specific sale.
        // =================================================

        if (sale.customerId) {
          await tx.customerLedger.create({
            data: {
              customerId:
                sale.customerId,

              repairJobId:
                null,

              particulars:
                `Sales Payment - ${sale.invoiceNumber} (${method})`,

              debit:
                0,

              credit:
                amount,

              balance:
                0,

              createdAt:
                new Date(),
            },
          });
        }

               return updatedSale;
      }
    );

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return updatedSale;
}

// =====================================================
// GET SALES
// =====================================================

export async function getSales() {
  return prisma.sale.findMany({
    include: {
      customer: true,

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
// GET ONE SALE
// =====================================================

export async function getSale(
  id: string
) {
  return prisma.sale.findUnique({
    where: {
      id,
    },

    include: {
      customer: true,

      items: {
        include: {
          inventory: true,
        },
      },
    },
  });
}

// =====================================================
// UPDATE SALE
// =====================================================

export async function updateSale(
  id: string,
  data: any
) {
  const updatedSale =
    await prisma.sale.update({
      where: {
        id,
      },

      data: {
        customerId:
          data.customerId,

        totalAmount:
          Number(
            data.totalAmount || 0
          ),

        discount:
          Number(
            data.discount || 0
          ),

        grandTotal:
          Number(
            data.grandTotal || 0
          ),

        paymentMethod:
          data.paymentMethod,

        paidAmount:
          Number(
            data.paidAmount || 0
          ),

        dueAmount:
          Number(
            data.dueAmount || 0
          ),
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return updatedSale;
}

// =====================================================
// DELETE SALE
// =====================================================

export async function deleteSale(
  id: string
) {
  throw new Error(
    "Sales cannot be deleted. Use Sales Return instead."
  );
}