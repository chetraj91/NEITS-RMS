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

router.use(
  authenticate,
  requirePermission(
    "settings.company"
  )
);

router.get(
  "/",
  getCompany
);

router.put(
  "/",
  updateCompany
);

export default router;