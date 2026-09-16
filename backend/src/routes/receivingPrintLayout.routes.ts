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

router.use(
  authenticate,
  requirePermission(
    "settings.receiving-print-layout"
  )
);

router.get(
  "/:documentType",
  getLayout
);

router.post(
  "/:documentType",
  saveLayout
);

router.get(
  "/:documentType/size",
  getPrintSize
);

router.post(
  "/:documentType/size",
  savePrintSize
);

export default router;