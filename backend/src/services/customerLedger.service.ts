import { prisma } from "../config/prisma";

export async function getCustomerLedger(
  customerId: string
) {
  // =====================================================
  // 1. GET REPAIR JOBS
  //
  // Repair financial information comes from the
  // actual Repair Job and Payment tables.
  //
  // This makes the Customer Ledger match
  // RepairJobDetailsPage.
  // =====================================================

  const repairs =
    await prisma.repairJob.findMany({
      where: {
        customerId,
      },
      include: {
        payments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        receivedDate: "asc",
      },
    });

  // =====================================================
  // 2. GET EXISTING NON-REPAIR CUSTOMER LEDGER ENTRIES
  //
  // Keep any customer ledger entries which are not
  // connected to a repair job.
  //
  // Existing repair ledger entries are NOT used here,
  // because we rebuild repair transactions from the
  // actual Repair Job financial data.
  // =====================================================

  const otherLedgerEntries =
    await prisma.customerLedger.findMany({
      where: {
        customerId,
        repairJobId: null,
      },
      include: {
        repairJob: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  // =====================================================
  // 3. BUILD REPAIR LEDGER
  //
  // Repair Bill       → DEBIT
  // Discount          → CREDIT
  // Original Advance  → CREDIT
  // Additional Payment → CREDIT
  // =====================================================

  const repairLedger: any[] = [];

  for (const repair of repairs) {
      const totalAmount =
      Math.max(
      0,
      Number(repair.estimatedCost ?? 0) +
      Number(repair.diagnosisFee ?? 0) +
      Number(repair.labourCharge ?? 0)
     );

    const discount =
      Math.max(
        0,
        Number(repair.discount ?? 0)
      );

    const advanceAmount =
      Math.max(
        0,
        Number(repair.advanceAmount ?? 0)
      );

    // ===================================================
    // REPAIR BILL / ESTIMATE → DEBIT
    // ===================================================

    if (totalAmount > 0) {
      repairLedger.push({
        id:
          `repair-estimate-${repair.id}`,

        customerId:
          repair.customerId,

        repairJobId:
          repair.id,

        particulars:
          `Estimate - ${repair.jobNumber}`,

       debit:
       Math.max(
       0,
       totalAmount - discount
       ),

        credit:
          0,

        balance:
          0,

        createdAt:
          repair.receivedDate ??
          repair.createdAt,

        repairJob:
          repair,
      });
    }

    // ===================================================
    // ORIGINAL ADVANCE → CREDIT
    //
    // advanceAmount belongs to the Repair Job.
    // It is NOT part of the payment table.
    // ===================================================

    if (advanceAmount > 0) {
      repairLedger.push({
        id:
          `repair-advance-${repair.id}`,

        customerId:
          repair.customerId,

        repairJobId:
          repair.id,

        particulars:
          `Repair Advance - ${repair.jobNumber}`,

        debit:
          0,

        credit:
          advanceAmount,

        balance:
          0,

        createdAt:
          repair.receivedDate ??
          repair.createdAt,

        repairJob:
          repair,
      });
    }

    // ===================================================
    // ADDITIONAL PAYMENTS → CREDIT
    //
    // These already exist in payment.service.ts.
    // We read them here instead of reading the old
    // customerLedger payment entries.
    //
    // IMPORTANT:
    // We do NOT create payment records here.
    // ===================================================

    for (const payment of repair.payments) {
      const paymentAmount =
        Math.max(
          0,
          Number(payment.amount ?? 0)
        );

      if (paymentAmount <= 0) {
        continue;
      }

      repairLedger.push({
        id:
          `repair-payment-${payment.id}`,

        customerId:
          repair.customerId,

        repairJobId:
          repair.id,

        particulars:
          `Repair Payment (${payment.paymentMode})`,

        debit:
          0,

        credit:
          paymentAmount,

        balance:
          0,

        createdAt:
          payment.createdAt,

        repairJob:
          repair,

        payment: {
          id:
            payment.id,

          amount:
            paymentAmount,

          paymentMode:
            payment.paymentMode,

          remarks:
            payment.remarks,
        },
      });
    }
  }

  // =====================================================
  // 4. CUSTOMER SALES
  // =====================================================

  const sales =
    await prisma.sale.findMany({
      where: {
        customerId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  // =====================================================
  // 5. CONVERT SALES INTO LEDGER ENTRIES
  // =====================================================

  const salesLedger: any[] = [];

  for (const sale of sales) {
    // ---------------------------------------------------
    // SALES INVOICE → DEBIT
    // ---------------------------------------------------

    salesLedger.push({
      id:
        `sale-${sale.id}`,

      customerId:
        sale.customerId,

      repairJobId:
        null,

      particulars:
        `Sales Invoice - ${sale.invoiceNumber}`,

      debit:
        Number(
          sale.grandTotal ?? 0
        ),

      credit:
        0,

      balance:
        0,

      createdAt:
        sale.saleDate ??
        sale.createdAt,

      sale: {
        id:
          sale.id,

        invoiceNumber:
          sale.invoiceNumber,
      },
    });

    // ---------------------------------------------------
    // SALES PAYMENT → CREDIT
    //
    // Sale model stores the current total paid amount.
    // ---------------------------------------------------

    const paidAmount =
      Math.max(
        0,
        Number(
          sale.paidAmount ?? 0
        )
      );

    if (paidAmount > 0) {
      salesLedger.push({
        id:
          `sale-payment-${sale.id}`,

        customerId:
          sale.customerId,

        repairJobId:
          null,

        particulars:
          `Sales Payment - ${sale.invoiceNumber}`,

        debit:
          0,

        credit:
          paidAmount,

        balance:
          0,

        createdAt:
          sale.createdAt,

        sale: {
          id:
            sale.id,

          invoiceNumber:
            sale.invoiceNumber,
        },
      });
    }
  }
  // =====================================================
  // 6. CUSTOMER SALES RETURNS
  //
  // Sales Return → CREDIT
  //
  // A Sales Return reduces the customer's balance.
  // The original Sale remains unchanged.
  // =====================================================

  const salesReturns =
    await prisma.salesReturn.findMany({
      where: {
        customerId,
      },
      orderBy: {
        returnDate: "asc",
      },
    });

  const salesReturnLedger: any[] = [];

   for (const salesReturn of salesReturns) {
    const returnAmount =
      Math.max(
        0,
        Number(
          salesReturn.refundAmount ??
            salesReturn.totalAmount ??
            0
        )
      );

    // Customer Credit reduces the customer's balance.
    // Cash Refund is already recorded in Cash Book and
    // must NOT create a customer credit.
    if (
      returnAmount <= 0 ||
      salesReturn.refundMethod === "CASH_REFUND"
    ) {
      continue;
    }

    salesReturnLedger.push({
      id:
        `sales-return-${salesReturn.id}`,

      customerId:
        salesReturn.customerId,

      repairJobId:
        null,

      particulars:
        `Sales Return - ${salesReturn.returnNumber}`,

      debit:
        0,

      credit:
        returnAmount,

      balance:
        0,

      createdAt:
        salesReturn.returnDate ??
        salesReturn.createdAt,

      salesReturn: {
        id:
          salesReturn.id,

        returnNumber:
          salesReturn.returnNumber,

        saleId:
          salesReturn.saleId,

        refundMethod:
          salesReturn.refundMethod,
      },
    });
  }

  // =====================================================
  // 7. COMBINE ALL TRANSACTIONS
  // =====================================================

  const combinedLedger = [
    ...otherLedgerEntries,
    ...repairLedger,
    ...salesLedger,
    ...salesReturnLedger,
  ];

  // =====================================================
  // 7. SORT BY DATE
  // =====================================================

  const getLedgerTransactionOrder = (item: any) => {
  const particulars =
    String(item.particulars || "").toLowerCase();

  if (particulars.startsWith("sales invoice")) {
    return 1;
  }

  if (particulars.startsWith("sales payment")) {
    return 2;
  }

  return 0;
};
  combinedLedger.sort(
    (a: any, b: any) => {
      const dateDifference =
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime();

    if (dateDifference !== 0) {
  return dateDifference;
}

  return (
  getLedgerTransactionOrder(a) -
  getLedgerTransactionOrder(b)
  );
    }
  );

  // =====================================================
  // 8. CALCULATE RUNNING BALANCE
  //
  // Balance = Debit - Credit
  // =====================================================

  let runningBalance = 0;

  return combinedLedger.map(
    (item: any) => {
      runningBalance +=
        Number(item.debit ?? 0) -
        Number(item.credit ?? 0);

      return {
        ...item,

        balance:
          runningBalance,
      };
    }
  );
}

// =========================================================
// DETAILED CUSTOMER LEDGER
// =========================================================

export async function getCustomerDetailedLedger(
  customerId: string
) {
  const repairs =
    await prisma.repairJob.findMany({
      where: {
        customerId,
      },
      include: {
        parts: {
          include: {
            inventory: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        payments: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        receivedDate: "asc",
      },
    });

  const sales =
    await prisma.sale.findMany({
      where: {
        customerId,
      },
      include: {
        items: {
          include: {
            inventory: true,
          },
        },
      },
      orderBy: {
        saleDate: "asc",
      },
    });

  return {
    repairs,
    sales,
  };
}