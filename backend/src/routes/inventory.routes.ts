import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/inventory.controller";

const router = Router();

// Create Inventory
router.post("/", create);

// Get All Inventory
router.get("/", getAll);

// Get Single Item
router.get("/:id", getOne);

// Update Item
router.put("/:id", update);

// Delete Item
router.delete("/:id", remove);

export default router;