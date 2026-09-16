import { Router } from "express";

import {
  getSystem,
  updateSystem,
} from "../controllers/systemSettings.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "settings.system"
  )
);

router.get(
  "/",
  getSystem
);

router.put(
  "/",
  updateSystem
);

export default router;