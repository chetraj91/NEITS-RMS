import { randomBytes } from "crypto";
import { prisma } from "../config/prisma";

// =====================================================
// CREATE OR GET FEEDBACK REQUEST
// =====================================================

export async function createOrGetFeedbackRequest(
  repairJobId: string
) {
  // ===================================================
  // LOAD REPAIR JOB
  // ===================================================

  const job =
    await prisma.repairJob.findUnique({
      where: {
        id: repairJobId,
      },

      include: {
        customer: true,
      },
    });

  if (!job) {
    throw new Error(
      "Repair Job not found."
    );
  }

  // ===================================================
  // CUSTOMER VALIDATION
  // ===================================================

  if (!job.customer) {
    throw new Error(
      "No customer attached to this repair job."
    );
  }

  // ===================================================
  // FEEDBACK SETTINGS
  // ===================================================

  const settings =
    await prisma.feedbackSetting.findUnique({
      where: {
        id: "feedback",
      },
    });

  if (!settings) {
    throw new Error(
      "Feedback settings are not configured."
    );
  }

  if (!settings.enabled) {
    throw new Error(
      "Feedback system is disabled."
    );
  }

  const feedbackPageUrl =
    String(
      settings.feedbackPageUrl || ""
    ).trim();

  if (!feedbackPageUrl) {
    throw new Error(
      "Feedback Page URL is not configured."
    );
  }

  // ===================================================
  // FIND EXISTING FEEDBACK REQUEST
  // ===================================================

  let feedback =
    await prisma.customerFeedback.findUnique({
      where: {
        repairJobId,
      },
    });

  // ===================================================
  // CREATE FEEDBACK REQUEST IF NEEDED
  // ===================================================

  if (!feedback) {

    const token =
      randomBytes(32).toString("hex");

    feedback =
      await prisma.customerFeedback.create({
        data: {
          repairJobId:
            job.id,

          customerId:
            job.customer.id,

          token,
        },
      });
  }

  // ===================================================
  // BUILD FEEDBACK LINK
  // ===================================================

  const separator =
    feedbackPageUrl.includes("?")
      ? "&"
      : "?";

  const feedbackLink =
    `${feedbackPageUrl}${separator}token=${encodeURIComponent(
      feedback.token
    )}`;

  // ===================================================
  // RETURN
  // ===================================================

  return {
    feedback,
    feedbackLink,

    repairJob: {
      id:
        job.id,

      jobNumber:
        job.jobNumber,

      brand:
        job.brand,

      model:
        job.model,

      serialNumber:
        job.serialNumber,

      deviceType:
        job.deviceType,

      complaint:
        job.complaint,

      diagnosis:
        job.diagnosis,

      estimatedCost:
        job.estimatedCost,

      totalAmount:
        job.totalAmount,

      advanceAmount:
        job.advanceAmount,

      dueAmount:
        job.balanceAmount,

      customer: {
        id:
          job.customer.id,

        fullName:
          job.customer.fullName,

        phone:
          job.customer.phone,
      },
    },
  };
}