import { Router } from "express";
import {
  createRepairJob,
  getRepairJobs,
  getRepairJob,
  updateRepairJob,
  deleteRepairJob,
} from "../controllers/repairJob.controller";

const router = Router();

// Create a new repair job
router.post("/", createRepairJob);

// Get all repair jobs
router.get("/", getRepairJobs);

// Get a single repair job
router.get("/:id", getRepairJob);

// Update a repair job
router.put("/:id", updateRepairJob);

// Delete a repair job
router.delete("/:id", deleteRepairJob);

export default router;