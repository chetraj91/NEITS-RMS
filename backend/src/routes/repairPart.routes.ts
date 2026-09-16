import { Router } from "express";
import {
  create,
  getAll,
  remove,
} from "../controllers/repairPart.controller";

const router = Router();

router.post("/", create);
router.get("/:repairJobId", getAll);
router.delete("/:id", remove);

export default router;