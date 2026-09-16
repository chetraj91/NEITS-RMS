import { Router } from "express";

import {
  getSmsConfig,
  updateSmsConfig,
  testSmsConnection,
  getSmsBalance,
  sendTestSms,
  sendDueAmountReminder,
   sendRepairDelayedSms,
   sendPartsRequired,
   sendCustomerApprovalRequired,
  sendFeedbackRequest,
  getFeedbackRequestStatus,
} from "../controllers/sms.controller";

import {
  searchCustomSmsRecipients,
  sendCustomSmsMessage,
} from "../controllers/customSms.controller";

import {
  getSmsHistory,
} from "../controllers/sms.controller";

import {
  authenticate,
  requirePermission,
  requireAnyPermission,
} from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// SMS SETTINGS
// =====================================================

// View SMS configuration
router.get(
  "/settings",
  authenticate,
  requirePermission("settings.messages"),
  getSmsConfig
);

// Update SMS configuration
router.put(
  "/settings",
  authenticate,
  requirePermission("settings.messages.manage"),
  updateSmsConfig
);

// =====================================================
// SOCIAIR CONNECTION
// =====================================================

// Test Sociair API connection
router.get(
  "/test-connection",
  authenticate,
  requirePermission("settings.messages.test"),
  testSmsConnection
);

// Get current Sociair balance
router.get(
  "/balance",
  authenticate,
  requirePermission("settings.messages"),
  getSmsBalance
);

// =====================================================
// TEST SMS
// =====================================================

// Send a test SMS
router.post(
  "/test",
  authenticate,
  requirePermission("settings.messages.test"),
  sendTestSms
);

// =====================================================
// DUE AMOUNT REMINDER
// =====================================================
//
// Manually send outstanding due amount SMS
// for a specific repair job.
//
// Example:
// POST /sms/due-reminder/:id
//
// =====================================================

router.post(
  "/due-reminder/:id",
  authenticate,
 requirePermission("messages.send"),
  sendDueAmountReminder
);

// =====================================================
// PARTS REQUIRED
// =====================================================
//
// Manually send required parts SMS
// for a specific repair job.
//
// Example:
// POST /sms/parts-required/:id
//
// =====================================================

router.post(
  "/parts-required/:id",
  authenticate,
  requirePermission("messages.send"),
  sendPartsRequired
);

// =====================================================
// CUSTOMER APPROVAL REQUIRED
// =====================================================
//
// Manually send customer approval SMS
// for a specific repair job.
//
// Example:
// POST /sms/customer-approval/:id
//
// =====================================================

router.post(
  "/customer-approval/:id",
  authenticate,
 requirePermission("messages.send"),
  sendCustomerApprovalRequired
);

// =====================================================
// REPAIR DELAYED SMS
// =====================================================
//
// Manually send repair delayed SMS
// for a specific repair job.
//
// Example:
// POST /sms/repair-delayed/:id
//
// Body:
// {
//   "delayReason": "Waiting for motherboard",
//   "expectedDate": "2026-09-05"
// }
//
// =====================================================

router.post(
  "/repair-delayed/:id",
  authenticate,
  requirePermission("messages.send"),
  sendRepairDelayedSms
);

// =====================================================
// FEEDBACK REQUEST SMS
// =====================================================
//
// Manually send feedback request SMS
// for a specific repair job.
//
// Example:
// POST /sms/feedback-request/:id
//
// =====================================================

router.post(
  "/feedback-request/:id",
  authenticate,
  requirePermission("settings.messages"),
  sendFeedbackRequest
);

// =====================================================
// FEEDBACK REQUEST STATUS
// =====================================================
//
// Check whether a successful feedback request SMS
// has already been sent for this repair job.
//
// Example:
// GET /sms/feedback-request-status/:id
//
// =====================================================

router.get(
  "/feedback-request-status/:id",
  authenticate,
  requirePermission("settings.messages"),
  getFeedbackRequestStatus
);
// =====================================================
// CUSTOM / BULK SMS
// =====================================================

// Search customers or suppliers for SMS recipients
router.get(
  "/custom/recipients",
  authenticate,
  requireAnyPermission([
    "messages.send-custom",
    "messages.bulk-send",
  ]),
  searchCustomSmsRecipients
);

// Send custom SMS to one or multiple recipients
router.post(
  "/custom/send",
  authenticate,
  requireAnyPermission([
    "messages.send-custom",
    "messages.bulk-send",
  ]),
  sendCustomSmsMessage
);

// =====================================================
// SMS HISTORY
// =====================================================

router.get(
  "/history",
  authenticate,
  requirePermission("messages.view-history"),
  getSmsHistory
);

export default router;