import { Router } from "express";
import {
  ledger,
  detailedLedger,
} from "../controllers/customerLedger.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "accounts.customer-ledger"
  )
);

router.get("/:customerId", ledger);

router.get(
  "/:customerId/detailed",
  detailedLedger
);

export default router;