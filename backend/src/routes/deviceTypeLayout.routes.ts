import { Router } from "express";

import {
  getLayout,
  saveLayout,
} from "../controllers/deviceTypeLayout.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "settings.device-type-fields"
  )
);

router.get(
  "/:deviceTypeId",
  getLayout
);

router.post(
  "/:deviceTypeId",
  saveLayout
);

export default router;