import { Router } from "express";

import {
  getActive,
  getAll,
  create,
  update,
  remove,
} from "../controllers/inventoryCategory.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission("inventory")
);

// Get active categories
router.get("/", getActive);

// Get all categories
router.get("/all", getAll);

// Create category
router.post("/", create);

// Update category
router.put("/:id", update);

// Delete category
router.delete("/:id", remove);

export default router;