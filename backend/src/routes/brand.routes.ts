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

router.use(
  authenticate,
  requirePermission("settings.brands")
);

// Get brands by Device Type
router.get(
  "/device-type/:deviceTypeId",
  getBrandsByDeviceType
);

// Get all brands
router.get("/", getBrands);

// Create brand
router.post("/", createBrand);

// Update brand
router.put("/:id", updateBrand);

// Delete brand
router.delete("/:id", deleteBrand);

export default router;