import { Router } from "express";

import {
  getDeviceTypeFields,
  saveDeviceTypeFields,
} from "../controllers/deviceTypeField.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission("settings.device-type-fields")
);

// ===================================
// Get mapping for one Device Type
// ===================================

router.get(
  "/:deviceTypeId",
  getDeviceTypeFields
);

// ===================================
// Save mapping
// ===================================

router.post(
  "/:deviceTypeId",
  saveDeviceTypeFields
);

export default router;