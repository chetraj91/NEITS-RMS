import { Router } from "express";

import {
  getLedger,
} from "../controllers/purchaseLedger.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "purchases"
  )
);

router.get(
  "/",
  getLedger
);

export default router;