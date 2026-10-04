import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

// =========================================================
// CREATE REPAIR REFUND
// =========================================================

export async function createRepairRefund(data: {
  repairJobId: string;
  amount: number;
  refundMethod?: string;
  remarks?: string;
}) {
  const repairJobId =
    String(
      data.repairJobId || ""
    ).trim();

  const amount =
    Number(data.amount);

  const refundMethod =
    String(
      data.refundMethod ||
        "CASH"
    ).trim() || "CASH";

  const remarks =
    data.remarks
      ? String(
          data.remarks
        ).trim()
      : null;

  // =====================================================
  // VALIDATION
  // =====================================================

  if (!repairJobId) {
    throw new Error(
      "Repair Job ID is required."
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Refund amount must be greater than 0."
    );
  }

  const result =
    await prisma.$transaction(
      async (tx) => {
        // =================================================
        // LOAD REPAIR JOB
        // =================================================

        const job =
          await tx.repairJob.findUnique({
            where: {
              id:
                repairJobId,
            },

            select: {
              id: true,
              jobNumber: true,
              customerId: true,
              advanceAmount: true,
              totalAmount: true,
            },
          });

        if (!job) {
          throw new Error(
            "Repair Job not found."
          );
        }

        // =================================================
        // ACTUAL REPAIR PAYMENTS
        // =================================================

        const paymentTotals =
          await tx.payment.aggregate({
            where: {
              repairJobId:
                job.id,
            },

            _sum: {
              amount: true,
            },
          });

        const additionalPayments =
          Number(
            paymentTotals._sum
              .amount ?? 0
          );

        const advanceAmount =
          Math.max(
            0,
            Number(
              job.advanceAmount ??
                0
            )
          );

        const totalReceived =
          advanceAmount +
          Math.max(
            0,
            additionalPayments
          );

        // =================================================
        // PREVIOUS REFUNDS
        // =================================================

        const previousRefunds =
          await tx.repairRefund.aggregate({
            where: {
              repairJobId:
                job.id,
            },

            _sum: {
              amount: true,
            },
          });

        const alreadyRefunded =
          Math.max(
            0,
            Number(
              previousRefunds._sum
                .amount ?? 0
            )
          );

        // =================================================
        // AVAILABLE REFUND
        // =================================================

        const availableToRefund =
          Math.max(
            0,
            totalReceived -
              alreadyRefunded
          );

        if (
          amount >
          availableToRefund
        ) {
          throw new Error(
            `Refund amount cannot exceed the available refundable amount of Rs. ${availableToRefund.toFixed(
              2
            )}.`
          );
        }

        // =================================================
        // CREATE REFUND RECORD
        // =================================================

        const refund =
          await tx.repairRefund.create({
            data: {
              repairJobId:
                job.id,

              customerId:
                job.customerId,

              amount,

              refundMethod,

              remarks,
            },
          });

        // =================================================
        // CASH BOOK
        //
        // Refund = MONEY OUT
        // =================================================

        await tx.cashBook.create({
          data: {
            particulars:
              `Repair Refund - ${job.jobNumber} (${refundMethod})`,

            debit:
              amount,

            credit: 0,

            balance: 0,
          },
        });

        return refund;
      }
    );

  // =======================================================
  // AUTOMATIC EXCEL BACKUP
  // =======================================================

  triggerAutomaticExcelBackup();

  return result;
}

// =========================================================
// GET REPAIR REFUNDS
// =========================================================

export async function getRepairRefunds(
  repairJobId: string
) {
  return prisma.repairRefund.findMany({
    where: {
      repairJobId,
    },

    orderBy: {
      createdAt: "asc",
    },
  });
}