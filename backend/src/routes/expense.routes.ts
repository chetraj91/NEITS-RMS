import { Router } from "express";

import {
  createExpenseController,
  getExpenseController,
} from "../controllers/expense.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "accounts.expenses"
  )
);

router.get("/", getExpenseController);

router.post("/", createExpenseController);

export default router;