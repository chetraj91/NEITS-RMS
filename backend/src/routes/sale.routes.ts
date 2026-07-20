import { Router } from "express";

import * as saleController from "../controllers/sale.controller";

const router = Router();

router.post("/", saleController.create);

router.get("/", saleController.getAll);

router.get("/:id", saleController.getOne);

router.put("/:id", saleController.update);

router.delete("/:id", saleController.remove);

export default router;