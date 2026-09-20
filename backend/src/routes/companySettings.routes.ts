import { Router } from "express";

import {
  getCompany,
  updateCompany,
} from "../controllers/companySettings.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getCompany
);

router.put(
  "/",
  requirePermission(
    "settings.company"
  ),
  updateCompany
);

export default router;