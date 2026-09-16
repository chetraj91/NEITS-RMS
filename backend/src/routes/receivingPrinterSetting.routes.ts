import { Router } from "express";

import {
  getSettings,
  saveSettings,
} from "../controllers/receivingPrinterSetting.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "settings.receiving-print-settings"
  )
);

router.get(
  "/",
  getSettings
);

router.post(
  "/",
  saveSettings
);

export default router;