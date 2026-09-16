import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router=Router();

router.use(
  authenticate,
  requirePermission(
    "dashboard"
  )
);

router.get("/",dashboardController);

export default router;