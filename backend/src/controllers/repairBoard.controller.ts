import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getRepairBoard(
  req: Request,
  res: Response
) {
  const jobs = await prisma.repairJob.findMany({
    include: {
      customer: true,

      parts: {
        include: {
          inventory: true,
        },
      },

      payments: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const jobsWithDueAmount = jobs.map((job) => {
    // =========================================================
    // PARTS TOTAL
    // =========================================================
    const partsTotal = job.parts.reduce(
      (sum, part) => {
        const quantity = Math.max(
          0,
          Number(part.quantity ?? 0)
        );

        const price = Math.max(
          0,
          Number(
            part.price ??
              part.inventory?.sellingPrice ??
              0
          )
        );

        return sum + quantity * price;
      },
      0
    );

    // =========================================================
    // SERVICE CHARGES
    // =========================================================
    const labourCharge = Math.max(
      0,
      Number(job.labourCharge ?? 0)
    );

    const diagnosisFee = Math.max(
      0,
      Number(job.diagnosisFee ?? 0)
    );

    // =========================================================
    // SUBTOTAL
    // =========================================================
    const subtotal =
      partsTotal +
      labourCharge +
      diagnosisFee;

    // =========================================================
    // DISCOUNT
    // =========================================================
    const discount = Math.min(
      Math.max(0, Number(job.discount ?? 0)),
      subtotal
    );

    // =========================================================
    // FINAL BILL
    // =========================================================
    const finalTotal = Math.max(
      0,
      subtotal - discount
    );

    // =========================================================
    // TOTAL PAID
    // =========================================================
    const paymentsTotal = job.payments.reduce(
      (sum, payment) => {
        return (
          sum +
          Math.max(
            0,
            Number(payment.amount ?? 0)
          )
        );
      },
      0
    );

    const advancePayment = Math.max(
      0,
      Number(job.advanceAmount ?? 0)
    );

    const totalPaid = Math.max(
      0,
      advancePayment + paymentsTotal
    );

    // =========================================================
    // CURRENT DUE
    // =========================================================
    const dueAmount = Math.max(
      0,
      finalTotal - totalPaid
    );

   return {
  ...job,

  // Financial values for Repair Job Card
  estimate: finalTotal,
  advance: advancePayment,
  paidAmount: totalPaid,
  dueAmount,

  // Keep the original database value unchanged
  balanceAmount: job.balanceAmount,
};

  });

  res.json({
    success: true,
    data: jobsWithDueAmount,
  });
}