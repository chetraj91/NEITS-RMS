import { Router } from "express";

import {
  getFeedback,
  updateFeedback,
} from "../controllers/feedbackSetting.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// FEEDBACK SETTINGS
// =====================================================

router.use(
  authenticate,
  requirePermission(
    "settings.feedback"
  )
);

// Get feedback settings
router.get(
  "/",
  getFeedback
);

// Update feedback settings
router.put(
  "/",
  updateFeedback
);

export default router;