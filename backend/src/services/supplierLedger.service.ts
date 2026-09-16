import { prisma } from "../config/prisma";

export async function getSupplierLedger(
  supplierId: string
) {
  // =====================================================
  // PURCHASES
  // =====================================================

  const purchases =
    await prisma.purchase.findMany({
      where: {
        supplierId,
      },

      orderBy: {
        purchaseDate: "asc",
      },
    });

  // =====================================================
  // LATER SUPPLIER PAYMENTS
  // =====================================================

  const payments =
    await prisma.supplierPayment.findMany({
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

  const ledger: any[] = [];

  // =====================================================
  // PURCHASE ENTRIES
  // =====================================================

  for (const purchase of purchases) {
    const totalAmount =
      Number(
        purchase.totalAmount || 0
      );

    const paidAmount =
      Number(
        purchase.paidAmount || 0
      );

    // ---------------------------------------------
    // PURCHASE = DEBIT
    // ---------------------------------------------

    ledger.push({
      id:
        `${purchase.id}-purchase`,

      date:
        purchase.purchaseDate,

      purchaseNumber:
        purchase.purchaseNumber,

      particulars:
        "Purchase",

      debit:
        totalAmount,

      credit: 0,
    });

    // ---------------------------------------------
    // PAYMENT MADE AT PURCHASE = CREDIT
    // ---------------------------------------------

    if (paidAmount > 0) {
      ledger.push({
        id:
          `${purchase.id}-paid`,

        date:
          purchase.purchaseDate,

        purchaseNumber:
          purchase.purchaseNumber,

        particulars:
          `Payment (${purchase.paymentMethod || "CASH"})`,

        debit: 0,

        credit:
          paidAmount,
      });
    }
  }

  // =====================================================
  // LATER SUPPLIER PAYMENTS = CREDIT
  // =====================================================

  for (const payment of payments) {
    ledger.push({
      id:
        `${payment.id}-payment`,

      date:
        payment.paymentDate,

      purchaseNumber:
        payment.purchase
          ?.purchaseNumber || "-",

      particulars:
        `Payment (${payment.paymentMethod || "CASH"})`,

      debit: 0,

      credit:
        Number(
          payment.amount || 0
        ),
    });
  }

  // =====================================================
  // PURCHASE RETURNS
  // =====================================================
  //
  // Supplier Credit → CREDIT
  // Cash Refund    → no supplier credit
  //
  // Cash Refund is already recorded in Cash Book
  // as Cash In, so it must not create a supplier
  // credit in the Supplier Ledger.
  // =====================================================

  const purchaseReturns =
    await prisma.purchaseReturn.findMany({
      where: {
        supplierId,
      },

      orderBy: {
        returnDate: "asc",
      },
    });

  for (const purchaseReturn of purchaseReturns) {
    if (
      purchaseReturn.refundMethod ===
      "CASH_REFUND"
    ) {
      continue;
    }

    const returnAmount =
      Math.max(
        0,
        Number(
          purchaseReturn.refundAmount ??
            purchaseReturn.totalAmount ??
            0
        )
      );

    if (returnAmount <= 0) {
      continue;
    }

    ledger.push({
      id:
        `${purchaseReturn.id}-return`,

      date:
        purchaseReturn.returnDate,

      purchaseNumber:
        "-",

      particulars:
        `Purchase Return - ${purchaseReturn.returnNumber}`,

      debit: 0,

      credit:
        returnAmount,
    });
  }

  // =====================================================
  // SORT ALL TRANSACTIONS BY DATE
  // =====================================================

  ledger.sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime()
  );

  // =====================================================
  // RUNNING BALANCE
  // =====================================================

  let balance = 0;

  return ledger.map(
    (entry) => {
      balance +=
        Number(
          entry.debit || 0
        ) -
        Number(
          entry.credit || 0
        );

      return {
        ...entry,
        balance,
      };
    }
  );
}

// =====================================================
// DETAILED SUPPLIER LEDGER
// =====================================================

export async function getSupplierDetailedLedger(
  supplierId: string
) {
  const purchases =
    await prisma.purchase.findMany({
      where: {
        supplierId,
      },

      include: {
        items: {
          include: {
            inventory: true,
          },
        },

        payments: true,
      },

      orderBy: {
        purchaseDate: "asc",
      },
    });

  const supplierPayments =
    await prisma.supplierPayment.findMany({
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

  return {
    purchases,
    supplierPayments,
  };
}