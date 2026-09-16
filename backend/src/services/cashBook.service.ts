import { prisma } from "../config/prisma";

export async function getCashBook() {

 const [
  cashBookEntries,
  repairJobs,
  sales,
  purchases,
  purchaseReturns,
  salesReturns,
] = await Promise.all([

    prisma.cashBook.findMany({
      orderBy: {
        createdAt: "desc",
      },
    }),

    // =====================================================
    // REPAIR JOBS → CUSTOMER
    // =====================================================
    prisma.repairJob.findMany({
      select: {
        jobNumber: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    }),

    // =====================================================
    // SALES → CUSTOMER
    // =====================================================
    prisma.sale.findMany({
      select: {
        invoiceNumber: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    }),

       // =====================================================
    // PURCHASES → SUPPLIER
    // =====================================================
    prisma.purchase.findMany({
      select: {
        purchaseNumber: true,
        supplier: {
          select: {
            companyName: true,
          },
        },
      },
    }),

    // =====================================================
    // PURCHASE RETURNS → SUPPLIER
    // =====================================================
    prisma.purchaseReturn.findMany({
      select: {
        returnNumber: true,
        supplier: {
          select: {
            companyName: true,
          },
        },
      },
    }),

    // =====================================================
    // SALES RETURNS → CUSTOMER
    // =====================================================
    prisma.salesReturn.findMany({
      select: {
        returnNumber: true,
        customer: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ]);
  // =====================================================
  // REPAIR JOB MAP
  // =====================================================

  const repairJobMap = new Map(
    repairJobs.map((job) => [
      String(job.jobNumber),
      job.customer?.fullName || "",
    ])
  );

  // =====================================================
  // SALES MAP
  // =====================================================

  const saleCustomerMap = new Map(
    sales.map((sale) => [
      String(sale.invoiceNumber),
      sale.customer?.fullName || "",
    ])
  );

  // =====================================================
  // PURCHASE → SUPPLIER MAP
  // =====================================================

  const purchaseSupplierMap = new Map(
    purchases.map((purchase) => [
      String(purchase.purchaseNumber),
      purchase.supplier?.companyName || "",
    ])
  );
  // =====================================================
// PURCHASE RETURN → SUPPLIER MAP
// =====================================================

const purchaseReturnSupplierMap = new Map(
  purchaseReturns.map((purchaseReturn) => [
    String(purchaseReturn.returnNumber),
    purchaseReturn.supplier?.companyName || "",
  ])
);

    // =====================================================
  // SALES RETURN → CUSTOMER MAP
  // =====================================================

  const salesReturnCustomerMap = new Map(
    salesReturns.map((salesReturn) => [
      String(salesReturn.returnNumber),
      salesReturn.customer?.fullName || "",
    ])
  );

  // =====================================================
  // BUILD CASH BOOK
  // =====================================================

     return cashBookEntries.map((entry) => {
      let customerName = "";
     let paymentMethod = "";

      const particulars =
      entry.particulars || "";

          // =====================================================
    // PAYMENT METHOD
    // =====================================================

    if (
      particulars.startsWith(
        "Customer Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Customer Payment - ",
            ""
          )
          .trim();

      const parts =
        remaining.split(" - ");

      if (parts.length >= 2) {
        paymentMethod =
          parts[parts.length - 1]
            .trim()
            .toUpperCase();
      }
    }

    if (
      particulars.startsWith(
        "Expense - "
      )
    ) {
      const match =
        particulars.match(
          /\(([^()]*)\)\s*$/
        );

      if (match?.[1]) {
        paymentMethod =
          match[1]
            .trim()
            .toUpperCase();
      }
    }

    if (
      particulars.startsWith(
        "Sales Payment - "
      ) ||
      particulars.startsWith(
        "Repair Payment - "
      ) ||
      particulars.startsWith(
        "Supplier Payment - "
      )
    ) {
      const match =
        particulars.match(
          /\(([^()]*)\)\s*$/
        );

      if (match?.[1]) {
        paymentMethod =
          match[1]
            .trim()
            .toUpperCase();
      }
    }

    if (
      particulars.startsWith(
        "Purchase Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Purchase Payment - ",
            ""
          )
          .trim();

      const parts =
        remaining.split(" - ");

      if (parts.length >= 2) {
        paymentMethod =
          parts[parts.length - 1]
            .trim()
            .toUpperCase();
      }
    }

    // =====================================================
    // REPAIR ADVANCE
    // =====================================================

    if (
      particulars.startsWith(
        "Repair Advance - "
      )
    ) {
      const jobNumber =
        particulars
          .replace(
            "Repair Advance - ",
            ""
          )
          .trim();

      customerName =
        repairJobMap.get(jobNumber) || "";
    }

    // =====================================================
    // REPAIR PAYMENT
    // =====================================================

    if (
      particulars.startsWith(
        "Repair Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Repair Payment - ",
            ""
          )
          .trim();

      const jobNumber =
        remaining
          .split(" (")[0]
          .trim();

      customerName =
        repairJobMap.get(jobNumber) || "";
    }

    // =====================================================
    // SALES PAYMENT
    // =====================================================

    if (
      particulars.startsWith(
        "Sales Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Sales Payment - ",
            ""
          )
          .trim();

      const invoiceNumber =
        remaining
          .split(" (")[0]
          .trim();

      customerName =
        saleCustomerMap.get(
          invoiceNumber
        ) || "";
    }
          // =====================================================
    // SALES RETURN
    // =====================================================

    if (
      particulars.startsWith(
        "Sales Return - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Sales Return - ",
            ""
          )
          .trim();

      const returnNumber =
        remaining
          .split(" (")[0]
          .trim();

      customerName =
        salesReturnCustomerMap.get(
          returnNumber
        ) || "";
    }

    // =====================================================
    // CUSTOMER PAYMENT
    // =====================================================

    if (
      particulars.startsWith(
        "Customer Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Customer Payment - ",
            ""
          )
          .trim();

      // Customer Payment format:
      // Customer Payment - Customer Name - PAYMENT METHOD
      const parts =
        remaining.split(" - ");

      if (parts.length >= 2) {
        customerName =
          parts
            .slice(0, -1)
            .join(" - ")
            .trim();
      } else {
        customerName = remaining;
      }
    }

        // =====================================================
    // EXPENSE
    // =====================================================

    if (
      particulars.startsWith(
        "Expense - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Expense - ",
            ""
          )
          .trim();

      // Expense format:
      // Expense - Category - Expense Title (PAYMENT METHOD)

      const withoutPaymentMethod =
        remaining
          .replace(
            /\s+\([^)]*\)\s*$/,
            ""
          )
          .trim();

      const parts =
        withoutPaymentMethod.split(
          " - "
        );

      if (parts.length >= 2) {
        // Category is the first part.
        // Everything after it is the expense title.
        customerName =
          parts
            .slice(1)
            .join(" - ")
            .trim();
      } else {
        customerName =
          withoutPaymentMethod;
      }
    }

    // =====================================================
    // PURCHASE PAYMENT
    // =====================================================

    if (
      particulars.startsWith(
        "Purchase Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Purchase Payment - ",
            ""
          )
          .trim();

      const purchaseNumber =
        remaining
          .split(" - ")[0]
          .trim();

      customerName =
        purchaseSupplierMap.get(
          purchaseNumber
        ) || "";
    }

    // =====================================================
    // SUPPLIER PAYMENT
    //
    // Example:
    // Supplier Payment - Geo Nepal pvt.ltd (CASH)
    // =====================================================

    if (
      particulars.startsWith(
        "Supplier Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Supplier Payment - ",
            ""
          )
          .trim();

      customerName =
        remaining
          .split(" (")[0]
          .trim();
    }

    // =====================================================
// PURCHASE RETURN
// =====================================================

if (
  particulars.startsWith(
    "Purchase Return - "
  )
) {
  const remaining =
    particulars
      .replace(
        "Purchase Return - ",
        ""
      )
      .trim();

  const returnNumber =
    remaining
      .split(" (")[0]
      .trim();

  customerName =
    purchaseReturnSupplierMap.get(
      returnNumber
    ) || "";
}

   return {
  ...entry,
  customerName,
  paymentMethod,
};
  });
}
// =====================================================
// CASH BOOK PAYMENT METHOD SUMMARY
// =====================================================

export async function getCashBookPaymentSummary(
  fromDate?: string,
  toDate?: string
) {
  const paymentMethods =
    await prisma.paymentMethod.findMany({
      where: {
        active: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

  const dateFilter: any = {};

  if (fromDate) {
    dateFilter.gte =
      new Date(`${fromDate}T00:00:00`);
  }

  if (toDate) {
    dateFilter.lte =
      new Date(`${toDate}T23:59:59.999`);
  }

  const cashBookEntries =
    await prisma.cashBook.findMany({
      where:
        Object.keys(dateFilter).length > 0
          ? {
              createdAt: dateFilter,
            }
          : undefined,
      select: {
        particulars: true,
        debit: true,
        credit: true,
      },
    });

  // -----------------------------------------------------
  // Normalize payment method names
  // -----------------------------------------------------

  function normalizeMethod(
    value: string
  ) {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  }

  // -----------------------------------------------------
  // Extract payment method from CashBook particulars
  // -----------------------------------------------------

  function extractPaymentMethod(
    particulars: string
  ) {
    if (
      particulars.startsWith(
        "Customer Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Customer Payment - ",
            ""
          )
          .trim();

      const parts =
        remaining.split(" - ");

      if (parts.length >= 2) {
        return parts[
          parts.length - 1
        ]
          .trim()
          .toUpperCase();
      }
    }

    if (
      particulars.startsWith(
        "Purchase Payment - "
      )
    ) {
      const remaining =
        particulars
          .replace(
            "Purchase Payment - ",
            ""
          )
          .trim();

      const parts =
        remaining.split(" - ");

      if (parts.length >= 2) {
        return parts[
          parts.length - 1
        ]
          .trim()
          .toUpperCase();
      }
    }

  if (
  particulars.startsWith(
    "Expense - "
  ) ||
  particulars.startsWith(
    "Sales Payment - "
  ) ||
  particulars.startsWith(
    "Repair Payment - "
  ) ||
  particulars.startsWith(
    "Supplier Payment - "
  ) ||
  particulars.startsWith(
    "Purchase Return - "
  )
) {
      const match =
        particulars.match(
          /\(([^()]*)\)\s*$/
        );

      if (match?.[1]) {
        return match[1]
          .trim()
          .toUpperCase();
      }
    }

    return "";
  }

  // -----------------------------------------------------
  // Initialize configured payment methods
  // -----------------------------------------------------

  const summaryMap =
    new Map<
      string,
      {
        paymentMethod: string;
        cashIn: number;
        cashOut: number;
        net: number;
      }
    >();

  paymentMethods.forEach(
    (method) => {
      summaryMap.set(
        normalizeMethod(
          method.code
        ),
        {
          paymentMethod:
            method.name,
          cashIn: 0,
          cashOut: 0,
          net: 0,
        }
      );
    }
  );

  // -----------------------------------------------------
  // Transactions without a recognized method
  // -----------------------------------------------------

  let unspecifiedCashIn = 0;
  let unspecifiedCashOut = 0;

  // -----------------------------------------------------
  // Calculate summary
  // -----------------------------------------------------

  cashBookEntries.forEach(
    (entry) => {
      const method =
        extractPaymentMethod(
          entry.particulars || ""
        );

      const normalized =
        normalizeMethod(method);

      const credit =
        Number(entry.credit || 0);

      const debit =
        Number(entry.debit || 0);

      const summary =
        summaryMap.get(
          normalized
        );

      if (summary) {
        summary.cashIn += credit;
        summary.cashOut += debit;
        summary.net =
          summary.cashIn -
          summary.cashOut;
      } else {
        unspecifiedCashIn +=
          credit;

        unspecifiedCashOut +=
          debit;
      }
    }
  );

  const result =
    Array.from(
      summaryMap.values()
    );

  // -----------------------------------------------------
  // Include transactions such as Repair Advance
  // that currently have no payment method.
  // -----------------------------------------------------

  if (
    unspecifiedCashIn > 0 ||
    unspecifiedCashOut > 0
  ) {
    result.push({
      paymentMethod:
        "Not Specified",
      cashIn:
        unspecifiedCashIn,
      cashOut:
        unspecifiedCashOut,
      net:
        unspecifiedCashIn -
        unspecifiedCashOut,
    });
  }

  // -----------------------------------------------------
  // TOTAL
  // -----------------------------------------------------

  const totalCashIn =
    result.reduce(
      (sum, item) =>
        sum + item.cashIn,
      0
    );

  const totalCashOut =
    result.reduce(
      (sum, item) =>
        sum + item.cashOut,
      0
    );

  result.push({
    paymentMethod: "TOTAL",
    cashIn: totalCashIn,
    cashOut: totalCashOut,
    net:
      totalCashIn -
      totalCashOut,
  });

  return result;
}