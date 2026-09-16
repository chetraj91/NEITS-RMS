import { Router } from "express";

import {
  getPublicFeedback,
  submitPublicFeedback,
} from "../controllers/feedback.controller";

const router = Router();

// =====================================================
// PUBLIC CUSTOMER FEEDBACK
// =====================================================

// Get feedback information using secure token
// GET /api/feedback/:token
router.get(
  "/:token",
  getPublicFeedback
);

// Submit customer feedback
// POST /api/feedback/:token
router.post(
  "/:token",
  submitPublicFeedback
);

export default router;