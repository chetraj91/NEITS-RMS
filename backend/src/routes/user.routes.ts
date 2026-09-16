import { Router } from "express";

import * as userController
  from "../controllers/user.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router =
  Router();

router.use(
  authenticate,
  requirePermission(
    "settings.users"
  )
);

// Get all users
router.get(
  "/",
  userController.getAll
);

// Get one user
router.get(
  "/:id",
  userController.getOne
);

// Get permissions
router.get(
  "/:id/permissions",
  userController.getPermissions
);

// Create
router.post(
  "/",
  userController.create
);

// Update
router.put(
  "/:id",
  userController.update
);

// Delete
router.delete(
  "/:id",
  userController.remove
);

export default router;