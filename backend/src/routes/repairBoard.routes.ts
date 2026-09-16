import { Router } from "express";
import { getRepairBoard } from "../controllers/repairBoard.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "repair-board"
  )
);

router.get("/", getRepairBoard);

export default router;