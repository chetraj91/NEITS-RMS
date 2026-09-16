import { prisma } from "../config/prisma";

// =====================================================
// MAKE SUPPLIER PAYMENT
// =====================================================

export async function createSupplierPayment(
  data: {
    supplierId: string;
    purchaseId?: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
  }
) {
  const amount = Number(data.amount);

  if (!data.supplierId) {
    throw new Error(
      "Supplier is required."
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Payment amount must be greater than zero."
    );
  }

  return prisma.$transaction(
    async (tx) => {
      // ==========================================
      // FIND SUPPLIER
      // ==========================================

      const supplier =
        await tx.supplier.findUnique({
          where: {
            id: data.supplierId,
          },
        });

      if (!supplier) {
        throw new Error(
          "Supplier not found."
        );
      }

      // ==========================================
      // CALCULATE CURRENT OUTSTANDING
      // ==========================================

      const purchases =
        await tx.purchase.findMany({
          where: {
            supplierId:
              data.supplierId,
          },

          select: {
            totalAmount: true,
            paidAmount: true,
          },
        });

      const totalPurchases =
        purchases.reduce(
          (sum, purchase) =>
            sum +
            Number(
              purchase.totalAmount || 0
            ),
          0
        );

      const originalPayments =
        purchases.reduce(
          (sum, purchase) =>
            sum +
            Number(
              purchase.paidAmount || 0
            ),
          0
        );

      const laterPayments =
        await tx.supplierPayment.aggregate(
          {
            where: {
              supplierId:
                data.supplierId,
            },
            _sum: {
              amount: true,
            },
          }
        );

      const existingLaterPayments =
        Number(
          laterPayments._sum.amount ||
            0
        );

      const currentOutstanding =
        Math.max(
          0,
          totalPurchases -
            originalPayments -
            existingLaterPayments
        );

      // ==========================================
      // PREVENT OVERPAYMENT
      // ==========================================

      if (
        amount >
        currentOutstanding
      ) {
        throw new Error(
          `Payment exceeds supplier outstanding amount. Outstanding: Rs. ${currentOutstanding.toFixed(
            2
          )}`
        );
      }

      // ==========================================
      // CREATE SUPPLIER PAYMENT
      // ==========================================

      const payment =
        await tx.supplierPayment.create({
          data: {
            supplierId:
              data.supplierId,

            purchaseId:
              data.purchaseId ||
              null,

            paymentDate:
              data.paymentDate
                ? new Date(
                    data.paymentDate
                  )
                : new Date(),

            amount,

            paymentMethod:
              data.paymentMethod ||
              "CASH",

            remarks:
              data.remarks?.trim() ||
              null,
          },
        });

      // ==========================================
      // CASH BOOK OUT
      // ==========================================

    await tx.cashBook.create({
      data: {
      particulars:
      `Supplier Payment - ${supplier.companyName} (${data.paymentMethod || "CASH"})`,

       debit:
       amount,

      credit: 0,

      balance: 0,
      }, 
      });

      return payment;
    }
  );
}

// =====================================================
// GET SUPPLIER PAYMENT HISTORY
// =====================================================

export async function getSupplierPayments(
  supplierId: string
) {
  return prisma.supplierPayment.findMany({
    where: {
      supplierId,
    },

    include: {
      purchase: true,
    },

    orderBy: {
      paymentDate: "asc",
    },
  });
}