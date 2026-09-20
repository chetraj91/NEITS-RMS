import { Router } from "express";
import * as controller from "../controllers/deviceType.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", controller.getDeviceTypes);

router.post(
  "/",
  requirePermission("settings.device-types"),
  controller.createDeviceType
);

router.put(
  "/:id",
  requirePermission("settings.device-types"),
  controller.updateDeviceType
);

router.delete(
  "/:id",
  requirePermission("settings.device-types"),
  controller.deleteDeviceType
);
export default router;