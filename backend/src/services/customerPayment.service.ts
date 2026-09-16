import { prisma } from "../config/prisma";

// =====================================================
// RECEIVE CUSTOMER PAYMENT
//
// Payment is automatically allocated oldest outstanding
// Sale / Repair Job first.
// =====================================================

export async function createCustomerPayment(
  data: {
    customerId: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
  }
) {
  const amount = Number(data.amount);

  if (!data.customerId) {
    throw new Error("Customer is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(
      "Payment amount must be greater than zero."
    );
  }

  return prisma.$transaction(async (tx) => {
    // ===================================================
    // FIND CUSTOMER
    // ===================================================

    const customer =
      await tx.customer.findUnique({
        where: {
          id: data.customerId,
        },
      });

    if (!customer) {
      throw new Error("Customer not found.");
    }

    // ===================================================
    // PAYMENT DATE
    // ===================================================

    const paymentDate = data.paymentDate
      ? new Date(
          `${data.paymentDate}T${new Date()
            .toTimeString()
            .slice(0, 8)}`
        )
      : new Date();

    const paymentMethod =
      String(
        data.paymentMethod || "CASH"
      ).trim() || "CASH";

    const remarks =
      data.remarks?.trim() || undefined;

    // ===================================================
    // GET OUTSTANDING SALES
    // ===================================================

    const sales =
      await tx.sale.findMany({
        where: {
          customerId: data.customerId,
        },
        orderBy: {
          saleDate: "asc",
        },
      });

    // ===================================================
    // GET OUTSTANDING REPAIR JOBS
    // ===================================================

    const repairs =
      await tx.repairJob.findMany({
        where: {
          customerId: data.customerId,
          balanceAmount: {
            gt: 0,
          },
        },
        orderBy: {
          receivedDate: "asc",
        },
      });

    // ===================================================
    // COMBINE SALES + REPAIRS
    // OLDEST TRANSACTION FIRST
    // ===================================================

    const outstandingTransactions = [
      ...sales
        .map((sale) => ({
          type: "SALE" as const,
          id: sale.id,
          date:
            sale.saleDate ||
            sale.createdAt,
          due: Math.max(
            0,
            Number(
              sale.grandTotal || 0
            ) -
              Number(
                sale.paidAmount || 0
              )
          ),
        }))
        .filter(
          (item) => item.due > 0
        ),

      ...repairs.map((repair) => ({
        type: "REPAIR" as const,
        id: repair.id,
        date:
          repair.receivedDate ||
          repair.createdAt,
        due: Math.max(
          0,
          Number(
            repair.balanceAmount || 0
          )
        ),
      })),
    ].sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    );

    // ===================================================
    // TOTAL OUTSTANDING
    // ===================================================

    const totalOutstanding =
      outstandingTransactions.reduce(
        (sum, item) =>
          sum + item.due,
        0
      );

    if (totalOutstanding <= 0) {
      throw new Error(
        "There is no outstanding balance."
      );
    }

    if (amount > totalOutstanding) {
      throw new Error(
        `Payment cannot exceed outstanding balance of Rs. ${totalOutstanding.toFixed(
          2
        )}.`
      );
    }

    // ===================================================
    // ALLOCATE PAYMENT
    // ===================================================

    let remainingAmount = amount;

    const allocations: any[] = [];

    for (const transaction of outstandingTransactions) {
      if (remainingAmount <= 0) {
        break;
      }

      const allocatedAmount =
        Math.min(
          remainingAmount,
          transaction.due
        );

      if (allocatedAmount <= 0) {
        continue;
      }

      // ================================================
      // SALE PAYMENT
      // ================================================

      if (transaction.type === "SALE") {
        const sale =
          await tx.sale.findUnique({
            where: {
              id: transaction.id,
            },
          });

        if (!sale) {
          throw new Error(
            "Sale not found during payment allocation."
          );
        }

        const currentPaid =
          Number(
            sale.paidAmount || 0
          );

        const newPaid =
          currentPaid +
          allocatedAmount;

        const newDue =
          Math.max(
            0,
            Number(
              sale.grandTotal || 0
            ) - newPaid
          );

        await tx.sale.update({
          where: {
            id: sale.id,
          },
          data: {
            paidAmount: newPaid,
            dueAmount: newDue,
            paymentMethod,
          },
        });

        allocations.push({
          type: "SALE",
          reference:
            sale.invoiceNumber,
          amount: allocatedAmount,
        });
      }

      // ================================================
      // REPAIR PAYMENT
      // ================================================

      if (
        transaction.type ===
        "REPAIR"
      ) {
        const repair =
          await tx.repairJob.findUnique({
            where: {
              id: transaction.id,
            },
          });

        if (!repair) {
          throw new Error(
            "Repair job not found during payment allocation."
          );
        }

        const currentBalance =
          Math.max(
            0,
            Number(
              repair.balanceAmount || 0
            )
          );

        const newBalance =
          Math.max(
            0,
            currentBalance -
              allocatedAmount
          );

        await tx.payment.create({
          data: {
            repairJobId:
              repair.id,
            amount:
              allocatedAmount,
            paymentMode:
              paymentMethod,
            remarks,
            createdAt:
              paymentDate,
          },
        });

        await tx.repairJob.update({
          where: {
            id: repair.id,
          },
          data: {
            balanceAmount:
              newBalance,
          },
        });

        allocations.push({
          type: "REPAIR",
          reference:
            repair.jobNumber,
          amount: allocatedAmount,
        });
      }

      remainingAmount -=
        allocatedAmount;
    }

    // ===================================================
    // CASH BOOK
    // ===================================================

    await tx.cashBook.create({
      data: {
        particulars:
          `Customer Payment - ${customer.fullName} - ${paymentMethod}`,
        debit: 0,
        credit: amount,
        balance: 0,
        createdAt: paymentDate,
      },
    });

    // ===================================================
    // RETURN ALLOCATION RESULT
    // ===================================================

    return {
      success: true,
      message:
        "Customer payment received and allocated successfully.",
      amount,
      allocations,
    };
  });
}