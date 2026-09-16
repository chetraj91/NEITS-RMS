import { Router } from "express";

import {
  getLayout,
  saveLayout,
} from "../controllers/customerLayout.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "settings.customer-layout"
  )
);

router.get(
  "/",
  getLayout
);

router.post(
  "/",
  saveLayout
);

export default router;