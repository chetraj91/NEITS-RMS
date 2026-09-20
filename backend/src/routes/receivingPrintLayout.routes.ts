import { Router } from "express";

import {
  getLayout,
  saveLayout,
  getPrintSize,
  savePrintSize,
} from "../controllers/receivingPrintLayout.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/:documentType",
  getLayout
);

router.post(
  "/:documentType",
  requirePermission(
    "settings.receiving-print-layout"
  ),
  saveLayout
);

router.get(
  "/:documentType/size",
  getPrintSize
);

router.post(
  "/:documentType/size",
  requirePermission(
    "settings.receiving-print-layout"
  ),
  savePrintSize
);

export default router;