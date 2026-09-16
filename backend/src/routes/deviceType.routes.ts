import { Router } from "express";
import * as controller from "../controllers/deviceType.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission("settings.device-types")
);

router.get("/", controller.getDeviceTypes);
router.post("/", controller.createDeviceType);
router.put("/:id", controller.updateDeviceType);
router.delete("/:id", controller.deleteDeviceType);

export default router;