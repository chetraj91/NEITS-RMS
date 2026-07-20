import { Router } from "express";

import * as invoiceController from "../controllers/invoice.controller";

const router = Router();

// Repair Invoice
router.get("/repair/:id", invoiceController.repairInvoice);

// Sale Invoice
router.get("/sale/:id", invoiceController.saleInvoice);

export default router;