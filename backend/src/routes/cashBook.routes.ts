import { Router } from "express";
import {
  getCashBookController,
  getCashBookPaymentSummaryController,
} from "../controllers/cashBook.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "accounts.cash-book"
  )
);

// =====================================================
// CASH BOOK
// =====================================================

router.get(
  "/",
  getCashBookController
);

// =====================================================
// CASH BOOK PAYMENT METHOD SUMMARY
// =====================================================

router.get(
  "/payment-summary",
  getCashBookPaymentSummaryController
);

export default router;