import { Router } from "express";

import * as supplierController from "../controllers/supplier.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "suppliers"
  )
);

router.post("/", supplierController.create);

router.get("/", supplierController.getAll);

router.get("/:id", supplierController.getOne);

router.put("/:id", supplierController.update);

router.delete("/:id", supplierController.remove);

export default router;