
import { Router } from "express";

import {
  getSmsTemplates,
  createSmsTemplate,
  updateSmsTemplate,
  toggleSmsTemplate,
  deleteSmsTemplate,
} from "../controllers/smsTemplate.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// SMS TEMPLATE PERMISSION
// =====================================================

router.use(
  authenticate,
  requirePermission(
    "messages.manage-templates"
  )
);

// =====================================================
// GET ALL TEMPLATES
// =====================================================

router.get(
  "/",
  getSmsTemplates
);

// =====================================================
// CREATE TEMPLATE
// =====================================================

router.post(
  "/",
  createSmsTemplate
);

// =====================================================
// UPDATE TEMPLATE
// =====================================================

router.put(
  "/:id",
  updateSmsTemplate
);

// =====================================================
// ENABLE / DISABLE TEMPLATE
// =====================================================

router.patch(
  "/:id/toggle",
  toggleSmsTemplate
);

// =====================================================
// DELETE TEMPLATE
// =====================================================

router.delete(
  "/:id",
  deleteSmsTemplate
);

export default router;