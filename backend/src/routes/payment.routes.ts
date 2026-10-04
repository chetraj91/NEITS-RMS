import { Router } from "express";

import {
  receivePayment,
  getPayments,
  createRepairRefund,
  getRepairRefunds,
} from "../controllers/payment.controller";

const router = Router();

// Receive Payment
router.post("/", receivePayment);

// Create Repair Refund
router.post("/refund", createRepairRefund);

// Get Repair Refund History
router.get("/:repairJobId/refunds", getRepairRefunds);

// Get Payment History
router.get("/:repairJobId", getPayments);

export default router;