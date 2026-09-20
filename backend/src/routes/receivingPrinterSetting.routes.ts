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

router.use(authenticate);

router.get(
  "/",
  getSettings
);

router.post(
  "/",
  requirePermission(
    "settings.receiving-print-settings"
  ),
  saveSettings
);

export default router;