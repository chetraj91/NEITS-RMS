import { Router } from "express";

import {
  create,
  getHistory,
} from "../controllers/supplierPayment.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "accounts.supplier-ledger"
  )
);

router.post(
  "/",
  create
);

router.get(
  "/supplier/:supplierId",
  getHistory
);

export default router;