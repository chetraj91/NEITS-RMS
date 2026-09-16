import { Router } from "express";

import * as purchaseController
  from "../controllers/purchase.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "purchases"
  )
);

// Create Purchase
router.post(
  "/",
  purchaseController.create
);

// Get All Purchases
router.get(
  "/",
  purchaseController.getAll
);

// Create Purchase Return
router.post(
  "/returns",
  purchaseController.createReturn
);

// Get All Purchase Returns
router.get(
  "/returns",
  purchaseController.getAllReturns
);

// Get Single Purchase Return
router.get(
  "/returns/:id",
  purchaseController.getOneReturn
);

// Get Single Purchase
router.get(
  "/:id",
  purchaseController.getOne
);

// Delete Purchase
router.delete(
  "/:id",
  purchaseController.remove
);

export default router;