import { Router } from "express";

import * as salesReturnController
  from "../controllers/salesReturn.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "sales"
  )
);

// =====================================================
// CREATE SALES RETURN
// =====================================================

router.post(
  "/",
  salesReturnController.create
);

// =====================================================
// GET ALL SALES RETURNS
// =====================================================

router.get(
  "/",
  salesReturnController.getAll
);

// =====================================================
// GET ONE SALES RETURN
// =====================================================

router.get(
  "/:id",
  salesReturnController.getOne
);

export default router;