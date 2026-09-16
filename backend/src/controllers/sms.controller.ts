import { Request, Response } from "express";

import { prisma } from "../config/prisma";

import {
  getSmsSettings,
  testSociairConnection,
  sendSociairSms,
} from "../services/sms.service";

import {
  sendDueAmountSms,
  sendRepairDelayedSms as sendRepairDelayedSmsEvent,
  sendPartsRequiredSms,
  sendCustomerApprovalRequiredSms,
  sendFeedbackRequestSms,
} from "../services/smsEvent.service";

import {
  createOrGetFeedbackRequest,
} from "../services/feedback.service";

import {
  AuthRequest,
} from "../middleware/auth.middleware";

// =====================================================
// GET SMS SETTINGS
// =====================================================

export async function getSmsConfig(
  req: Request,
  res: Response
) {
  try {
    const settings =
      await getSmsSettings();

    if (!settings) {
      return res.json({
        success: true,
        data: {
          enabled: false,
          provider: "SOCIAIR",
          hasToken: false,
          senderId: "",
        },
      });
    }

    return res.json({
      success: true,
      data: {
        enabled: settings.enabled,
        provider: settings.provider,
        hasToken:
          Boolean(
            settings.apiToken
          ),
        senderId:
          settings.senderId || "",
        apiBaseUrl:
          settings.apiBaseUrl || "",
      },
    });
  } catch (error: any) {
    console.error(
      "GET SMS CONFIG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load SMS settings.",
    });
  }
}

// =====================================================
// UPDATE SMS SETTINGS
// =====================================================
//
// IMPORTANT:
// The actual API token is never returned
// to the frontend.
// =====================================================

export async function updateSmsConfig(
  req: AuthRequest,
  res: Response
) {
  try {
    // =================================================
    // TOKEN MANAGEMENT IS ADMINISTRATOR ONLY
    // =================================================

    if (
      req.body?.apiToken &&
      req.user?.role !== "Administrator"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only an Administrator can change the Sociair API token.",
      });
    }

    const {
      enabled,
      apiToken,
      senderId,
    } = req.body;

    const existing =
      await getSmsSettings();

    const updateData: any = {
      enabled:
        typeof enabled ===
        "boolean"
          ? enabled
          : existing?.enabled ??
            false,

      provider:
        "SOCIAIR",

      senderId:
        typeof senderId ===
        "string"
          ? senderId.trim() ||
            null
          : existing?.senderId ||
            null,
    };

    // Only replace the token when
    // a new token is actually supplied.
    if (
      typeof apiToken ===
        "string" &&
      apiToken.trim()
    ) {
      updateData.apiToken =
        apiToken.trim();
    }

    const settings =
      await prismaSmsSettingUpsert(
        updateData
      );

    return res.json({
      success: true,
      message:
        "SMS settings updated successfully.",
      data: {
        enabled:
          settings.enabled,

        provider:
          settings.provider,

        hasToken:
          Boolean(
            settings.apiToken
          ),

        senderId:
          settings.senderId || "",
      },
    });
  } catch (error: any) {
    console.error(
      "UPDATE SMS CONFIG ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update SMS settings.",
    });
  }
}

// =====================================================
// TEST SOCIAIR CONNECTION
// =====================================================

export async function testSmsConnection(
  req: Request,
  res: Response
) {
  try {
    const result =
      await testSociairConnection();

    return res.json({
      success: true,
      message:
        "Sociair connection successful.",
      data:
        result.balance,
    });
  } catch (error: any) {
    console.error(
      "TEST SMS CONNECTION ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to connect to Sociair.",
    });
  }
}

// =====================================================
// GET SOCIAIR BALANCE
// =====================================================

export async function getSmsBalance(
  req: Request,
  res: Response
) {
  try {
    const result =
      await testSociairConnection();

    return res.json({
      success: true,
      data:
        result.balance,
    });
  } catch (error: any) {
    console.error(
      "GET SMS BALANCE ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to retrieve Sociair balance.",
    });
  }
}

// =====================================================
// SEND TEST SMS
// =====================================================

export async function sendTestSms(
  req: Request,
  res: Response
) {
  try {
    const {
      mobile,
      message,
    } = req.body;

    if (
      !mobile ||
      !String(mobile).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Test mobile number is required.",
      });
    }

    if (
      !message ||
      !String(message).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Test SMS message is required.",
      });
    }

    const result =
      await sendSociairSms(
        String(mobile).trim(),
        String(message).trim()
      );

    return res.json({
      success: true,
      message:
        result?.message ||
        "Test SMS sent successfully.",
      data: {
        ntc:
          result?.ntc ?? 0,

        ncell:
          result?.ncell ?? 0,

        smartcell:
          result?.smartcell ?? 0,

        other:
          result?.other ?? 0,

        invalid_number:
          result?.invalid_number || [],
      },
    });
  } catch (error: any) {
    console.error(
      "SEND TEST SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send test SMS.",
    });
  }
}

// =====================================================
// SEND DUE AMOUNT REMINDER
// =====================================================

export async function sendDueAmountReminder(
  req: AuthRequest,
  res: Response
) {
  try {

    const id =
      String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Repair Job ID is required.",
      });
    }

    // ===============================================
    // LOAD COMPLETE REPAIR JOB
    // ===============================================

    const job =
      await prisma.repairJob.findUnique({
        where: {
          id,
        },

        include: {
          customer: true,
        },
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Repair Job not found.",
      });
    }

    // ===============================================
    // CHECK DUE AMOUNT
    // ===============================================

   const repairParts =
  await prisma.repairPart.findMany({
    where: {
      repairJobId: job.id,
    },
  });

const payments =
  await prisma.payment.findMany({
    where: {
      repairJobId: job.id,
    },
  });

const partsTotal =
  repairParts.reduce(
    (sum: number, part: any) => {
      const quantity = Number(part?.quantity ?? 0);
      const unitPrice = Number(part?.price ?? 0);

      return sum +
        Math.max(0, quantity) *
        Math.max(0, unitPrice);
    },
    0
  );

const diagnosisFee =
  Math.max(0, Number(job.diagnosisFee ?? 0));

const labourCharge =
  Math.max(0, Number(job.labourCharge ?? 0));

const discount =
  Math.max(0, Number(job.discount ?? 0));

const estimateTotal =
  partsTotal +
  diagnosisFee +
  labourCharge;

const finalTotal =
  Math.max(0, estimateTotal - discount);

const advancePayment =
  Math.max(0, Number(job.advanceAmount ?? 0));

const paymentsTotal =
  payments.reduce(
    (sum: number, payment: any) =>
      sum + Math.max(0, Number(payment?.amount ?? 0)),
    0
  );

const totalPaid =
  Math.max(0, advancePayment + paymentsTotal);

const dueAmount =
  Math.max(0, finalTotal - totalPaid);

    if (dueAmount <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "This repair job has no outstanding due amount.",
      });
    }

    // ===============================================
    // SEND SMS
    // ===============================================

    await sendDueAmountSms({

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
          finalTotal,

       advanceAmount:
           job.advanceAmount,

          paidAmount:
            totalPaid,

             dueAmount,

      customer:
        job.customer
          ? {
              id:
                job.customer.id,

              fullName:
                job.customer.fullName,

              phone:
                job.customer.phone,
            }
          : null,
    });

    return res.json({
      success: true,
      message:
        "Due amount reminder SMS sent successfully.",
    });

  } catch (error: any) {

    console.error(
      "SEND DUE AMOUNT SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send due amount reminder SMS.",
    });
  }
}

// =====================================================
// SEND REPAIR DELAYED SMS
// =====================================================

export async function sendRepairDelayedSms(
  req: AuthRequest,
  res: Response
) {
  try {

    const id =
      String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Repair Job ID is required.",
      });
    }

    // ===============================================
    // GET DELAY INFORMATION
    // ===============================================

    const {
      delayReason,
      expectedDate,
    } = req.body;

    if (
      !delayReason ||
      !String(delayReason).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Delay reason is required.",
      });
    }

    if (
      !expectedDate ||
      !String(expectedDate).trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Expected date is required.",
      });
    }

    // ===============================================
    // LOAD COMPLETE REPAIR JOB
    // ===============================================

    const job =
      await prisma.repairJob.findUnique({
        where: {
          id,
        },

        include: {
          customer: true,
        },
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Repair Job not found.",
      });
    }

    // ===============================================
    // SEND SMS
    // ===============================================

   const smsResult =
  await sendRepairDelayedSmsEvent({
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

      delayReason:
        String(delayReason).trim(),

      expectedDate:
        String(expectedDate).trim(),

      customer:
        job.customer
          ? {
              id:
                job.customer.id,

              fullName:
                job.customer.fullName,

              phone:
                job.customer.phone,
            }
          : null,
        });

    return res.json({
      success: true,
      message:
        smsResult,
    });

  } catch (error: any) {

    console.error(
      "SEND REPAIR DELAYED SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send repair delayed SMS.",
    });
  }
}

// =====================================================
// SEND PARTS REQUIRED SMS
// =====================================================

export async function sendPartsRequired(
  req: AuthRequest,
  res: Response
) {
  try {

    const id =
      String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Repair Job ID is required.",
      });
    }

    // ===============================================
    // LOAD COMPLETE REPAIR JOB
    // ===============================================

    const job =
      await prisma.repairJob.findUnique({
        where: {
          id,
        },

      include: {
      customer: true,
      parts: {
      include: {
      inventory: true,
      },
      orderBy: {
     createdAt: "asc",
    },
  },
},

      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Repair Job not found.",
      });
    }

    // ===============================================
    // SEND SMS
    // ===============================================

    const smsResult =
      await sendPartsRequiredSms(
        {
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

          customer:
            job.customer
              ? {
                  id:
                    job.customer.id,

                  fullName:
                    job.customer.fullName,

                  phone:
                    job.customer.phone,
                }
              : null,
        },

        job.parts
      );

    return res.json({
      success: true,
      message:
        smsResult,
    });

  } catch (error: any) {

    console.error(
      "SEND PARTS REQUIRED SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send parts required SMS.",
    });
  }
}
// =====================================================
// SEND CUSTOMER APPROVAL REQUIRED SMS
// =====================================================

export async function sendCustomerApprovalRequired(
  req: AuthRequest,
  res: Response
) {
  try {

    const id =
      String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Repair Job ID is required.",
      });
    }

    // ===============================================
    // LOAD COMPLETE REPAIR JOB
    // ===============================================

    const job =
      await prisma.repairJob.findUnique({
        where: {
          id,
        },

        include: {
          customer: true,
        },
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message:
          "Repair Job not found.",
      });
    }

    // ===============================================
    // SEND SMS
    // ===============================================

    const smsResult =
      await sendCustomerApprovalRequiredSms({
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

        customer:
          job.customer
            ? {
                id:
                  job.customer.id,

                fullName:
                  job.customer.fullName,

                phone:
                  job.customer.phone,
              }
            : null,
      });

    return res.json({
      success: true,
      message:
        smsResult,
    });

  } catch (error: any) {

    console.error(
      "SEND CUSTOMER APPROVAL SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send customer approval SMS.",
    });
  }
}


// =====================================================
// DATABASE UPSERT HELPER
// =====================================================

async function prismaSmsSettingUpsert(
  data: any
) {
  return prisma.smsSetting.upsert({
    where: {
      id: "sms",
    },

    create: {
      id: "sms",
      enabled:
        data.enabled ?? false,
      provider:
        "SOCIAIR",
      apiToken:
        data.apiToken || null,
      senderId:
        data.senderId || null,
    },

    update: {
      enabled:
        data.enabled ?? false,
      provider:
        "SOCIAIR",
      ...(data.apiToken
        ? {
            apiToken:
              data.apiToken,
          }
        : {}),
      senderId:
        data.senderId || null,
    },
  });
}

// =====================================================
// SEND FEEDBACK REQUEST SMS
// =====================================================

export async function sendFeedbackRequest(
  req: AuthRequest,
  res: Response
) {
  try {

    const id =
      String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Repair Job ID is required.",
      });
    }

        // ===============================================
    // PREVENT DUPLICATE FEEDBACK REQUEST SMS
    // ===============================================

    const existingSentSms =
      await prisma.smsMessageLog.findFirst({
        where: {
          repairJobId: id,
          templateCode: "FEEDBACK_REQUEST",
          status: "SENT",
        },
        select: {
          id: true,
        },
      });

    if (existingSentSms) {
      return res.json({
        success: true,
        alreadySent: true,
        message:
          "Feedback request has already been sent for this job.",
      });
    }

    // ===============================================
    // CREATE OR GET FEEDBACK REQUEST
    // ===============================================

    const feedbackRequest =
      await createOrGetFeedbackRequest(
        id
      );

    const job =
      feedbackRequest.repairJob;

    // ===============================================
    // SEND SMS
    // ===============================================

    const smsResult =
      await sendFeedbackRequestSms({
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
          job.dueAmount,

        feedbackLink:
          feedbackRequest.feedbackLink,

        customer:
          job.customer
            ? {
                id:
                  job.customer.id,

                fullName:
                  job.customer.fullName,

                phone:
                  job.customer.phone,
              }
            : null,
      });

    return res.json({
      success: true,
      message:
        smsResult,
      feedbackLink:
        feedbackRequest.feedbackLink,
    });

  } catch (error: any) {

    console.error(
      "SEND FEEDBACK REQUEST SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send feedback request SMS.",
    });
  }
}

// =====================================================
// GET FEEDBACK REQUEST STATUS
// =====================================================

export async function getFeedbackRequestStatus(
  req: AuthRequest,
  res: Response
) {
  try {
    const id = String(req.params.id || "").trim();

    if (!id) {
      return res.status(400).json({
        success: false,
        alreadySent: false,
        message: "Repair Job ID is required.",
      });
    }

    const existingSentSms =
      await prisma.smsMessageLog.findFirst({
        where: {
          repairJobId: id,
          templateCode: "FEEDBACK_REQUEST",
          status: "SENT",
        },
        select: {
          id: true,
        },
      });

    return res.json({
      success: true,
      alreadySent: Boolean(existingSentSms),
    });

  } catch (error: any) {

    console.error(
      "GET FEEDBACK REQUEST STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      alreadySent: false,
      message:
        "Unable to check feedback request status.",
    });
  }
}

// =====================================================
// SMS HISTORY
// =====================================================

export async function getSmsHistory(
  req: AuthRequest,
  res: Response
) {
  try {
    const page = Math.max(
      Number.parseInt(String(req.query.page || "1"), 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(String(req.query.limit || "20"), 10) || 20,
        1
      ),
      100
    );

    const search = String(
      req.query.search || ""
    ).trim();

    const partyType = String(
      req.query.partyType || "ALL"
    ).toUpperCase();

    const status = String(
      req.query.status || "ALL"
    ).toUpperCase();

    if (
      !["ALL", "CUSTOMER", "SUPPLIER"].includes(
        partyType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid party type.",
      });
    }

    if (
      !["ALL", "SENT", "FAILED", "PENDING"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid SMS status.",
      });
    }

    const where: any = {};

    // -------------------------------------------------
    // PARTY TYPE FILTER
    // -------------------------------------------------

    if (partyType === "CUSTOMER") {
      where.customerId = {
        not: null,
      };
    }

    if (partyType === "SUPPLIER") {
      where.supplierId = {
        not: null,
      };
    }

    // -------------------------------------------------
    // STATUS FILTER
    // -------------------------------------------------

    if (status !== "ALL") {
      where.status = status;
    }

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------

    if (search) {
      where.OR = [
        {
          phone: {
            contains: search,
          },
        },
        {
          message: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          customer: {
            is: {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          customer: {
            is: {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          supplier: {
            is: {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          supplier: {
            is: {
              contactPerson: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          user: {
            is: {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const skip = (page - 1) * limit;

    const [
      messages,
      total,
    ] = await Promise.all([
      prisma.smsMessageLog.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              customerCode: true,
            },
          },
          supplier: {
            select: {
              id: true,
              companyName: true,
              contactPerson: true,
              supplierCode: true,
            },
          },
          user: {
          select: {
          id: true,
          fullName: true,
          username: true,
          },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.smsMessageLog.count({
        where,
      }),
    ]);

    const totalPages =
      Math.ceil(total / limit);

    return res.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error(
      "GET SMS HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load SMS history.",
    });
  }
}