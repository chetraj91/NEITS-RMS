import { prisma } from "../config/prisma";
import { sendPaymentReceivedSms } from "./smsEvent.service";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function receivePayment(data: {
  repairJobId: string;
  amount: number;
  method: string;
  remarks?: string;
}) {
  if (!data.repairJobId) {
    throw new Error("Repair Job ID is required");
  }

  if (!Number.isFinite(data.amount) || data.amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  const payment = await prisma.$transaction(async (tx) => {
    // =====================================================
    // LOAD REPAIR JOB FIRST
    // =====================================================

    const job = await tx.repairJob.findUnique({
      where: {
        id: data.repairJobId,
      },
    });

    if (!job) {
      throw new Error("Repair Job not found");
    }

    // =====================================================
    // CURRENT INITIAL ADVANCE
    //
    // IMPORTANT:
    // advanceAmount is the ORIGINAL ADVANCE.
    // DO NOT increase it when additional payment is received.
    // =====================================================

    const originalAdvance = Number(
      job.advanceAmount ?? 0
    );

       // =====================================================
    // BILL TOTAL AFTER DISCOUNT
    //
    // totalAmount = estimate total
    // discount = billing discount
    // finalTotal = actual amount customer must pay
    // =====================================================

    const estimateTotal = Number(
      job.totalAmount ?? 0
    );

    const discount = Number(
      job.discount ?? 0
    );

    const finalTotal = Math.max(
      0,
      estimateTotal - discount
    );

    // =====================================================
    // GET EXISTING ADDITIONAL PAYMENTS
    // =====================================================

    const existingPayments =
      await tx.payment.aggregate({
        where: {
          repairJobId: job.id,
        },
        _sum: {
          amount: true,
        },
      });

    const existingAdditionalPayments =
      Number(
        existingPayments._sum.amount ?? 0
      );

    // =====================================================
    // TOTAL PAID AFTER THIS PAYMENT
    // =====================================================

    const newAdditionalPayments =
      existingAdditionalPayments +
      data.amount;

    const totalPaid =
      originalAdvance +
      newAdditionalPayments;

    // =====================================================
    // BALANCE
    //
    // IMPORTANT:
    // Balance must be calculated from the FINAL BILL
    // after discount.
    // =====================================================

    const newBalance = Math.max(
      0,
      finalTotal - totalPaid
    );

    // =====================================================
    // CREATE PAYMENT RECORD
    //
    // This is an ADDITIONAL payment.
    // It must NOT be added to advanceAmount.
    // =====================================================

    const payment = await tx.payment.create({
      data: {
        repairJobId: data.repairJobId,
        amount: data.amount,
        paymentMode: data.method,
        remarks: data.remarks,
      },
    });

    // =====================================================
    // CASH BOOK
    // =====================================================

    await tx.cashBook.create({
      data: {
        particulars: `Repair Payment - ${job.jobNumber} (${data.method})`,
        debit: 0,
        credit: data.amount,
        balance: 0,
      },
    });

    // =====================================================
    // CUSTOMER LEDGER
    // =====================================================

    await tx.customerLedger.create({
      data: {
        customerId: job.customerId,
        repairJobId: job.id,
        particulars: `Repair Payment (${data.method})`,
        debit: 0,
        credit: data.amount,
        balance: newBalance,
      },
    });

    // =====================================================
    // UPDATE ONLY BALANCE
    //
    // DO NOT UPDATE advanceAmount
    // =====================================================

    await tx.repairJob.update({
      where: {
        id: job.id,
      },
      data: {
        balanceAmount: newBalance,
      },
    });

    return payment;
  });

  // =========================================
  // AUTOMATIC SMS — PAYMENT RECEIVED
  // =========================================

  try {
    const completeJob =
      await prisma.repairJob.findUnique({
        where: {
          id: data.repairJobId,
        },
        include: {
          customer: true,
        },
      });

    if (completeJob) {
      const paymentTotals =
        await prisma.payment.aggregate({
          where: {
            repairJobId:
              completeJob.id,
          },
          _sum: {
            amount: true,
          },
        });

      const additionalPaid =
        Number(
          paymentTotals._sum.amount ?? 0
        );

           const estimateTotal =
        Number(
          completeJob.totalAmount ?? 0
        );

      const discount =
        Number(
          completeJob.discount ?? 0
        );

      const finalTotal =
        Math.max(
          0,
          estimateTotal - discount
        );

      const paidAmount =
        Number(
          completeJob.advanceAmount ?? 0
        ) +
        additionalPaid;

      const dueAmount =
        Math.max(
          0,
          finalTotal - paidAmount
        );

      await sendPaymentReceivedSms({
        id: completeJob.id,

        jobNumber:
          completeJob.jobNumber,

        brand:
          completeJob.brand,

        model:
          completeJob.model,

        serialNumber:
          completeJob.serialNumber,

        deviceType:
          completeJob.deviceType,

        complaint:
          completeJob.complaint,

        diagnosis:
          completeJob.diagnosis,

                estimatedCost:
          completeJob.estimatedCost,

        discount:
          completeJob.discount,

        totalAmount:
          finalTotal,

        advanceAmount:
          completeJob.advanceAmount,

        paymentAmount:
          data.amount,

        paidAmount,

        dueAmount,

        customer:
          completeJob.customer
            ? {
                id:
                  completeJob.customer.id,

                fullName:
                  completeJob.customer.fullName,

                phone:
                  completeJob.customer.phone,
              }
            : null,
      });
    }
  } catch (error: any) {
    console.error(
      "SMS EVENT: PAYMENT_RECEIVED failed:",
      error?.message ||
        "Unable to send payment received SMS."
    );

    // SMS failure must NEVER
    // cancel the successful payment.
  }

  // =========================================
  // AUTOMATIC EXCEL BACKUP
  // =========================================

  triggerAutomaticExcelBackup();

  return payment;
}

// =========================================================
// GET PAYMENT HISTORY
// =========================================================

export async function getPayments(
  repairJobId: string
) {
  return prisma.payment.findMany({
    where: {
      repairJobId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}