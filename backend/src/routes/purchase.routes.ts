import { Router } from "express";
import * as purchaseController from "../controllers/purchase.controller";

const router = Router();

// Create Purchase
router.post("/", purchaseController.create);

// Get All Purchases
router.get("/", purchaseController.getAll);

// Get Single Purchase
router.get("/:id", purchaseController.getOne);

// Delete Purchase
router.delete("/:id", purchaseController.remove);

export default router;