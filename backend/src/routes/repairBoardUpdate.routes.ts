import { Router } from "express";
import { updateRepairStatus } from "../controllers/repairBoardUpdate.controller";

const router = Router();

router.put("/:id", updateRepairStatus);

export default router;