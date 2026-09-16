import { Router } from "express";

import {
  getDeviceFields,
  createDeviceField,
  updateDeviceField,
  deleteDeviceField,
} from "../controllers/deviceField.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission("settings.device-fields")
);

// =============================
// Get All Device Fields
// =============================
router.get("/", getDeviceFields);

// =============================
// Create Device Field
// =============================
router.post("/", createDeviceField);

// =============================
// Update Device Field
// =============================
router.put("/:id", updateDeviceField);

// =============================
// Delete Device Field
// =============================
router.delete("/:id", deleteDeviceField);

export default router;