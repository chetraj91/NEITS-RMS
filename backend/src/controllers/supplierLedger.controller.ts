import { Request, Response } from "express";

import {
  getSupplierLedger,
  getSupplierDetailedLedger,
} from "../services/supplierLedger.service";

export async function ledger(
  req: Request,
  res: Response
) {
  try {
    const supplierId =
      String(
        req.params.supplierId
      );

    const data =
      await getSupplierLedger(
        supplierId
      );

    res.json(data);
  } catch (error) {
    console.error(
      "SUPPLIER LEDGER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load supplier ledger",
    });
  }
}

// =====================================================
// DETAILED SUPPLIER LEDGER
// =====================================================

export async function detailedLedger(
  req: Request,
  res: Response
) {
  try {
    const supplierId =
      String(
        req.params.supplierId
      );

    const data =
      await getSupplierDetailedLedger(
        supplierId
      );

    res.json(data);
  } catch (error) {
    console.error(
      "SUPPLIER DETAILED LEDGER ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Unable to load detailed supplier ledger",
    });
  }
}