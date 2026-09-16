import { Router } from "express";

import {
  create,
} from "../controllers/customerPayment.controller";

const router = Router();

// =====================================================
// CREATE CUSTOMER PAYMENT
// =====================================================

router.post(
  "/",
  create
);

export default router;