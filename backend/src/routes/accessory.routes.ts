import { Router } from "express";

import {
  getAccessoriesController,
  getActiveAccessoriesController,
  getAccessoryByIdController,
  createAccessoryController,
  updateAccessoryController,
  deleteAccessoryController,
  getAccessoriesByDeviceTypeController,
  saveDeviceTypeAccessoriesController,
} from "../controllers/accessory.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission("settings.accessories")
);

// =====================================================
// GET ALL ACCESSORIES
// =====================================================

router.get(
  "/",
  getAccessoriesController
);

// =====================================================
// GET ACTIVE ACCESSORIES
// =====================================================

router.get(
  "/active",
  getActiveAccessoriesController
);

// =====================================================
// GET ACCESSORIES BY DEVICE TYPE
// =====================================================

router.get(
  "/device-type/:deviceTypeId",
  getAccessoriesByDeviceTypeController
);

// =====================================================
// SAVE ACCESSORIES FOR DEVICE TYPE
// =====================================================

router.put(
  "/device-type/:deviceTypeId",
  saveDeviceTypeAccessoriesController
);

// =====================================================
// GET ONE ACCESSORY
// =====================================================

router.get(
  "/:id",
  getAccessoryByIdController
);

// =====================================================
// CREATE ACCESSORY
// =====================================================

router.post(
  "/",
  createAccessoryController
);

// =====================================================
// UPDATE ACCESSORY
// =====================================================

router.put(
  "/:id",
  updateAccessoryController
);

// =====================================================
// DELETE ACCESSORY
// =====================================================

router.delete(
  "/:id",
  deleteAccessoryController
);

export default router;