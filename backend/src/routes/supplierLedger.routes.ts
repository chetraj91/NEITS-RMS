import { Router } from "express";

import {
  ledger,
  detailedLedger,
} from "../controllers/supplierLedger.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router =
  Router();
router.use(
  authenticate,
  requirePermission(
    "accounts.supplier-ledger"
  )
);

router.get(
  "/:supplierId",
  ledger
);

router.get(
  "/:supplierId/detailed",
  detailedLedger
);

export default router;