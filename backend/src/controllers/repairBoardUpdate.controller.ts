import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getNextBillNumber } from "../services/billNumber.service";

import {
  sendReadyForDeliverySms,
  sendDeliveredSms,
} from "../services/smsEvent.service";

import { triggerAutomaticExcelBackup } from "../services/automaticExcelBackup.service";

export async function updateRepairStatus(
  req: Request,
  res: Response
) {
  try {
    const id =
      req.params.id as string;

    const { status } =
      req.body;

    // =========================================
    // CAPTURE OLD STATUS
    // =========================================

    const oldJob =
      await prisma.repairJob.findUnique({
        where: {
          id,
        },
        select: {
          status: true,
        },
      });

    if (!oldJob) {
      return res.status(404).json({
        success: false,
        message:
          "Repair job not found.",
      });
    }

    const oldStatus =
      oldJob.status;

    // =========================================
    // PREPARE UPDATE
    // =========================================

    const updateData: any = {
      status,
    };

    // =========================================
    // DELIVERY DATE + INVOICE NUMBER
    // =========================================

    if (status === "DELIVERED") {

      // Record exact delivery date/time
      updateData.deliveryDate =
        new Date();

      // Generate invoice number if missing
      const existingJob =
        await prisma.repairJob.findUnique({
          where: {
            id,
          },
          select: {
            invoiceNumber: true,
          },
        });

      if (
        !existingJob?.invoiceNumber
      ) {
        updateData.invoiceNumber =
          await getNextBillNumber();
      }
    }

    // =========================================
    // CLEAR DELIVERY DATE
    // IF JOB IS MOVED BACK
    // =========================================

    if (
      status !== "DELIVERED"
    ) {
      updateData.deliveryDate =
        null;
    }

    // =========================================
    // UPDATE REPAIR JOB
    // =========================================

    const job =
      await prisma.repairJob.update({
        where: {
          id,
        },
        data: updateData,
      });

      // =========================================
     // AUTOMATIC EXCEL BACKUP
    // =========================================

      triggerAutomaticExcelBackup();

    // =========================================
    // AUTOMATIC SMS — READY FOR DELIVERY
    // =========================================
    //
    // Send only when status changes
    // TO READY.
    //
    // Editing an already READY job
    // does not send another SMS.
    //
    // =========================================

    if (
      status === "READY" &&
      oldStatus !== "READY"
    ) {

      try {

       const completeJob =
  await prisma.repairJob.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
    },
  });

if (completeJob) {

  // ===============================================
  // CALCULATE CURRENT REPAIR FINANCIAL VALUES
  // ===============================================

  const repairParts =
    await prisma.repairPart.findMany({
      where: {
        repairJobId: completeJob.id,
      },
    });

  const payments =
    await prisma.payment.findMany({
      where: {
        repairJobId: completeJob.id,
      },
    });

  const partsTotal =
    repairParts.reduce(
      (sum: number, part: any) => {
        const quantity =
          Number(part?.quantity ?? 0);

        const unitPrice =
          Number(part?.price ?? 0);

        return (
          sum +
          Math.max(0, quantity) *
            Math.max(0, unitPrice)
        );
      },
      0
    );

  const diagnosisFee =
    Math.max(
      0,
      Number(
        completeJob.diagnosisFee ?? 0
      )
    );

  const labourCharge =
    Math.max(
      0,
      Number(
        completeJob.labourCharge ?? 0
      )
    );

  const discount =
    Math.max(
      0,
      Number(
        completeJob.discount ?? 0
      )
    );

  const estimateTotal =
    partsTotal +
    diagnosisFee +
    labourCharge;

  const finalTotal =
    Math.max(
      0,
      estimateTotal - discount
    );

  const advancePayment =
    Math.max(
      0,
      Number(
        completeJob.advanceAmount ?? 0
      )
    );

  const paymentsTotal =
    payments.reduce(
      (sum: number, payment: any) =>
        sum +
        Math.max(
          0,
          Number(
            payment?.amount ?? 0
          )
        ),
      0
    );

  const totalPaid =
    Math.max(
      0,
      advancePayment +
        paymentsTotal
    );

  const dueAmount =
    Math.max(
      0,
      finalTotal -
        totalPaid
    );

          await sendReadyForDeliverySms({
            id:
              completeJob.id,

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

            labourCharge:
              completeJob.labourCharge,

            diagnosisFee:
              completeJob.diagnosisFee,

            discount:
              completeJob.discount,


             totalAmount:
               finalTotal,

            advanceAmount:
              totalPaid,

           dueAmount:
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
          "SMS EVENT: READY_FOR_DELIVERY failed:",
          error?.message ||
            "Unable to send ready-for-delivery SMS."
        );

        // SMS failure must NEVER
        // cancel the status update.
      }
    }

    // =========================================
    // AUTOMATIC SMS — DELIVERED
    // =========================================
    //
    // Send only when status changes
    // TO DELIVERED.
    //
    // IMPORTANT:
    // Feedback Request SMS is NOT sent here.
    //
    // Feedback Request is a separate
    // manual action.
    //
    // =========================================

    if (
      status === "DELIVERED" &&
      oldStatus !== "DELIVERED"
    ) {

      try {

        const completeJob =
          await prisma.repairJob.findUnique({
            where: {
              id,
            },
            include: {
              customer: true,
            },
          });

        if (completeJob) {

          await sendDeliveredSms({
            id:
              completeJob.id,

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

            labourCharge:
              completeJob.labourCharge,

            diagnosisFee:
              completeJob.diagnosisFee,

            discount:
              completeJob.discount,

            totalAmount:
              completeJob.totalAmount,

            advanceAmount:
              completeJob.advanceAmount,

            dueAmount:
              completeJob.balanceAmount,

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
          "SMS EVENT: DELIVERED failed:",
          error?.message ||
            "Unable to send delivered SMS."
        );

        // SMS failure must NEVER
        // cancel the delivery update.
      }
    }

    // =========================================
    // RESPONSE
    // =========================================

    return res.json({
      success: true,
      data: job,
    });

  } catch (error) {

    console.error(
      "UPDATE REPAIR STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update repair status",
    });
  }
}

