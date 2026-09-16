import { Request, Response } from "express";

import {
  createSupplierPayment,
  getSupplierPayments,
} from "../services/supplierPayment.service";

// =====================================================
// CREATE SUPPLIER PAYMENT
// =====================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const payment =
      await createSupplierPayment({
        supplierId:
          String(
            req.body.supplierId
          ),

        purchaseId:
          req.body.purchaseId
            ? String(
                req.body.purchaseId
              )
            : undefined,

        amount:
          Number(
            req.body.amount
          ),

        paymentDate:
          req.body.paymentDate,

        paymentMethod:
          req.body.paymentMethod ||
          "CASH",

        remarks:
          req.body.remarks,
      });

    return res.status(201).json({
      success: true,
      message:
        "Supplier payment recorded successfully.",
      data: payment,
    });
  } catch (error: any) {
    console.error(
      "SUPPLIER PAYMENT ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to record supplier payment.",
    });
  }
}

// =====================================================
// GET SUPPLIER PAYMENT HISTORY
// =====================================================

export async function getHistory(
  req: Request,
  res: Response
) {
  try {
    const supplierId =
      String(
        req.params.supplierId
      );

    const payments =
      await getSupplierPayments(
        supplierId
      );

    return res.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error(
      "SUPPLIER PAYMENT HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load supplier payment history.",
    });
  }
}