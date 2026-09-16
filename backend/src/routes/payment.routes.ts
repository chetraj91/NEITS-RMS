import { Router } from "express";
import {
  receivePayment,
  getPayments,
} from "../controllers/payment.controller";

const router = Router();

// Receive Payment
router.post("/", receivePayment);

// Get Payment History
router.get("/:repairJobId", getPayments);

export default router;