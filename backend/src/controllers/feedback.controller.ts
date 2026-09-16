import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// =====================================================
// GET PUBLIC FEEDBACK
// =====================================================

export async function getPublicFeedback(
  req: Request,
  res: Response
) {
  try {
    const token =
      String(req.params.token || "").trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Feedback token is required.",
      });
    }

    const feedback =
      await prisma.customerFeedback.findUnique({
        where: {
          token,
        },
        include: {
          repairJob: {
            select: {
              jobNumber: true,
              brand: true,
              model: true,
              deviceType: true,
            },
          },
          customer: {
            select: {
              fullName: true,
            },
          },
        },
      });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired feedback link.",
      });
    }

    // Do not expose the token or private customer information.
    return res.json({
      success: true,
      data: {
        jobNumber:
          feedback.repairJob.jobNumber,

        customerName:
          feedback.customer.fullName,

        deviceType:
          feedback.repairJob.deviceType,

        brand:
          feedback.repairJob.brand,

        model:
          feedback.repairJob.model,

        rating:
          feedback.rating,

        comment:
          feedback.comment,

        submittedAt:
          feedback.submittedAt,
      },
    });

  } catch (error: any) {

    console.error(
      "GET PUBLIC FEEDBACK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load feedback.",
    });
  }
}

// =====================================================
// SUBMIT PUBLIC FEEDBACK
// =====================================================

export async function submitPublicFeedback(
  req: Request,
  res: Response
) {
  try {

    const token =
      String(req.params.token || "").trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Feedback token is required.",
      });
    }

    // ===============================================
    // VALIDATE RATING
    // ===============================================

    const rating =
      Number(req.body.rating);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be an integer between 1 and 5.",
      });
    }

    // ===============================================
    // COMMENT
    // ===============================================

    const comment =
      typeof req.body.comment === "string"
        ? req.body.comment.trim()
        : null;

    // ===============================================
    // FIND FEEDBACK
    // ===============================================

    const feedback =
      await prisma.customerFeedback.findUnique({
        where: {
          token,
        },
      });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired feedback link.",
      });
    }

    // ===============================================
    // PREVENT DUPLICATE SUBMISSION
    // ===============================================

    if (feedback.submittedAt) {
      return res.status(409).json({
        success: false,
        message:
          "Feedback has already been submitted.",
        data: {
          rating:
            feedback.rating,
          comment:
            feedback.comment,
          submittedAt:
            feedback.submittedAt,
        },
      });
    }

    // ===============================================
    // SAVE FEEDBACK
    // ===============================================

    const updatedFeedback =
      await prisma.customerFeedback.update({
        where: {
          id: feedback.id,
        },

        data: {
          rating,
          comment:
            comment || null,
          submittedAt:
            new Date(),
        },

        select: {
          id: true,
          rating: true,
          comment: true,
          submittedAt: true,
        },
      });

    return res.json({
      success: true,
      message:
        "Thank you for your feedback.",
      data: updatedFeedback,
    });

  } catch (error: any) {

    console.error(
      "SUBMIT PUBLIC FEEDBACK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to submit feedback.",
    });
  }
}