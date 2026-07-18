import { Router } from "express";

import {
  createTechnician,
  getTechnicians,
  getTechnician,
  updateTechnician,
  deleteTechnician,
} from "../controllers/technician.controller";

const router = Router();

router.post("/", createTechnician);

router.get("/", getTechnicians);

router.get("/:id", getTechnician);

router.put("/:id", updateTechnician);

router.delete("/:id", deleteTechnician);

export default router;