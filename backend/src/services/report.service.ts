import { prisma } from "../config/prisma";

function dateFilter(
  fromDate?: string,
  toDate?: string
) {
  if (!fromDate && !toDate) {
    return undefined;
  }

  return {
    ...(fromDate
      ? {
          gte: new Date(
            `${fromDate}T00:00:00`
          ),
        }
      : {}),

    ...(toDate
      ? {
          lte: new Date(
            `${toDate}T23:59:59.999`
          ),
        }
      : {}),
  };
}

export async function getDashboardReport(
  fromDate?: string,
  toDate?: string,
  paymentType?: string,
  paymentMethod?: string,
  customerId?: string,
  supplierId?: string
) {

  // =====================================================
  // DATE FILTERS
  // =====================================================

  const saleDateFilter =
    dateFilter(
      fromDate,
      toDate
    );

  const purchaseDateFilter =
    dateFilter(
      fromDate,
      toDate
    );

  const expenseDateFilter =
    dateFilter(
      fromDate,
      toDate
    );

  const repairPaymentDateFilter =
    dateFilter(
      fromDate,
      toDate
    );

  const cashBookDateFilter =
    dateFilter(
      fromDate,
      toDate
    );

  // =====================================================
  // SALES
  // =====================================================

  const sales =
    await prisma.sale.aggregate({
      where: {
        ...(saleDateFilter
          ? {
              saleDate:
                saleDateFilter,
            }
          : {}),
      },

      _sum: {
        grandTotal: true,
        paidAmount: true,
        dueAmount: true,
      },

      _count: {
        _all: true,
      },
    });

  const grossSales =
    sales._sum.grandTotal ?? 0;

  const salesReceived =
    sales._sum.paidAmount ?? 0;

  const originalSalesDue =
    sales._sum.dueAmount ?? 0;

  const totalSalesInvoices =
    sales._count._all;

  // =====================================================
  // SALES RETURNS
  //
  // Original Sale records remain unchanged.
  // Therefore Sales Returns are deducted separately
  // from the Sales Report.
  // =====================================================

  const salesReturns =
    await prisma.salesReturn.aggregate({
      where: {
        ...(saleDateFilter
          ? {
              returnDate:
                saleDateFilter,
            }
          : {}),
      },

      _sum: {
        totalAmount: true,
        refundAmount: true,
      },
    });

  const totalSalesReturns =
    salesReturns._sum.totalAmount ?? 0;

  // Net sales after Sales Returns
  const totalSales =
    Math.max(
      0,
      grossSales -
        totalSalesReturns
    );

  // Customer outstanding after Sales Returns
  const salesDue =
    Math.max(
      0,
      originalSalesDue -
        totalSalesReturns
    );

   // =====================================================
  // PURCHASES
  // =====================================================

  const purchases =
    await prisma.purchase.aggregate({
      where: {
        ...(purchaseDateFilter
          ? {
              purchaseDate:
                purchaseDateFilter,
            }
          : {}),
      },

      _sum: {
        totalAmount: true,
        paidAmount: true,
      },

      _count: {
        _all: true,
      },
    });

  const grossPurchases =
    purchases._sum.totalAmount ?? 0;

  // =====================================================
  // PURCHASE RETURNS
  //
  // Original Purchase records remain unchanged.
  // Purchase Returns are deducted separately.
  // =====================================================

  const purchaseReturns =
    await prisma.purchaseReturn.aggregate({
      where: {
        ...(purchaseDateFilter
          ? {
              returnDate:
                purchaseDateFilter,
            }
          : {}),
      },

      _sum: {
        totalAmount: true,
        refundAmount: true,
      },
    });

  const totalPurchaseReturns =
    purchaseReturns._sum.totalAmount ?? 0;

  // Net purchases after Purchase Returns
  const totalPurchases =
    Math.max(
      0,
      grossPurchases -
        totalPurchaseReturns
    );

  // Initial payments made when the purchase was created
  const initialPurchasePaid =
    purchases._sum.paidAmount ?? 0;

  // Later payments made through Supplier Payment
  const supplierPayments =
    await prisma.supplierPayment.aggregate({
      where: {
        ...(purchaseDateFilter
          ? {
              paymentDate:
                purchaseDateFilter,
            }
          : {}),
      },

      _sum: {
        amount: true,
      },
    });

  const laterSupplierPayments =
    supplierPayments._sum.amount ?? 0;

  // Total amount paid to suppliers
  const purchasePaid =
    initialPurchasePaid +
    laterSupplierPayments;

  // Current supplier outstanding
  const supplierDue =
    Math.max(
      0,
      totalPurchases -
        purchasePaid
    );

  const totalPurchasesCount =
    purchases._count._all;

// =====================================================
// REPAIR PAYMENTS / CUSTOMER DUE
// =====================================================

const repairJobs =
  await prisma.repairJob.findMany({
    where: {
      ...(repairPaymentDateFilter
        ? {
            receivedDate:
              repairPaymentDateFilter,
          }
        : {}),
    },

    select: {
      id: true,
     customerId: true,
      totalAmount: true,
      discount: true,
      advanceAmount: true,
    },
  });

const totalRepairJobs =
  repairJobs.length;

// =====================================================
// REPAIR CHARGES AFTER DISCOUNT
// =====================================================

const repairCharges =
  repairJobs.reduce(
    (sum, job) => {
      const totalAmount =
        Number(
          job.totalAmount ?? 0
        );

      const discount =
        Number(
          job.discount ?? 0
        );

      const finalAmount =
        Math.max(
          0,
          totalAmount - discount
        );

      return sum + finalAmount;
    },
    0
  );

// =====================================================
// REPAIR PAYMENTS
// =====================================================

const repairJobIds =
  repairJobs.map(
    (job) => job.id
  );

let repairPaymentsReceived = 0;
let repairCustomerDue = 0;

// =====================================================
// CUSTOMER DUE
// =====================================================

// =====================================================
// REPAIR PAYMENTS / CUSTOMER DUE
// =====================================================

if (repairJobIds.length > 0) {
  const repairPayments =
    await prisma.payment.findMany({
      where: {
        repairJobId: {
          in: repairJobIds,
        },
      },

      select: {
        repairJobId: true,
        amount: true,
        paymentMode: true,
      },
    });

  // =====================================================
  // CALCULATE EACH JOB'S DUE INDEPENDENTLY
  // =====================================================

  repairJobs.forEach((job) => {
    const totalAmount =
      Number(
        job.totalAmount ?? 0
      );

    const discount =
      Number(
        job.discount ?? 0
      );

    const finalAmount =
      Math.max(
        0,
        totalAmount - discount
      );

    const advanceAmount =
      Math.max(
        0,
        Number(
          job.advanceAmount ?? 0
        )
      );

    const additionalPayments =
      repairPayments
        .filter(
          (payment) =>
            payment.repairJobId ===
            job.id
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount ?? 0
            ),
          0
        );

    const totalPaid =
      advanceAmount +
      additionalPayments;

    const jobDue =
      Math.max(
        0,
        finalAmount -
          totalPaid
      );

    repairPaymentsReceived +=
      Math.min(
        finalAmount,
        totalPaid
      );

    repairCustomerDue +=
      jobDue;
  });
}

  // =====================================================
  // FILTERED PAYMENT REPORT
  // =====================================================

  let filteredPaymentReceived = 0;
  let filteredPaymentPaid = 0;

  // -----------------------------------------------------
  // PAYMENT RECEIVED - SALES
  // -----------------------------------------------------

  if (
    !paymentType ||
    paymentType === "ALL" ||
    paymentType === "RECEIVED"
  ) {
    const salePaymentWhere: any = {
      ...(saleDateFilter
        ? {
            saleDate:
              saleDateFilter,
          }
        : {}),
      ...(customerId &&
      customerId !== "ALL"
        ? {
            customerId,
          }
        : {}),
    };

    if (
      paymentMethod &&
      paymentMethod !== "ALL"
    ) {
      salePaymentWhere.paymentMethod =
        paymentMethod;
    }

    const salePayments =
      await prisma.sale.findMany({
        where: salePaymentWhere,

        select: {
          paidAmount: true,
          paymentMethod: true,
        },
      });

    filteredPaymentReceived +=
      salePayments.reduce(
        (sum, sale) =>
          sum +
          Number(
            sale.paidAmount ?? 0
          ),
        0
      );
  }

  // -----------------------------------------------------
  // PAYMENT RECEIVED - REPAIRS
  // -----------------------------------------------------

  if (
    (!paymentType ||
      paymentType === "ALL" ||
      paymentType === "RECEIVED") &&
    repairJobIds.length > 0
  ) {
    const filteredRepairPaymentWhere: any = {
      repairJobId: {
        in: repairJobIds,
      },
    };

    if (
      paymentMethod &&
      paymentMethod !== "ALL"
    ) {
      filteredRepairPaymentWhere.paymentMode =
        paymentMethod;
    }

    const filteredRepairPayments =
      await prisma.payment.findMany({
        where:
          filteredRepairPaymentWhere,

        select: {
          amount: true,
          paymentMode: true,
          repairJob: {
            select: {
              customerId: true,
            },
          },
        },
      });

    filteredPaymentReceived +=
      filteredRepairPayments
        .filter(
          (payment) =>
            !customerId ||
            customerId === "ALL" ||
            payment.repairJob.customerId ===
              customerId
        )
        .reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount ?? 0
            ),
          0
        );

    // ---------------------------------------------------
    // REPAIR ADVANCES
    //
    // Repair advances do not currently have their own
    // payment-method field. Therefore they are included
    // only when All Methods is selected.
    // ---------------------------------------------------

    if (
      !paymentMethod ||
      paymentMethod === "ALL"
    ) {
      filteredPaymentReceived +=
        repairJobs
          .filter(
            (job) =>
              !customerId ||
              customerId === "ALL" ||
              job.customerId ===
                customerId
          )
          .reduce(
            (sum, job) =>
              sum +
              Math.max(
                0,
                Number(
                  job.advanceAmount ?? 0
                )
              ),
            0
          );
    }
  }

  // -----------------------------------------------------
  // PAYMENT PAID - SUPPLIERS
  // -----------------------------------------------------

  if (
    !paymentType ||
    paymentType === "ALL" ||
    paymentType === "PAID"
  ) {
    const purchasePaymentWhere: any = {
      ...(purchaseDateFilter
        ? {
            purchaseDate:
              purchaseDateFilter,
          }
        : {}),
    };

    if (
      paymentMethod &&
      paymentMethod !== "ALL"
    ) {
      purchasePaymentWhere.paymentMethod =
        paymentMethod;
    }

    if (
      supplierId &&
      supplierId !== "ALL"
    ) {
      purchasePaymentWhere.supplierId =
        supplierId;
    }

    // Initial payment made when purchase was created
    const initialPurchasePayments =
      await prisma.purchase.aggregate({
        where:
          purchasePaymentWhere,

        _sum: {
          paidAmount: true,
        },
      });

    const initialPaid =
      initialPurchasePayments._sum
        .paidAmount ?? 0;

    // Later payments made through Supplier Payment
    const supplierPaymentWhere: any = {
      ...(purchaseDateFilter
        ? {
            paymentDate:
              purchaseDateFilter,
          }
        : {}),
    };

    if (
      paymentMethod &&
      paymentMethod !== "ALL"
    ) {
      supplierPaymentWhere.paymentMethod =
        paymentMethod;
    }

    if (
      supplierId &&
      supplierId !== "ALL"
    ) {
      supplierPaymentWhere.supplierId =
        supplierId;
    }

    const filteredSupplierPayments =
      await prisma.supplierPayment.aggregate({
        where:
          supplierPaymentWhere,

        _sum: {
          amount: true,
        },
      });

    const laterPaid =
      filteredSupplierPayments._sum
        .amount ?? 0;

    filteredPaymentPaid =
      initialPaid +
      laterPaid;
  }

  // =====================================================
  // EXPENSES
  // =====================================================

  const expenses =
    await prisma.expense.aggregate({
      where: {
        ...(expenseDateFilter
          ? {
              expenseDate:
                expenseDateFilter,
            }
          : {}),
      },

      _sum: {
        amount: true,
      },
    });

  const totalExpenses =
    expenses._sum.amount ?? 0;

  // =====================================================
  // CASH BOOK
  // =====================================================

  const cashBook =
    await prisma.cashBook.aggregate({
      where: {
        ...(cashBookDateFilter
          ? {
              createdAt:
                cashBookDateFilter,
            }
          : {}),
      },

      _sum: {
        credit: true,
        debit: true,
      },
    });

  const cashIn =
    cashBook._sum.credit ?? 0;

  const cashOut =
    cashBook._sum.debit ?? 0;

  const netCash =
    cashIn - cashOut;

  // =====================================================
  // COUNTS
  // =====================================================

  const totalCustomers =
    await prisma.customer.count();

  const totalInventory =
    await prisma.inventory.count();

  // =====================================================
  // BUSINESS SUMMARY
  // =====================================================

  const totalIncome =
    totalSales +
    repairCharges;

  const netResult =
    totalIncome -
    totalPurchases -
    totalExpenses;

  // =====================================================
  // RETURN
  // =====================================================

  return {
    sales: {
      totalSales,
      received: salesReceived,
      due: salesDue,
      invoiceCount:
        totalSalesInvoices,
    },

    purchases: {
      totalPurchases,
      paid: purchasePaid,
      due: supplierDue,
      purchaseCount:
        totalPurchasesCount,
    },

    repairs: {
      charges: repairCharges,
      paymentsReceived:
        repairPaymentsReceived,
      due:
        repairCustomerDue,
      jobCount:
        totalRepairJobs,
    },

        payments: {
      received:
        filteredPaymentReceived,
      paid:
        filteredPaymentPaid,
    },

    expenses: {
      total: totalExpenses,
    },

    cash: {
      in: cashIn,
      out: cashOut,
      net: netCash,
    },

    summary: {
      totalIncome,
      totalPurchases,
      totalExpenses,
      netResult,
    },

    totalCustomers,
    totalInventory,
  };
}