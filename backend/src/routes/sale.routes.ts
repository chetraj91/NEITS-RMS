import { Router } from "express";

import * as saleController
  from "../controllers/sale.controller";

  import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

router.use(
  authenticate,
  requirePermission(
    "sales"
  )
);

router.post(
  "/",
  saleController.create
);

router.get(
  "/",
  saleController.getAll
);

router.get(
  "/:id",
  saleController.getOne
);

router.post(
  "/:id/payment",
  saleController.receivePayment
);

router.put(
  "/:id",
  saleController.update
);

router.delete(
  "/:id",
  saleController.remove
);

export default router;