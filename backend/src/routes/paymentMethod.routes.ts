import { Router } from "express";

import {
  getAll,
  getOne,
  create,
  update,
  remove,
} from "../controllers/paymentMethod.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  requirePermission("repair-jobs"),
  getAll
);

router.get(
  "/:id",
  requirePermission("settings.payment-methods"),
  getOne
);

router.post(
  "/",
  requirePermission("settings.payment-methods"),
  create
);

router.put(
  "/:id",
  requirePermission("settings.payment-methods"),
  update
);

router.delete(
  "/:id",
  requirePermission("settings.payment-methods"),
  remove
);

router.get(
  "/",
  getAll
);

router.get(
  "/:id",
  getOne
);

router.post(
  "/",
  create
);

router.put(
  "/:id",
  update
);

router.delete(
  "/:id",
  remove
);

export default router;