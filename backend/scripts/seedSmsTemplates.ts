import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const templates = [
  {
    name: "Job Received",
    code: "JOB_RECEIVED",
    message:
      "Dear {customerName},\n\nYour {brand} {model} has been received for repair.\nJob No: {jobNumber}\n\nWe will update you after diagnosis.\n\nThank you,\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Job Diagnosis",
    code: "JOB_DIAGNOSIS",
    message:
      "Dear {customerName},\n\nDiagnosis for your repair job {jobNumber} has been completed.\n\nDiagnosis: {diagnosis}\n\nThank you,\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Estimate",
    code: "ESTIMATE",
    message:
      "Dear {customerName},\n\nRepair estimate for Job No: {jobNumber}\nDevice: {brand} {model}\n\nEstimated Amount: Rs. {estimatedCost}\nTotal Amount: Rs. {totalAmount}\nAdvance: Rs. {advanceAmount}\nDue Amount: Rs. {dueAmount}\n\nPlease contact us for approval.\n\nThank you,\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Ready for Delivery",
    code: "READY_FOR_DELIVERY",
    message:
      "Dear {customerName},\n\nYour {brand} {model} repair is completed and ready for delivery.\nJob No: {jobNumber}\n\nTotal Amount: Rs. {totalAmount}\nPaid: Rs. {advanceAmount}\nDue Amount: Rs. {dueAmount}\n\nPlease collect your device from NEITS.\n\nThank you,\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Delivered",
    code: "DELIVERED",
    message:
      "Dear {customerName},\n\nYour {brand} {model} has been delivered successfully.\nJob No: {jobNumber}\n\nTotal Amount: Rs. {totalAmount}\nPaid: Rs. {advanceAmount}\nDue Amount: Rs. {dueAmount}\n\nThank you for choosing NEITS RMS.",
    enabled: true,
  },

  {
    name: "Payment Received",
    code: "PAYMENT_RECEIVED",
    message:
      "Dear {customerName},\n\nPayment received for Job No: {jobNumber}.\n\nPayment Amount: Rs. {paymentAmount}\nTotal Amount: Rs. {totalAmount}\nPaid Amount: Rs. {paidAmount}\nDue Amount: Rs. {dueAmount}\n\nThank you,\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Due Amount Reminder",
    code: "DUE_AMOUNT",
    message:
      "Dear {customerName},\n\nThis is a reminder regarding the outstanding amount for Job No: {jobNumber}.\n\nTotal Amount: Rs. {totalAmount}\nPaid Amount: Rs. {paidAmount}\nDue Amount: Rs. {dueAmount}\n\nPlease contact NEITS RMS for payment details.\n\nThank you.",
    enabled: true,
  },

  {
    name: "Repair Delayed",
    code: "REPAIR_DELAYED",
    message:
      "Dear {customerName},\n\nWe apologize for the delay in your repair Job No: {jobNumber}.\n\nReason: {delayReason}\nExpected Date: {expectedDate}\n\nWe appreciate your patience.\n\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Parts Required",
    code: "PARTS_REQUIRED",
    message:
      "Dear {customerName},\n\nAdditional parts are required for your repair Job No: {jobNumber}.\n\nRequired Parts: {requiredParts}\n\nPlease contact NEITS RMS for further information and approval.\n\nThank you.",
    enabled: true,
  },

  {
    name: "Customer Approval Required",
    code: "CUSTOMER_APPROVAL_REQUIRED",
    message:
      "Dear {customerName},\n\nYour repair Job No: {jobNumber} requires your approval before we proceed.\n\nEstimate Amount: Rs. {estimatedCost}\nTotal Amount: Rs. {totalAmount}\n\nPlease contact NEITS RMS to approve the repair.\n\nThank you.",
    enabled: true,
  },

  {
    name: "Feedback Request",
    code: "FEEDBACK_REQUEST",
    message:
      "Dear {customerName},\n\nThank you for choosing NEITS RMS for Job No: {jobNumber}.\n\nWe value your feedback. Please share your experience with our service.\n\nThank you,\nNEITS RMS",
    enabled: true,
  },

  {
    name: "Custom Message",
    code: "CUSTOM_MESSAGE",
    message:
      "Dear {customerName},\n\n{customMessage}\n\nThank you,\nNEITS RMS",
    enabled: true,
  },
];

async function seedSmsTemplates() {
  console.log(
    "Starting SMS template setup..."
  );

  for (const template of templates) {
    const result =
      await prisma.smsTemplate.upsert({
        where: {
          code: template.code,
        },

        update: {
          name: template.name,
          message: template.message,
        },

        create: template,
      });

    console.log(
      `✓ ${result.name} (${result.code})`
    );
  }

  console.log(
    "======================================"
  );

  console.log(
    "SMS templates setup completed."
  );

  console.log(
    `Total templates: ${templates.length}`
  );
}

seedSmsTemplates()
  .catch((error) => {
    console.error(
      "SMS TEMPLATE SEED ERROR:",
      error
    );
  })
  .finally(async () => {
    await prisma.$disconnect();
  });