import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/inventory.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "inventory"
  )
);

// Create Inventory
router.post("/", create);

// Get All Inventory
router.get("/", getAll);

// Get Single Item
router.get("/:id", getOne);

// Update Item

router.put(
  "/:id",
  requirePermission("inventory.edit"),
  update
);

// Delete Item
router.delete("/:id", remove);

export default router;