
import { prisma } from "../config/prisma";
import { sendSociairSms } from "./sms.service";

// =====================================================
// TYPES
// =====================================================

export type SmsPartyType = "CUSTOMER" | "SUPPLIER";

export interface CustomSmsRecipientInput {
  id: string;
  partyType: SmsPartyType;
}

export interface SendCustomSmsInput {
  partyType: SmsPartyType;
  recipientIds: string[];
  message: string;
  userId: string;
}

// =====================================================
// SEARCH RECIPIENTS
// =====================================================

export async function searchSmsRecipients(
  partyType: SmsPartyType,
  search: string
) {
  const query = String(search || "").trim();

  if (partyType === "CUSTOMER") {
    return prisma.customer.findMany({
      where: query
        ? {
            OR: [
              {
                fullName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                phone: {
                  contains: query,
                },
              },
              {
                customerCode: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                companyName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : undefined,
      select: {
        id: true,
        fullName: true,
        companyName: true,
        phone: true,
        customerCode: true,
      },
      orderBy: {
        fullName: "asc",
      },
      take: 50,
    });
  }

  return prisma.supplier.findMany({
    where: query
      ? {
          OR: [
            {
              companyName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              contactPerson: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: query,
              },
            },
            {
              supplierCode: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
    select: {
      id: true,
      companyName: true,
      contactPerson: true,
      phone: true,
      supplierCode: true,
    },
    orderBy: {
      companyName: "asc",
    },
    take: 50,
  });
}

// =====================================================
// SEND CUSTOM / BULK SMS
// =====================================================

export async function sendCustomSms(
  input: SendCustomSmsInput
) {
  const partyType = input.partyType;
  const recipientIds = [
    ...new Set(
      (input.recipientIds || [])
        .map((id) => String(id).trim())
        .filter(Boolean)
    ),
  ];

  const message = String(input.message || "").trim();
  const userId = String(input.userId || "").trim();

  if (!userId) {
    throw new Error("Authenticated user is required.");
  }

  if (
    partyType !== "CUSTOMER" &&
    partyType !== "SUPPLIER"
  ) {
    throw new Error("Invalid party type.");
  }

  if (recipientIds.length === 0) {
    throw new Error("At least one recipient must be selected.");
  }

  if (!message) {
    throw new Error("SMS message cannot be empty.");
  }

  if (message.length > 1000) {
    throw new Error("SMS message is too long.");
  }

  // ===================================================
  // LOAD RECIPIENTS
  // ===================================================

  type Recipient = {
    id: string;
    phone: string | null;
    name: string;
  };

  let recipients: Recipient[] = [];

  if (partyType === "CUSTOMER") {
    const customers =
      await prisma.customer.findMany({
        where: {
          id: {
            in: recipientIds,
          },
        },
        select: {
          id: true,
          fullName: true,
          companyName: true,
          phone: true,
        },
      });

    recipients = customers.map((customer) => ({
      id: customer.id,
      phone: customer.phone,
      name:
        customer.fullName ||
        customer.companyName ||
        "Customer",
    }));
  } else {
    const suppliers =
      await prisma.supplier.findMany({
        where: {
          id: {
            in: recipientIds,
          },
        },
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          phone: true,
        },
      });

    recipients = suppliers.map((supplier) => ({
      id: supplier.id,
      phone: supplier.phone,
      name:
        supplier.companyName ||
        supplier.contactPerson ||
        "Supplier",
    }));
  }

  if (recipients.length !== recipientIds.length) {
    throw new Error(
      "One or more selected recipients could not be found."
    );
  }

  // ===================================================
  // CAMPAIGN
  // ===================================================

  const campaign =
    await prisma.smsCampaign.create({
      data: {
        name:
          partyType === "CUSTOMER"
            ? "Custom SMS - Customers"
            : "Custom SMS - Suppliers",
        message,
        status: "SENDING",
        totalRecipients: recipients.length,
        createdById: userId,
        startedAt: new Date(),
      },
    });

  let sentCount = 0;
  let failedCount = 0;

  // ===================================================
  // SEND ONE BY ONE
  // ===================================================

  for (const recipient of recipients) {
    const phone =
      String(recipient.phone || "").trim();

    const campaignRecipient =
      await prisma.smsCampaignRecipient.create({
        data: {
          campaignId: campaign.id,
          customerId:
            partyType === "CUSTOMER"
              ? recipient.id
              : null,
          supplierId:
            partyType === "SUPPLIER"
              ? recipient.id
              : null,
          phone,
          customerName: recipient.name,
          status: "PENDING",
        },
      });

    let providerMessageId: string | null = null;
    let providerResponse: string | null = null;

    try {
      if (!phone) {
        throw new Error(
          "Recipient does not have a phone number."
        );
      }

      const response =
        await sendSociairSms(
          phone,
          message
        );

      providerMessageId =
        response?.message
          ? String(response.message)
          : null;

      providerResponse =
        JSON.stringify(response);

      await prisma.smsCampaignRecipient.update({
        where: {
          id: campaignRecipient.id,
        },
        data: {
          status: "SENT",
          providerMessageId,
          providerResponse,
          sentAt: new Date(),
        },
      });

      await prisma.smsMessageLog.create({
        data: {
          customerId:
            partyType === "CUSTOMER"
              ? recipient.id
              : null,
          supplierId:
            partyType === "SUPPLIER"
              ? recipient.id
              : null,
          userId,
          phone,
          message,
          templateCode: "CUSTOM_SMS",
          provider: "SOCIAIR",
          status: "SENT",
          providerMessageId,
          providerResponse,
          sentAt: new Date(),
        },
      });

      sentCount++;
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        "Unable to send SMS.";

      await prisma.smsCampaignRecipient.update({
        where: {
          id: campaignRecipient.id,
        },
        data: {
          status: "FAILED",
          errorMessage,
          providerMessageId,
          providerResponse,
        },
      });

      await prisma.smsMessageLog.create({
        data: {
          customerId:
            partyType === "CUSTOMER"
              ? recipient.id
              : null,
          supplierId:
            partyType === "SUPPLIER"
              ? recipient.id
              : null,
          userId,
          phone,
          message,
          templateCode: "CUSTOM_SMS",
          provider: "SOCIAIR",
          status: "FAILED",
          providerMessageId,
          providerResponse,
          errorMessage,
        },
      });

      failedCount++;
    }
  }

  // ===================================================
  // COMPLETE CAMPAIGN
  // ===================================================

  const finalStatus =
    failedCount === recipients.length
      ? "FAILED"
      : failedCount > 0
        ? "COMPLETED_WITH_ERRORS"
        : "COMPLETED";

  const completedCampaign =
    await prisma.smsCampaign.update({
      where: {
        id: campaign.id,
      },
      data: {
        status: finalStatus,
        sentCount,
        failedCount,
        completedAt: new Date(),
      },
    });

  return {
    success: sentCount > 0,
    campaignId: completedCampaign.id,
    totalRecipients: recipients.length,
    sentCount,
    failedCount,
    status: finalStatus,
  };
}
