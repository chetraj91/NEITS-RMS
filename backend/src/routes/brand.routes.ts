import { Router } from "express";

import {
  getBrands,
  getBrandsByDeviceType,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Get brands by Device Type
router.get(
  "/device-type/:deviceTypeId",
  getBrandsByDeviceType
);

// Get all brands
router.get(
  "/",
  requirePermission("settings.brands"),
  getBrands
);

router.post(
  "/",
  requirePermission("settings.brands"),
  createBrand
);

router.put(
  "/:id",
  requirePermission("settings.brands"),
  updateBrand
);

router.delete(
  "/:id",
  requirePermission("settings.brands"),
  deleteBrand
);

export default router;