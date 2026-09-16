
import { Response } from "express";
import {
  searchSmsRecipients,
  sendCustomSms,
  SmsPartyType,
} from "../services/customSms.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../config/prisma";

// =====================================================
// SEARCH SMS RECIPIENTS
// =====================================================

export async function searchCustomSmsRecipients(
  req: AuthRequest,
  res: Response
) {
  try {
    const partyType = String(
      req.query.partyType || ""
    ).toUpperCase() as SmsPartyType;

    const search = String(
      req.query.search || ""
    ).trim();

    if (
      partyType !== "CUSTOMER" &&
      partyType !== "SUPPLIER"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid party type.",
      });
    }

    const recipients = await searchSmsRecipients(
      partyType,
      search
    );

    return res.json({
      success: true,
      partyType,
      recipients,
    });
  } catch (error: any) {
    console.error(
      "SEARCH CUSTOM SMS RECIPIENTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to search SMS recipients.",
    });
  }
}

// =====================================================
// CHECK BULK PERMISSION
// =====================================================

async function hasUserPermission(
  req: AuthRequest,
  permission: string
): Promise<boolean> {
  if (!req.user) {
    return false;
  }

  if (req.user.role === "Administrator") {
    return true;
  }

  const permissionRecord =
    await prisma.userPermission.findFirst({
      where: {
        userId: req.user.id,
        permission,
        enabled: true,
      },
      select: {
        id: true,
      },
    });

  return Boolean(permissionRecord);
}

// =====================================================
// SEND CUSTOM / BULK SMS
// =====================================================

export async function sendCustomSmsMessage(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

        const customSmsTemplate =
      await prisma.smsTemplate.findUnique({
        where: {
          code: "CUSTOM_MESSAGE",
        },
        select: {
          enabled: true,
        },
      });

    if (!customSmsTemplate?.enabled) {
      return res.status(403).json({
        success: false,
        message:
          "Custom SMS is currently disabled in SMS Templates settings.",
      });
    }

    const partyType = String(
      req.body?.partyType || ""
    ).toUpperCase() as SmsPartyType;

    const recipientIds = Array.isArray(
      req.body?.recipientIds
    )
      ? req.body.recipientIds
          .map((id: unknown) => String(id).trim())
          .filter(Boolean)
      : [];

    const message = String(
      req.body?.message || ""
    ).trim();

    if (
      partyType !== "CUSTOMER" &&
      partyType !== "SUPPLIER"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid party type.",
      });
    }

    if (recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one recipient must be selected.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "SMS message cannot be empty.",
      });
    }

    // =================================================
    // PERMISSION
    // =================================================

    const isBulk = recipientIds.length > 1;

    if (isBulk) {
      const allowed = await hasUserPermission(
        req,
        "messages.bulk-send"
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to send bulk SMS.",
          permission: "messages.bulk-send",
        });
      }
    } else {
      const allowed = await hasUserPermission(
        req,
        "messages.send-custom"
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to send custom SMS.",
          permission: "messages.send-custom",
        });
      }
    }

    // =================================================
    // SEND
    // =================================================

    const result = await sendCustomSms({
      partyType,
      recipientIds,
      message,
      userId: req.user.id,
    });

    return res.json(result);
  } catch (error: any) {
    console.error(
      "SEND CUSTOM SMS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to send custom SMS.",
    });
  }
}
