import { prisma } from "../config/prisma";
import { sendSociairSms } from "./sms.service";

// =====================================================
// TYPES
// =====================================================

interface RepairJobForSms {
  id: string;
  jobNumber: string;
  brand: string;
  model: string;
  serialNumber: string | null;
  deviceType: string;
  complaint: string;
  diagnosis?: string | null;

   estimatedCost?: number | null;
  labourCharge?: number | null;
  diagnosisFee?: number | null;
  discount?: number | null; 
  totalAmount?: number | null;
  advanceAmount?: number | null;
  dueAmount?: number | null;
  paymentAmount?: number | null;
  paidAmount?: number | null;

delayReason?: string | null;
expectedDate?: string | null;

requiredParts?: string | null;

approvalDetails?: string | null;

feedbackLink?: string | null;

customMessage?: string | null;

  customer: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
}

interface RepairPartForSms {
  quantity: number;
  inventory: {
    itemName: string;
  } | null;
}

// =====================================================
// TEMPLATE VARIABLE REPLACEMENT
// =====================================================

function replaceVariables(
  template: string,
  job: RepairJobForSms
): string {
  const customer = job.customer;

  const variables: Record<string, string> = {
    "{customerName}":
      customer?.fullName || "",

    "{customerPhone}":
      customer?.phone || "",

    "{jobNumber}":
      job.jobNumber || "",

    "{deviceType}":
      job.deviceType || "",

    "{brand}":
      job.brand || "",

    "{model}":
      job.model || "",

    "{serialNumber}":
      job.serialNumber || "",

    "{complaint}":
      job.complaint || "",

      "{diagnosis}":
       job.diagnosis || "",

       "{estimatedCost}":
      String(job.estimatedCost ?? 0),

        "{totalAmount}":
      String(job.totalAmount ?? 0),

    "{discount}":
      String(job.discount ?? 0),

    "{finalBill}":
      String(job.totalAmount ?? 0),

    "{advanceAmount}":
      String(job.advanceAmount ?? 0),

    "{totalPaid}":
      String(job.paidAmount ?? 0),

    "{dueAmount}":
      String(job.dueAmount ?? 0),

    "{paymentAmount}":
      String(job.paymentAmount ?? 0),

    "{paidAmount}":
      String(job.paidAmount ?? 0),

      "{delayReason}":
       job.delayReason || "",

       "{expectedDate}":
       job.expectedDate || "",

      "{requiredParts}":
      job.requiredParts || "",

      "{feedbackLink}":
      job.feedbackLink || "",

      };


  let message = template;

  for (const [variable, value] of Object.entries(
    variables
  )) {
    message = message.replaceAll(
      variable,
      value
    );
  }

  return message.trim();
}

// =====================================================
// CHECK UNRESOLVED VARIABLES
// =====================================================

function findUnresolvedVariables(
  message: string
): string[] {
  const matches =
    message.match(
      /\{[a-zA-Z0-9_]+\}/g
    );

  return matches
    ? [...new Set(matches)]
    : [];
}

// =====================================================
// SEND JOB RECEIVED SMS
// =====================================================

export async function sendJobReceivedSms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: JOB_RECEIVED"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET JOB RECEIVED TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "JOB_RECEIVED",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: JOB_RECEIVED template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: JOB_RECEIVED template disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId: job.id,
        templateCode:
          "JOB_RECEIVED",
        status: "SENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingSuccess) {
    console.log(
      "SMS EVENT: JOB_RECEIVED already sent for this job. SMS skipped."
    );

    return;
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "JOB_RECEIVED",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "JOB_RECEIVED",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending JOB_RECEIVED SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id: log.id,
      },

      data: {
        status: "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: JOB_RECEIVED SMS sent successfully."
    );

  } catch (error: any) {

    // =================================================
    // UPDATE FAILURE
    // =================================================

    const errorMessage =
      error?.message ||
      "Unable to send SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id: log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: JOB_RECEIVED SMS failed:",
      errorMessage
    );

    // IMPORTANT:
    // Do NOT throw the error.
    //
    // SMS failure must never cancel
    // a successfully created repair job.
  }
}// =====================================================
// SEND JOB DIAGNOSIS SMS
// =====================================================

export async function sendJobDiagnosisSms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: JOB_DIAGNOSIS"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  const diagnosis =
    String(
      job.diagnosis || ""
    ).trim();

  if (!diagnosis) {
    console.log(
      "SMS EVENT: Diagnosis is empty. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "JOB_DIAGNOSIS",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: JOB_DIAGNOSIS template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: JOB_DIAGNOSIS template disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId: job.id,
        templateCode:
          "JOB_DIAGNOSIS",
        status: "SENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingSuccess) {
    console.log(
      "SMS EVENT: JOB_DIAGNOSIS already sent for this job. SMS skipped."
    );

    return;
  }
// ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "JOB_DIAGNOSIS",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "JOB_DIAGNOSIS",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending JOB_DIAGNOSIS SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id: log.id,
      },

      data: {
        status: "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: JOB_DIAGNOSIS SMS sent successfully."
    );

  } catch (error: any) {

    // =================================================
    // UPDATE FAILURE
    // =================================================

    const errorMessage =
      error?.message ||
      "Unable to send SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id: log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: JOB_DIAGNOSIS SMS failed:",
      errorMessage
    );

    // IMPORTANT:
    // Never throw.
    //
    // SMS failure must never cancel
    // the successfully saved diagnosis.
  }
}

// =====================================================
// SEND ESTIMATE SMS
// =====================================================

export async function sendEstimateSms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: ESTIMATE"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "ESTIMATE",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: ESTIMATE template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: ESTIMATE template disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated estimate message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "ESTIMATE",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  // ===================================================
  //
  // Do not send the exact same estimate message twice.
  //

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "ESTIMATE",

        status:
          "SENT",

        message:
          smsMessage,
      },
    });

  if (existingSuccess) {
    console.log(
      "SMS EVENT: Same ESTIMATE SMS already sent. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "ESTIMATE",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending ESTIMATE SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: ESTIMATE SMS sent successfully."
    );

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send estimate SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: ESTIMATE SMS failed:",
      errorMessage
    );

    // SMS failure must NEVER
    // cancel the repair-job update.
  }
}

// =====================================================
// SEND READY FOR DELIVERY SMS
// =====================================================

export async function sendReadyForDeliverySms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: READY_FOR_DELIVERY"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "READY_FOR_DELIVERY",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: READY_FOR_DELIVERY template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: READY_FOR_DELIVERY template disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated ready-for-delivery message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "READY_FOR_DELIVERY",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "READY_FOR_DELIVERY",

        status:
          "SENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingSuccess) {
    console.log(
      "SMS EVENT: READY_FOR_DELIVERY SMS already sent. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "READY_FOR_DELIVERY",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending READY_FOR_DELIVERY SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: READY_FOR_DELIVERY SMS sent successfully."
    );

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send ready-for-delivery SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: READY_FOR_DELIVERY SMS failed:",
      errorMessage
    );

    // SMS failure must NEVER
    // cancel the status update.
  }
}
// =====================================================
// SEND DELIVERED SMS
// =====================================================

export async function sendDeliveredSms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: DELIVERED"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "DELIVERED",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: DELIVERED template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: DELIVERED template disabled. SMS skipped."
    );

    return;
  }
  // ===================================================
  // CALCULATE DELIVERED SMS FINANCIAL VALUES
  //
  // Match RepairJobDetailsPage:
  //
  // Parts + Labour + Diagnosis Fee - Discount = Final Bill
  // Advance + Payment Records = Total Paid
  // Final Bill - Total Paid = Due
  // ===================================================

  const repairParts =
    await prisma.repairPart.findMany({
      where: {
        repairJobId: job.id,
      },
      include: {
        inventory: true,
      },
    });

  const payments =
    await prisma.payment.findMany({
      where: {
        repairJobId: job.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

  const partsTotal =
    repairParts.reduce(
      (sum: number, part: any) => {
        const quantity =
          Number(part?.quantity ?? 0);

        const unitPrice =
          Number(
            part?.price ??
              part?.unitPrice ??
              part?.sellingPrice ??
              part?.inventory?.sellingPrice ??
              part?.inventory?.price ??
              0
          );

        return (
          sum +
          Math.max(0, quantity) *
            Math.max(0, unitPrice)
        );
      },
      0
    );

  const labourCharge =
    Math.max(
      0,
      Number(job?.labourCharge ?? 0)
    );

  const diagnosisFee =
    Math.max(
      0,
      Number(job?.diagnosisFee ?? 0)
    );

  const discount =
    Math.max(
      0,
      Number(job?.discount ?? 0)
    );

  const estimateTotal =
    partsTotal +
    labourCharge +
    diagnosisFee;

  const finalTotal =
    Math.max(
      0,
      estimateTotal - discount
    );

  const advancePayment =
    Math.max(
      0,
      Number(job?.advanceAmount ?? 0)
    );

  const paymentsTotal =
    payments.reduce(
      (sum: number, payment: any) =>
        sum +
        Math.max(
          0,
          Number(payment?.amount ?? 0)
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
      finalTotal - totalPaid
    );

  const smsJob: RepairJobForSms = {
    ...job,

    totalAmount:
      finalTotal,

    advanceAmount:
      advancePayment,

    paidAmount:
      totalPaid,

    dueAmount:
      dueAmount,
  };

  console.log(
    "SMS EVENT: DELIVERED financial calculation:",
    {
      jobNumber: job.jobNumber,
      partsTotal,
      labourCharge,
      diagnosisFee,
      discount,
      estimateTotal,
      finalTotal,
      advancePayment,
      paymentsTotal,
      totalPaid,
      dueAmount,
    }
  );

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      smsJob
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated delivered message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "DELIVERED",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "DELIVERED",

        status:
          "SENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  if (existingSuccess) {
    console.log(
      "SMS EVENT: DELIVERED SMS already sent. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "DELIVERED",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending DELIVERED SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: DELIVERED SMS sent successfully."
    );

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send delivered SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: DELIVERED SMS failed:",
      errorMessage
    );

    // SMS failure must NEVER
    // cancel the delivery update.
  }
}
// =====================================================
// SEND PAYMENT RECEIVED SMS
// =====================================================

export async function sendPaymentReceivedSms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: PAYMENT_RECEIVED"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "PAYMENT_RECEIVED",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: PAYMENT_RECEIVED template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: PAYMENT_RECEIVED template disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated payment message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "PAYMENT_RECEIVED",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "PAYMENT_RECEIVED",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending PAYMENT_RECEIVED SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: PAYMENT_RECEIVED SMS sent successfully."
    );

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send payment received SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });




    console.error(
      "SMS EVENT: PAYMENT_RECEIVED SMS failed:",
      errorMessage
    );

    // SMS failure must NEVER
    // cancel the successful payment.
  }
}

// =====================================================
// SEND DUE AMOUNT SMS
// =====================================================

export async function sendDueAmountSms(
  job: RepairJobForSms
): Promise<void> {

  console.log(
    "SMS EVENT: DUE_AMOUNT"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return;
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return;
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return;
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "DUE_AMOUNT",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: DUE_AMOUNT template not found."
    );

    return;
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: DUE_AMOUNT template disabled. SMS skipped."
    );

    return;
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated due amount message is empty."
    );

    return;
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "DUE_AMOUNT",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return;
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "DUE_AMOUNT",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending DUE_AMOUNT SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: DUE_AMOUNT SMS sent successfully."
    );

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send due amount SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: DUE_AMOUNT SMS failed:",
      errorMessage
    );

    // SMS failure must NEVER
    // affect the repair job.
  }
}

// =====================================================
// SEND REPAIR DELAYED SMS
// =====================================================

export async function sendRepairDelayedSms(
  job: RepairJobForSms
): Promise<string> {

  console.log(
    "SMS EVENT: REPAIR_DELAYED"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

   return "No customer attached to repair job. SMS skipped.";
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

   return "Customer has no phone number. SMS skipped.";
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return "SMS settings not configured. SMS skipped.";
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return "SMS service is disabled. SMS skipped.";
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "REPAIR_DELAYED",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: REPAIR_DELAYED template not found."
    );

    return "REPAIR_DELAYED SMS template not found.";
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: REPAIR_DELAYED template disabled. SMS skipped."
    );

   return "REPAIR_DELAYED SMS template is disabled. SMS skipped.";
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated repair delayed message is empty."
    );

   return "Generated repair delayed SMS message is empty.";
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "REPAIR_DELAYED",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return errorMessage;
  }

    // ===================================================
  // DUPLICATE PROTECTION
  //
  // Allow another SMS if the reason or expected date
  // has changed.
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "REPAIR_DELAYED",

        status:
          "SENT",

        message:
          smsMessage,
      },
    });

  if (existingSuccess) {
    console.log(
      "SMS EVENT: REPAIR_DELAYED with same message already sent. SMS skipped."
    );

   return "Repair delayed SMS already sent. Same message skipped.";
  }


  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "REPAIR_DELAYED",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending REPAIR_DELAYED SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: REPAIR_DELAYED SMS sent successfully."
    );
    return "Repair delayed SMS sent successfully.";

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send repair delayed SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: REPAIR_DELAYED SMS failed:",
      errorMessage
    );

    // SMS failure must NEVER
    // affect the repair job.
    return `Repair delayed SMS failed: ${errorMessage}`;
  }
}
// =====================================================
// SEND PARTS REQUIRED SMS
// =====================================================

export async function sendPartsRequiredSms(
  job: RepairJobForSms,
  parts: RepairPartForSms[]
): Promise<string> {

  console.log(
    "SMS EVENT: PARTS_REQUIRED"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return "No customer attached to repair job. SMS skipped.";
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return "Customer has no phone number. SMS skipped.";
  }

  // ===================================================
  // CHECK PARTS
  // ===================================================

  if (!parts || parts.length === 0) {
    console.log(
      "SMS EVENT: No repair parts found. SMS skipped."
    );

    return "No parts are available for this repair job.";
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return "SMS settings not configured. SMS skipped.";
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return "SMS service is disabled. SMS skipped.";
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code: "PARTS_REQUIRED",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: PARTS_REQUIRED template not found."
    );

    return "PARTS_REQUIRED SMS template not found.";
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: PARTS_REQUIRED template disabled. SMS skipped."
    );

    return "PARTS_REQUIRED SMS template is disabled. SMS skipped.";
  }

  // ===================================================
  // BUILD REQUIRED PARTS LIST
  // ===================================================

  const requiredParts =
    parts
      .map(
        (part) => {

          const itemName =
            String(
              part.inventory?.itemName ||
                "Unknown Part"
            ).trim();

          const quantity =
            Number(
              part.quantity || 0
            );

          return `${itemName} (Qty: ${quantity})`;
        }
      )
      .join(", ");

  if (!requiredParts) {
    console.error(
      "SMS EVENT: Required parts list is empty."
    );

    return "Required parts list is empty.";
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsJob: RepairJobForSms = {
    ...job,
    requiredParts,
  };

  const smsMessage =
    replaceVariables(
      template.message,
      smsJob
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated parts required message is empty."
    );

    return "Generated parts required SMS message is empty.";
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "PARTS_REQUIRED",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return errorMessage;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  //
  // Same job + same generated message:
  // do not send again.
  //
  // If the parts list changes:
  // generated message changes, so another SMS
  // is allowed.
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "PARTS_REQUIRED",

        status:
          "SENT",

        message:
          smsMessage,
      },
    });

  if (existingSuccess) {

    console.log(
      "SMS EVENT: PARTS_REQUIRED with same message already sent. SMS skipped."
    );

    return "Parts required SMS already sent. Same message skipped.";
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "PARTS_REQUIRED",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending PARTS_REQUIRED SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: PARTS_REQUIRED SMS sent successfully."
    );

    return "Parts required SMS sent successfully.";

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send parts required SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: PARTS_REQUIRED SMS failed:",
      errorMessage
    );

    return `Parts required SMS failed: ${errorMessage}`;
  }
}
// =====================================================
// SEND CUSTOMER APPROVAL REQUIRED SMS
// =====================================================

export async function sendCustomerApprovalRequiredSms(
  job: RepairJobForSms
): Promise<string> {

  console.log(
    "SMS EVENT: CUSTOMER_APPROVAL_REQUIRED"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return "No customer attached to repair job. SMS skipped.";
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return "Customer has no phone number. SMS skipped.";
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return "SMS settings not configured. SMS skipped.";
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return "SMS service is disabled. SMS skipped.";
  }

  // ===================================================
  // GET TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code:
          "CUSTOMER_APPROVAL_REQUIRED",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: CUSTOMER_APPROVAL_REQUIRED template not found."
    );

    return "Customer approval SMS template not found.";
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: CUSTOMER_APPROVAL_REQUIRED template disabled. SMS skipped."
    );

    return "Customer approval SMS template is disabled. SMS skipped.";
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated customer approval message is empty."
    );

    return "Generated customer approval SMS message is empty.";
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "CUSTOMER_APPROVAL_REQUIRED",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return errorMessage;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  //
  // Same job + same generated message:
  // do not send again.
  //
  // If estimate/total changes, the generated
  // message changes and another SMS is allowed.
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "CUSTOMER_APPROVAL_REQUIRED",

        status:
          "SENT",

        message:
          smsMessage,
      },
    });

  if (existingSuccess) {

    console.log(
      "SMS EVENT: CUSTOMER_APPROVAL_REQUIRED with same message already sent. SMS skipped."
    );

    return "Customer approval SMS already sent. Same message skipped.";
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "CUSTOMER_APPROVAL_REQUIRED",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending CUSTOMER_APPROVAL_REQUIRED SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: CUSTOMER_APPROVAL_REQUIRED SMS sent successfully."
    );

    return "Customer approval SMS sent successfully.";

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send customer approval SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: CUSTOMER_APPROVAL_REQUIRED SMS failed:",
      errorMessage
    );

    return `Customer approval SMS failed: ${errorMessage}`;
  }
}

// =====================================================
// SEND FEEDBACK REQUEST SMS
// =====================================================

export async function sendFeedbackRequestSms(
  job: RepairJobForSms
): Promise<string> {

  console.log(
    "SMS EVENT: FEEDBACK_REQUEST"
  );

  console.log(
    "SMS EVENT: Job:",
    job.jobNumber
  );

  // ===================================================
  // BASIC VALIDATION
  // ===================================================

  if (!job.customer) {
    console.log(
      "SMS EVENT: No customer attached to job. SMS skipped."
    );

    return "No customer attached to repair job. SMS skipped.";
  }

  const phone =
    String(
      job.customer.phone || ""
    ).trim();

  if (!phone) {
    console.log(
      "SMS EVENT: Customer has no phone number. SMS skipped."
    );

    return "Customer has no phone number. SMS skipped.";
  }

  // ===================================================
  // FEEDBACK LINK VALIDATION
  // ===================================================

  const feedbackLink =
    String(
      job.feedbackLink || ""
    ).trim();

  if (!feedbackLink) {
    console.log(
      "SMS EVENT: Feedback link is missing. SMS skipped."
    );

    return "Feedback link is missing. SMS skipped.";
  }

  // ===================================================
  // CHECK SMS SETTINGS
  // ===================================================

  const settings =
    await prisma.smsSetting.findUnique({
      where: {
        id: "sms",
      },
    });

  if (!settings) {
    console.log(
      "SMS EVENT: SMS settings not configured. SMS skipped."
    );

    return "SMS settings not configured. SMS skipped.";
  }

  if (!settings.enabled) {
    console.log(
      "SMS EVENT: SMS service disabled. SMS skipped."
    );

    return "SMS service is disabled. SMS skipped.";
  }

  // ===================================================
  // GET FEEDBACK SMS TEMPLATE
  // ===================================================

  const template =
    await prisma.smsTemplate.findUnique({
      where: {
        code:
          "FEEDBACK_REQUEST",
      },
    });

  if (!template) {
    console.error(
      "SMS EVENT: FEEDBACK_REQUEST template not found."
    );

    return "Feedback request SMS template not found.";
  }

  // ===================================================
  // CHECK TEMPLATE ENABLED
  // ===================================================

  if (!template.enabled) {
    console.log(
      "SMS EVENT: FEEDBACK_REQUEST template disabled. SMS skipped."
    );

    return "Feedback request SMS template is disabled. SMS skipped.";
  }

  // ===================================================
  // BUILD MESSAGE
  // ===================================================

  const smsMessage =
    replaceVariables(
      template.message,
      job
    );

  if (!smsMessage) {
    console.error(
      "SMS EVENT: Generated feedback request message is empty."
    );

    return "Generated feedback request SMS message is empty.";
  }

  // ===================================================
  // WRONG MESSAGE PROTECTION
  // ===================================================

  const unresolved =
    findUnresolvedVariables(
      smsMessage
    );

  if (unresolved.length > 0) {

    const errorMessage =
      `Unresolved SMS variables: ${unresolved.join(
        ", "
      )}`;

    console.error(
      "SMS EVENT:",
      errorMessage
    );

    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "FEEDBACK_REQUEST",

        provider:
          settings.provider,

        status:
          "FAILED",

        errorMessage,
      },
    });

    return errorMessage;
  }

  // ===================================================
  // DUPLICATE PROTECTION
  //
  // Same job + same generated message:
  // do not send again.
  // ===================================================

  const existingSuccess =
    await prisma.smsMessageLog.findFirst({
      where: {
        repairJobId:
          job.id,

        templateCode:
          "FEEDBACK_REQUEST",

        status:
          "SENT",

        message:
          smsMessage,
      },
    });

  if (existingSuccess) {

    console.log(
      "SMS EVENT: FEEDBACK_REQUEST with same message already sent. SMS skipped."
    );

    return "Feedback request SMS already sent. Same message skipped.";
  }

  // ===================================================
  // CREATE PENDING LOG
  // ===================================================

  const log =
    await prisma.smsMessageLog.create({
      data: {
        customerId:
          job.customer.id,

        repairJobId:
          job.id,

        phone,

        message:
          smsMessage,

        templateCode:
          "FEEDBACK_REQUEST",

        provider:
          settings.provider,

        status:
          "PENDING",
      },
    });

  // ===================================================
  // SEND SMS
  // ===================================================

  try {

    console.log(
      "SMS EVENT: Sending FEEDBACK_REQUEST SMS to:",
      phone
    );

    const providerResponse =
      await sendSociairSms(
        phone,
        smsMessage
      );

    // =================================================
    // UPDATE SUCCESS
    // =================================================

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "SENT",

        providerMessageId:
          null,

        providerResponse:
          JSON.stringify(
            providerResponse
          ),

        sentAt:
          new Date(),
      },
    });

    console.log(
      "SMS EVENT: FEEDBACK_REQUEST SMS sent successfully."
    );

    return "Feedback request SMS sent successfully.";

  } catch (error: any) {

    const errorMessage =
      error?.message ||
      "Unable to send feedback request SMS.";

    await prisma.smsMessageLog.update({
      where: {
        id:
          log.id,
      },

      data: {
        status:
          "FAILED",

        errorMessage,
      },
    });

    console.error(
      "SMS EVENT: FEEDBACK_REQUEST SMS failed:",
      errorMessage
    );

    return `Feedback request SMS failed: ${errorMessage}`;
  }
}







