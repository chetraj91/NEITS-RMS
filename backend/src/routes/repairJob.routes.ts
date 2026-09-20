import { Router } from "express";

import {
  createRepairJob,
  getRepairJobs,
  getRepairJob,
  updateRepairJob,
  deleteRepairJob,
} from "../controllers/repairJob.controller";

import {
  authenticate,
  requirePermission,
  requireAnyPermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "repair-jobs"
  )
);

// =====================================
// CREATE NEW REPAIR JOB
// POST /api/repairJobs
// =====================================
router.post("/", createRepairJob);

// =====================================
// GET ALL REPAIR JOBS
// GET /api/repairJobs
// =====================================
router.get("/", getRepairJobs);

// =====================================
// GET SINGLE REPAIR JOB
// GET /api/repairJobs/:id
// =====================================
router.get("/:id", getRepairJob);

// =====================================
// UPDATE REPAIR JOB
// PUT /api/repairJobs/:id
// =====================================
router.put(
  "/:id",
  requireAnyPermission([
    "repair-jobs.details",
    "repair-jobs.edit",
  ]),
  updateRepairJob
);

// =====================================
// DELETE REPAIR JOB
// DELETE /api/repairJobs/:id
// =====================================
router.delete("/:id", deleteRepairJob);

export default router;