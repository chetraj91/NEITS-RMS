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
  // Sales return amounts must only reduce the due of their
  // corresponding sale, not the overall customer due.
  const salesDue = originalSalesDue;
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

    const supplierPurchaseTotals =
    await prisma.purchase.groupBy({
      by: ["supplierId"],
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
    });

  const supplierPaymentTotals =
    await prisma.supplierPayment.groupBy({
      by: ["supplierId"],
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

  const supplierCreditReturnTotals =
    await prisma.purchaseReturn.groupBy({
      by: ["supplierId"],
      where: {
        ...(purchaseDateFilter
          ? {
              returnDate:
                purchaseDateFilter,
            }
          : {}),
        refundMethod:
          "SUPPLIER_CREDIT",
      },
      _sum: {
        totalAmount: true,
      },
    });

  const supplierIds =
    new Set<string>();

  supplierPurchaseTotals.forEach(
    (supplier) =>
      supplierIds.add(
        supplier.supplierId
      )
  );

  supplierPaymentTotals.forEach(
    (supplier) =>
      supplierIds.add(
        supplier.supplierId
      )
  );

  supplierCreditReturnTotals.forEach(
    (supplier) =>
      supplierIds.add(
        supplier.supplierId
      )
  );

  const supplierDueBySupplier =
    new Map<string, number>();

  supplierIds.forEach(
    (supplierId) => {
      const purchaseData =
        supplierPurchaseTotals.find(
          (supplier) =>
            supplier.supplierId ===
            supplierId
        );

      const paymentData =
        supplierPaymentTotals.find(
          (supplier) =>
            supplier.supplierId ===
            supplierId
        );

      const returnData =
        supplierCreditReturnTotals.find(
          (supplier) =>
            supplier.supplierId ===
            supplierId
        );

      const supplierPurchaseTotal =
        Number(
          purchaseData?._sum.totalAmount ??
            0
        );

      const supplierInitialPaid =
        Number(
          purchaseData?._sum.paidAmount ??
            0
        );

      const supplierLaterPaid =
        Number(
          paymentData?._sum.amount ??
            0
        );

      const supplierCreditReturn =
        Number(
          returnData?._sum.totalAmount ??
            0
        );
        

      const supplierDue =
        Math.max(
          0,
          supplierPurchaseTotal -
            supplierInitialPaid -
            supplierLaterPaid -
            supplierCreditReturn
        );

      supplierDueBySupplier.set(
        supplierId,
        supplierDue
      );
    }
  );

  const supplierDue =
    Array.from(
      supplierDueBySupplier.values()
    ).reduce(
      (sum, amount) =>
        sum + amount,
      0
    );

  const totalPurchases =
    Math.max(
      0,
      grossPurchases -
        totalPurchaseReturns
    );

  const purchasePaid =
    Number(
      purchases._sum.paidAmount ?? 0
    ) +
    supplierPaymentTotals.reduce(
      (sum, supplier) =>
        sum +
        Number(
          supplier._sum.amount ?? 0
        ),
      0
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
// REPAIR REFUNDS
// =====================================================

const repairRefunds =
  await prisma.cashBook.aggregate({
    where: {
      ...(cashBookDateFilter
        ? {
            createdAt:
              cashBookDateFilter,
          }
        : {}),
      particulars: {
        startsWith:
          "Repair Refund -",
      },
      debit: {
        gt: 0,
      },
    },

    _sum: {
      debit: true,
    },
  });

const repairRefund =
  Number(
    repairRefunds._sum.debit ?? 0
  );

const netRepairCharges =
  Math.max(
    0,
    repairCharges -
      repairRefund
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
  netRepairCharges;

  const netResult =
    totalIncome -
    totalPurchases -
    totalExpenses;

  // =====================================================
  // RETURN
  // =====================================================

  return {
   sales: {
  grossSales,
  salesReturns:
    totalSalesReturns,
  totalSales,
  received: salesReceived,
  due: salesDue,
  invoiceCount:
    totalSalesInvoices,
},
    purchases: {
    grossPurchases,
    purchaseReturns:
    totalPurchaseReturns,
    totalPurchases,
    paid: purchasePaid,
    due: supplierDue,
    purchaseCount:
    totalPurchasesCount,
    },

    repairs: {
  charges: repairCharges,
  refunds: repairRefund,
  netCharges:
    netRepairCharges,
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

export async function getDueOutstandingReport() {
  // =====================================================
  // CUSTOMER OUTSTANDING
  // =====================================================

  const customers = await prisma.customer.findMany({
    select: {
      id: true,
      fullName: true,
      companyName: true,
      phone: true,

     repairJobs: {
  select: {
    id: true,
    jobNumber: true,
    receivedDate: true,
    estimatedCost: true,
    diagnosisFee: true,
    labourCharge: true,
    discount: true,
    advanceAmount: true,
    balanceAmount: true,

    payments: {
      select: {
        amount: true,
        paymentMode: true,
        createdAt: true,
      },
    },

    repairRefunds: {
      select: {
        amount: true,
        refundMethod: true,
        remarks: true,
        createdAt: true,
      },
    },
  },
},

      sales: {
  select: {
    id: true,
    invoiceNumber: true,
    saleDate: true,
    grandTotal: true,
    paidAmount: true,
    dueAmount: true,
  },
      },
    },
  });

  const repairCashBookPayments =
    await prisma.cashBook.findMany({
      where: {
        credit: {
          gt: 0,
        },
        particulars: {
          startsWith: "Repair Payment -",
        },
      },
      select: {
        particulars: true,
        credit: true,
      },
    });

  const repairCashBookPaymentByJob =
    new Map<string, number>();

  repairCashBookPayments.forEach(
    (payment) => {
      const particulars =
        String(payment.particulars || "");

      const match =
  particulars.match(
    /^Repair Payment - (JOB-\d+)/
  );

      if (!match) {
        return;
      }

      const jobNumber = match[1];

      const current =
        repairCashBookPaymentByJob.get(
          jobNumber
        ) ?? 0;

      repairCashBookPaymentByJob.set(
        jobNumber,
        current +
          Number(payment.credit ?? 0)
      );
    }
  );

    const salesCashBookPayments =
    await prisma.cashBook.findMany({
      where: {
        credit: {
          gt: 0,
        },
        particulars: {
          startsWith: "Sales Payment -",
        },
      },
      select: {
        particulars: true,
        credit: true,
      },
    });

  const salesCashBookPaymentByInvoice =
    new Map<string, number>();

  salesCashBookPayments.forEach(
    (payment) => {
      const particulars =
        String(payment.particulars || "");

      const match =
        particulars.match(
          /^Sales Payment - (BILL-\d+)/
        );

      if (!match) {
        return;
      }

      const invoiceNumber = match[1];

      const current =
        salesCashBookPaymentByInvoice.get(
          invoiceNumber
        ) ?? 0;

      salesCashBookPaymentByInvoice.set(
        invoiceNumber,
        current +
          Number(payment.credit ?? 0)
      );
    }
  );

  const customerCashBookPayments =
    await prisma.cashBook.findMany({
      where: {
        credit: {
          gt: 0,
        },
        particulars: {
          startsWith: "Customer Payment -",
        },
      },
    select: {
  id: true,
  particulars: true,
  credit: true,
  createdAt: true,
},
    });

  const customerCashBookPaymentByName =
    new Map<string, number>();

  customerCashBookPayments.forEach(
    (payment) => {
      const particulars =
        String(payment.particulars || "");

      if (
        !particulars.startsWith(
          "Customer Payment - "
        )
      ) {
        return;
      }

     const customerName =
  particulars
    .replace(
      /^Customer Payment - /,
      ""
    )
    .split(" - ")[0]
    .trim();

      if (!customerName) {
        return;
      }

      const current =
        customerCashBookPaymentByName.get(
          customerName
        ) ?? 0;

      customerCashBookPaymentByName.set(
        customerName,
        current +
          Number(payment.credit ?? 0)
      );
    }
  );

    const customerCashBookPaymentEntriesByName =
    new Map<
      string,
      Array<{
        id: string;
        amount: number;
        paymentMethod: string;
        createdAt: Date;
      }>
    >();

  customerCashBookPayments.forEach(
    (payment) => {
      const particulars =
        String(payment.particulars || "");

      const customerName =
        particulars
          .replace(
            /^Customer Payment - /,
            ""
          )
          .split(" - ")[0]
          .trim();

      if (!customerName) {
        return;
      }

      const paymentMethod =
        particulars
          .split(" - ")
          .pop()
          ?.trim()
          .toUpperCase() || "";

      const existing =
        customerCashBookPaymentEntriesByName.get(
          customerName
        ) ?? [];

      existing.push({
        id: String(payment.id),
        amount: Number(payment.credit ?? 0),
        paymentMethod,
        createdAt: payment.createdAt,
      });

      customerCashBookPaymentEntriesByName.set(
        customerName,
        existing
      );
    }
  );

    const customerCashBookPaymentRemainingById =
    new Map<string, number>();

  customerCashBookPayments.forEach(
    (payment) => {
      customerCashBookPaymentRemainingById.set(
        String(payment.id),
        Number(payment.credit ?? 0)
      );
    }
  );

  const customerPaymentAllocatedToRepairByJob =
    new Map<string, number>();

  customers.forEach((customer) => {
    const customerName =
      String(
        customer.fullName ||
          customer.companyName ||
          ""
      ).trim();

    const customerPayments =
      customerCashBookPaymentEntriesByName.get(
        customerName
      ) ?? [];

    customer.repairJobs.forEach(
      (job) => {
        job.payments.forEach(
          (payment) => {
            const paymentAmount =
              Math.max(
                0,
                Number(payment.amount ?? 0)
              );

            if (paymentAmount <= 0) {
              return;
            }

            const paymentMethod =
              String(
                payment.paymentMode || ""
              )
                .trim()
                .toUpperCase();

            const paymentCreatedAt =
              new Date(
                payment.createdAt
              ).getTime();

            let remainingAllocation =
              paymentAmount;

            for (
              const customerPayment of
                customerPayments
            ) {
              if (
                remainingAllocation <=
                0
              ) {
                break;
              }

              const availableAmount =
                customerCashBookPaymentRemainingById.get(
                  customerPayment.id
                ) ?? 0;

              if (
                availableAmount <= 0
              ) {
                continue;
              }

              if (
                customerPayment.paymentMethod !==
                  paymentMethod ||
                new Date(
                  customerPayment.createdAt
                ).getTime() !==
                  paymentCreatedAt
              ) {
                continue;
              }

              const matchedAmount =
                Math.min(
                  remainingAllocation,
                  availableAmount
                );

              customerCashBookPaymentRemainingById.set(
                customerPayment.id,
                availableAmount -
                  matchedAmount
              );

              const current =
                customerPaymentAllocatedToRepairByJob.get(
                  job.jobNumber
                ) ?? 0;

              customerPaymentAllocatedToRepairByJob.set(
                job.jobNumber,
                current +
                  matchedAmount
              );

              remainingAllocation -=
                matchedAmount;
            }
          }
        );
      }
    );
  });

  const salesReturns =
    await prisma.salesReturn.findMany({
      where: {
        refundMethod:
          "CUSTOMER_CREDIT",
      },
      select: {
        customerId: true,
        totalAmount: true,
      },
    });

  const customerCreditReturnsByCustomer =
    new Map<string, number>();

  salesReturns.forEach(
    (salesReturn) => {
      if (!salesReturn.customerId) {
        return;
      }

      const current =
        customerCreditReturnsByCustomer.get(
          salesReturn.customerId
        ) ?? 0;

      customerCreditReturnsByCustomer.set(
        salesReturn.customerId,
        current +
          Number(
            salesReturn.totalAmount ?? 0
          )
      );
    }
  );

  const customerOutstanding =
    customers
      .map((customer) => {
                const repairDetails =
          customer.repairJobs
            .map((job) => {
   const finalAmount =
  Math.max(
    0,
    Number(
      job.estimatedCost ?? 0
    ) +
      Number(
        job.diagnosisFee ?? 0
      ) +
      Number(
        job.labourCharge ?? 0
      ) -
      Number(
        job.discount ?? 0
      )
  );

              const advanceAmount =
                Math.max(
                  0,
                  Number(
                    job.advanceAmount ?? 0
                  )
                );

            const additionalPayments =
           (repairCashBookPaymentByJob.get(
           job.jobNumber
           ) ?? 0) +
           (customerPaymentAllocatedToRepairByJob.get(
            job.jobNumber
            ) ?? 0);

           const refundedAmount =
           job.repairRefunds.reduce(
          (refundSum, refund) =>
           refundSum +
           Number(
          refund.amount ?? 0
          ),
         0
        );

          const due =
          Math.max(
      0,
      finalAmount -
      advanceAmount -
      additionalPayments
      );

    return {
    type: "REPAIR",
    id: job.id,
      reference:
    job.jobNumber,

                date:
                  job.receivedDate,
                totalAmount:
  finalAmount,

paidAmount:
  advanceAmount +
  additionalPayments,

refundedAmount:
  refundedAmount,

dueAmount:
  due,
              };
            })
            .filter(
              (item) =>
                item.dueAmount > 0
            );
        const repairDue =
          customer.repairJobs.reduce(
            (sum, job) => {
  const finalAmount =
  Math.max(
    0,
    Number(
      job.estimatedCost ?? 0
    ) +
      Number(
        job.diagnosisFee ?? 0
      ) +
      Number(
        job.labourCharge ?? 0
      ) -
      Number(
        job.discount ?? 0
      )
  );
              const advanceAmount =
                Math.max(
                  0,
                  Number(
                    job.advanceAmount ?? 0
                  )
                );

             const additionalPayments =
  (repairCashBookPaymentByJob.get(
    job.jobNumber
  ) ?? 0) +
  (customerPaymentAllocatedToRepairByJob.get(
    job.jobNumber
  ) ?? 0);

          const due =
  Math.max(
    0,
    finalAmount -
      advanceAmount -
      additionalPayments
  );

              return sum + due;
            },
            0
          );
          
           const repairOverpayment =
  customer.repairJobs.reduce(
    (sum, job) => {
      const finalAmount =
  Math.max(
    0,
    Number(
      job.estimatedCost ?? 0
    ) +
      Number(
        job.diagnosisFee ?? 0
      ) +
      Number(
        job.labourCharge ?? 0
      ) -
      Number(
        job.discount ?? 0
      )
  );

      const advanceAmount =
        Math.max(
          0,
          Number(
            job.advanceAmount ?? 0
          )
        );

      const additionalPayments =
        repairCashBookPaymentByJob.get(
          job.jobNumber
        ) ??
        0;

      const allocatedCustomerPayment =
        customerPaymentAllocatedToRepairByJob.get(
          job.jobNumber
        ) ??
        0;

      const totalPaid =
        advanceAmount +
        additionalPayments +
        allocatedCustomerPayment;

      const overpayment =
        Math.max(
          0,
          totalPaid -
            finalAmount
        );

      return sum + overpayment;
    },
    0
  );

                  const salesDetails =
          customer.sales
            .map((sale) => ({
              type: "SALE",
              id: sale.id,
              reference:
                sale.invoiceNumber,
              date:
                sale.saleDate,
              totalAmount:
                Number(
                  sale.grandTotal ?? 0
                ),
              dueAmount:
                Math.max(
                  0,
                  Number(
                    sale.dueAmount ?? 0
                  )
                ),
            }))
            .filter(
              (item) =>
                item.dueAmount > 0
            );

        const originalSalesDue =
  customer.sales.reduce(
    (sum, sale) => {
      const actualSalesPayments =
        salesCashBookPaymentByInvoice.get(
          sale.invoiceNumber
        ) ?? 0;

      const due =
        Math.max(
          0,
          Number(sale.grandTotal ?? 0) -
            actualSalesPayments
        );

      return sum + due;
    },
    0
  );
        const salesCreditReturns =
          customerCreditReturnsByCustomer.get(
            customer.id
          ) ?? 0;

          const customerPaymentKey =
  String(
    customer.fullName ||
      customer.companyName ||
      ""
  ).trim();

const totalCustomerPayments =
  customerCashBookPaymentByName.get(
    customerPaymentKey
  ) ?? 0;

const allocatedCustomerPaymentsToRepair =
  customer.repairJobs.reduce(
    (sum, job) =>
      sum +
      (customerPaymentAllocatedToRepairByJob.get(
        job.jobNumber
      ) ?? 0),
    0
  );

const standaloneCustomerPayments =
  Math.max(
    0,
    totalCustomerPayments -
      allocatedCustomerPaymentsToRepair
  );

  const salesDue =
  Math.max(
    0,
    customer.sales.reduce(
      (sum, sale) =>
        sum +
        Math.max(
          0,
          Number(
            sale.dueAmount ?? 0
          )
        ),
      0
    )
  );

const totalDue =
  Math.max(
    0,
    repairDue +
      originalSalesDue -
      salesCreditReturns -
      standaloneCustomerPayments -
      repairOverpayment
  );

                return {
          id: customer.id,
          partyType: "CUSTOMER",

          name:
          customer.fullName ||
          customer.companyName,

          phone: customer.phone,

          customerDue:
            totalDue,

          repairDue,

          salesDue,

          totalDue,

          repairDetails,

          salesDetails,
        };

      })
      .filter(
        (customer) =>
          customer.totalDue > 0
      );

    // =====================================================
  // SUPPLIER OUTSTANDING
  // =====================================================

  const suppliers = await prisma.supplier.findMany({
    select: {
      id: true,
      companyName: true,
      phone: true,

     purchases: {
  select: {
    id: true,
    purchaseNumber: true,
    purchaseDate: true,
    totalAmount: true,
    paidAmount: true,
    dueAmount: true,
    supplierInvoiceNumber: true,
  },
},
    payments: {
  select: {
    amount: true,
  },
},

      purchaseReturns: {
        select: {
          totalAmount: true,
          refundAmount: true,
          refundMethod: true,
        },
      },
    },
  });

  const supplierOutstanding = suppliers
    .map((supplier) => {
      const purchaseTotal =
        supplier.purchases.reduce(
          (sum, purchase) =>
            sum +
            Number(
              purchase.totalAmount ?? 0
            ),
          0
        );

      const initialPaid =
        supplier.purchases.reduce(
          (sum, purchase) =>
            sum +
            Number(
              purchase.paidAmount ?? 0
            ),
          0
        );

      const laterPaid =
        supplier.payments.reduce(
          (sum, payment) =>
            sum +
            Number(
              payment.amount ?? 0
            ),
          0
        );

      // =================================================
      // PURCHASE RETURNS
      //
      // Supplier Credit reduces the amount we owe.
      // Cash Refund does not reduce supplier credit,
      // because the supplier has already returned cash.
      // =================================================

      const supplierCreditReturns =
        supplier.purchaseReturns.reduce(
          (sum, purchaseReturn) => {
            if (
              purchaseReturn.refundMethod ===
              "SUPPLIER_CREDIT"
            ) {
              return (
                sum +
                Number(
                  purchaseReturn.totalAmount ??
                    purchaseReturn.refundAmount ??
                    0
                )
              );
            }

            return sum;
          },
          0
        );

      const totalDue = Math.max(
        0,
        purchaseTotal -
          initialPaid -
          laterPaid -
          supplierCreditReturns
      );

           const purchaseDetails =
  supplier.purchases
    .map((purchase: any) => {
      const totalAmount =
        Number(purchase.totalAmount ?? 0);
      const paidAmount =
        Number(purchase.paidAmount ?? 0);
      const dueAmount =
        Math.max(
          0,
          Number(purchase.dueAmount ?? 0)
        );

      return {
        type: "PURCHASE",
        id: purchase.id,
        reference:
          purchase.purchaseNumber ??
          purchase.supplierInvoiceNumber ??
          null,
        date:
          purchase.purchaseDate ??
          null,
        totalAmount,
        paidAmount,
        dueAmount,
      };
    })
    .filter((item: any) => item.dueAmount > 0);

      return {
  id: supplier.id,
  partyType: "SUPPLIER",
  name: supplier.companyName,
  phone: supplier.phone,

  supplierDue: totalDue,

  purchaseDetails,

  totalDue,
};
    })
    .filter(
      (supplier) =>
        supplier.totalDue > 0
    );
  // =====================================================
  // SUMMARY
  // =====================================================

  const customerDue =
    customerOutstanding.reduce(
      (sum, customer) =>
        sum +
        customer.totalDue,
      0
    );

  const repairDue =
    customerOutstanding.reduce(
      (sum, customer) =>
        sum +
        customer.repairDue,
      0
    );

  const salesDue =
    customerOutstanding.reduce(
      (sum, customer) =>
        sum +
        customer.salesDue,
      0
    );

  const supplierDue =
    supplierOutstanding.reduce(
      (sum, supplier) =>
        sum +
        supplier.totalDue,
      0
    );

  return {
    summary: {
      customerDue,
      repairDue,
      salesDue,
      supplierDue,
      totalCustomerDue:
        customerDue,
      totalSupplierDue:
        supplierDue,
    },

    customers:
      customerOutstanding,

    suppliers:
      supplierOutstanding,
  };
}