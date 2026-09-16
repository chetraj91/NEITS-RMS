import { prisma } from "../config/prisma";

/**
 * ============================================================
 * REPAIR INVOICE
 * ============================================================
 *
 * The RepairPart table is the single source of truth for
 * physical parts used on a repair job.
 *
 * Parts Total
 *   = Sum(quantity × unit price) from RepairPart records
 *
 * Service Charge
 *   = Labour Charge + Diagnosis Fee
 *
 * Subtotal
 *   = Parts Total + Service Charge
 *
 * Grand Total
 *   = max(0, Subtotal - Discount)
 *
 * Advance Payment
 *   = Original advance received when the job was opened
 *
 * Additional Payments
 *   = Payments recorded in Payment records
 *
 * Total Paid
 *   = Advance Payment + Additional Payments
 *
 * Due Amount
 *   = max(0, Grand Total - Total Paid)
 *
 * Refund Amount
 *   = max(0, Total Paid - Grand Total)
 *
 * IMPORTANT:
 * Payment history is used internally for calculation but is
 * intentionally NOT returned in the customer invoice response.
 * ============================================================
 */

function money(value: unknown): number {
  const number = Number(value ?? 0);

  return Number.isFinite(number)
    ? number
    : 0;
}

function positiveMoney(
  value: unknown
): number {
  return Math.max(
    0,
    money(value)
  );
}

/**
 * Get the actual selling price stored on a RepairPart.
 *
 * Your current RepairPart API/UI has used both `price` and
 * `unitPrice` naming in different places, so this keeps the
 * invoice compatible with the existing response shape.
 *
 * `price` is preferred because that is the field used by
 * the current Prisma invoice calculation.
 */
function getRepairPartUnitPrice(
  part: any
): number {
  return positiveMoney(
    part?.price ??
      part?.unitPrice ??
      part?.sellingPrice ??
      part?.inventory?.sellingPrice ??
      part?.inventory?.price ??
      0
  );
}

function getRepairPartQuantity(
  part: any
): number {
  return positiveMoney(
    part?.quantity ?? 0
  );
}

export async function getRepairInvoice(
  repairJobId: string
) {
  const repairJob =
    await prisma.repairJob.findUnique({
      where: {
        id: repairJobId,
      },

      include: {
        customer: true,
        technician: true,

        parts: {
          include: {
            inventory: true,
          },
        },

        // Used internally to calculate total paid.
        // Not returned in the invoice response.
        payments: true,

        repairJobFieldValues: {
          include: {
            deviceField: true,
          },
        },
      },
    });

  if (!repairJob) {
    throw new Error(
      "Repair Job not found."
    );
  }

  // ==========================================================
  // COMPANY SETTINGS
  // ==========================================================

  const company =
    await prisma.companySettings.findUnique({
      where: {
        id: "company",
      },
    });

  // ==========================================================
  // PARTS
  // ==========================================================

  const parts =
    repairJob.parts.map(
      (part: any) => {
        const quantity =
          getRepairPartQuantity(
            part
          );

        const price =
          getRepairPartUnitPrice(
            part
          );

        const total =
          quantity * price;

        return {
          id: part.id,

          itemName:
            part.inventory
              ?.itemName ??
            part.itemName ??
            "",

          itemCode:
            part.inventory
              ?.itemCode ??
            part.itemCode ??
            "",

          quantity,

          price,

          total,
        };
      }
    );

  // ==========================================================
  // PARTS TOTAL
  // ==========================================================

  const partsTotal =
    parts.reduce(
      (
        sum: number,
        part: any
      ) =>
        sum +
        part.total,
      0
    );

  // ==========================================================
  // SERVICE CHARGES
  // ==========================================================

  const labourCharge =
    positiveMoney(
      repairJob.labourCharge
    );

  const diagnosisFee =
    positiveMoney(
      repairJob.diagnosisFee
    );

  const serviceCharge =
    labourCharge +
    diagnosisFee;

  // ==========================================================
  // SUBTOTAL
  // ==========================================================

  const subtotal =
    partsTotal +
    serviceCharge;

  // ==========================================================
  // DISCOUNT
  // ==========================================================

  const discount =
    Math.min(
      positiveMoney(
        repairJob.discount
      ),
      subtotal
    );

  // ==========================================================
  // GRAND TOTAL
  // ==========================================================

  const grandTotal =
    Math.max(
      0,
      subtotal - discount
    );

  // ==========================================================
  // ADDITIONAL PAYMENT HISTORY
  // ==========================================================

  const paymentsTotal =
    repairJob.payments.reduce(
      (
        sum: number,
        payment: any
      ) => {
        return (
          sum +
          positiveMoney(
            payment.amount
          )
        );
      },
      0
    );

  // ==========================================================
  // ORIGINAL ADVANCE PAYMENT
  // ==========================================================

  // The current payment service accumulates all received money
  // into RepairJob.advanceAmount.
  //
  // Example:
  //   Original advance = 300
  //   Later payment    = 1700
  //   Stored advance   = 2000
  //
  // Payment history = 1700
  // Original advance = 2000 - 1700 = 300
  //
  // This preserves compatibility with the current database
  // payment-service behavior.

  const storedAdvanceAmount =
    positiveMoney(
      repairJob.advanceAmount
    );

  // advanceAmount stores the original advance received
  // when the repair job was opened.
  // Additional payments are stored separately in Payment.

  const advancePayment =
    storedAdvanceAmount;

  // ==========================================================
  // TOTAL PAID
  // ==========================================================

  const totalPaid =
    advancePayment +
    paymentsTotal;

  // ==========================================================
  // BALANCE / DUE
  // ==========================================================

  const dueAmount =
    Math.max(
      0,
      grandTotal -
        totalPaid
    );

  // ==========================================================
  // REFUND
  // ==========================================================

  const refundAmount =
    Math.max(
      0,
      totalPaid -
        grandTotal
    );

  // ==========================================================
  // KEEP DATABASE FINANCIAL FIELDS CONSISTENT
  // ==========================================================

  // These fields are not required to display the invoice, but
  // keeping totalAmount and balanceAmount synchronized prevents
  // the Repair Job page and Invoice page from showing different
  // totals.
  //
  // We intentionally do NOT change advanceAmount.

  if (
    money(
      repairJob.totalAmount
    ) !==
      grandTotal ||
    money(
      repairJob.balanceAmount
    ) !== dueAmount
  ) {
    await prisma.repairJob.update({
      where: {
        id: repairJob.id,
      },

      data: {
        totalAmount:
          grandTotal,

        balanceAmount:
          dueAmount,
      },
    });
  }

  // ==========================================================
  // RETURN INVOICE DATA
  // ==========================================================

  return {
    // ========================================================
    // COMPANY
    // ========================================================

    company: {
      name:
        company?.companyName ||
        "",

      address:
        company?.address ||
        "",

      phone:
        company?.phone ||
        "",

      email:
        company?.email ||
        "",

      pan:
        company?.panVat ||
        "",

      website:
        company?.website ||
        "",

      logoUrl:
        company?.logoUrl ||
        "",

      invoiceFooter:
        company?.invoiceFooter ||
        "",
    },

    // ========================================================
    // CUSTOMER
    // ========================================================

    customer: {
      id:
        repairJob.customer
          .id,

      name:
        repairJob.customer
          .fullName,

      phone:
        repairJob.customer
          .phone,

      address:
        repairJob.customer
          .address,

      panVat:
        repairJob.customer
          .panVat,
    },

    // ========================================================
    // TECHNICIAN
    // ========================================================

    technician:
      repairJob.technician
        ? {
            id:
              repairJob
                .technician
                .id,

            name:
              repairJob
                .technician
                .fullName,

            phone:
              repairJob
                .technician
                .phone,
          }
        : null,

    // ========================================================
    // REPAIR INFORMATION
    // ========================================================

    repair: {
      id:
        repairJob.id,

      jobNumber:
        repairJob.jobNumber,

      receivedDate:
        repairJob.receivedDate,

      deliveryDate:
        repairJob.deliveryDate,

      invoiceNumber:
        repairJob.invoiceNumber,

      brand:
        repairJob.brand,

      model:
        repairJob.model,

      serialNumber:
        repairJob.serialNumber,

      deviceType:
        repairJob.deviceType,

      complaint:
        repairJob.complaint,

      diagnosis:
        repairJob.diagnosis,

      repairNotes:
        repairJob.repairNotes,

      warrantyDays:
        repairJob.warrantyDays,

      warrantyExpiry:
        repairJob.warrantyExpiry,

      status:
        repairJob.status,
    },

    // ========================================================
    // PARTS
    // ========================================================

    parts,

    // ========================================================
    // DEVICE FIELDS
    // ========================================================

    deviceFields:
      repairJob.repairJobFieldValues ||
      [],

    // ========================================================
    // FINANCIAL SUMMARY
    // ========================================================

    summary: {
      partsTotal,

      labourCharge,

      diagnosisFee,

      serviceCharge,

      subtotal,

      discount,

      grandTotal,

      advancePayment,

      paymentsTotal,

      totalPaid,

      dueAmount,

      refundAmount,
    },
  };
}

/**
 * ============================================================
 * SALES INVOICE
 * ============================================================
 *
 * Used for normal sales that are NOT related to a repair job.
 * ============================================================
 */

export async function getSaleInvoice(
  saleId: string
) {
  const sale =
    await prisma.sale.findUnique({
      where: {
        id: saleId,
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

  if (!sale) {
    throw new Error(
      "Sale not found."
    );
  }

  // ==========================================================
  // COMPANY SETTINGS
  // ==========================================================

  const company =
    await prisma.companySettings.findUnique({
      where: {
        id: "company",
      },
    });

  // ==========================================================
  // SALES ITEMS
  // ==========================================================

  const items =
    sale.items.map(
      (item) => {
        const quantity =
          positiveMoney(
            item.quantity
          );

        const unitPrice =
          positiveMoney(
            item.sellingPrice
          );

        const total =
          quantity *
          unitPrice;

        return {
          id: item.id,

          quantity,

          unitPrice,

          total,

          itemName:
            item.inventory
              .itemName,

          itemCode:
            item.inventory
              .itemCode,

          brand:
            item.inventory
              .brand,

          model:
            item.inventory
              .model,
        };
      }
    );

  // ==========================================================
  // SALES SUBTOTAL
  // ==========================================================

  const subtotal =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        item.total,
      0
    );

  // ==========================================================
  // DISCOUNT
  // ==========================================================

  const discount =
    Math.min(
      positiveMoney(
        sale.discount
      ),
      subtotal
    );

  // ==========================================================
  // GRAND TOTAL
  // ==========================================================

  const grandTotal =
    Math.max(
      0,
      subtotal -
        discount
    );

  // ==========================================================
  // RETURN SALES INVOICE
  // ==========================================================

  return {
    // ========================================================
    // COMPANY
    // ========================================================

    company: {
      name:
        company?.companyName ||
        "",

      address:
        company?.address ||
        "",

      phone:
        company?.phone ||
        "",

      email:
        company?.email ||
        "",

      pan:
        company?.panVat ||
        "",

      website:
        company?.website ||
        "",

      logoUrl:
        company?.logoUrl ||
        "",

      invoiceFooter:
        company?.invoiceFooter ||
        "",
    },

    // ========================================================
    // CUSTOMER
    // ========================================================

    customer:
      sale.customer
        ? {
            id:
              sale.customer
                .id,

            name:
              sale.customer
                .fullName,

            phone:
              sale.customer
                .phone,

            address:
              sale.customer
                .address,

            panVat:
              sale.customer
                .panVat ||
              null,
          }
        : null,

    // ========================================================
    // SALE
    // ========================================================

    sale: {
      id:
        sale.id,

      invoiceNumber:
        sale.invoiceNumber,

      saleDate:
        sale.saleDate,
    },

    // ========================================================
    // ITEMS
    // ========================================================

    items,

    // ========================================================
    // SUMMARY
    // ========================================================

    summary: {
      subtotal,

      discount,

      grandTotal,
    },
  };
}