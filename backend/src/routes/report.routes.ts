import { Router } from "express";
import { dashboardReportController } from "../controllers/report.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "accounts.reports"
  )
);

router.get("/dashboard", dashboardReportController);

export default router;