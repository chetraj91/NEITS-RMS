import { Router } from "express";

import * as repairPartController from "../controllers/repairPart.controller";

const router = Router();

// Add repair part
router.post("/", repairPartController.create);

// Get all parts of one repair job
router.get("/:repairJobId", repairPartController.getAll);

// Delete repair part
router.delete("/:id", repairPartController.remove);

export default router;