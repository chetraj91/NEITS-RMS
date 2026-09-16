import { Request, Response } from "express";

import {
  createCustomerPayment,
} from "../services/customerPayment.service";

// =====================================================
// CREATE CUSTOMER PAYMENT
// =====================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const payment =
      await createCustomerPayment({
        customerId:
          String(
            req.body.customerId
          ),

        amount:
          Number(
            req.body.amount
          ),

        paymentDate:
          req.body.paymentDate
            ? String(
                req.body.paymentDate
              )
            : undefined,

        paymentMethod:
          req.body.paymentMethod
            ? String(
                req.body.paymentMethod
              )
            : undefined,

        remarks:
          req.body.remarks
            ? String(
                req.body.remarks
              )
            : undefined,
      });

    return res.json(payment);
  } catch (error: any) {
    console.error(
      "Customer payment error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to record customer payment.",
    });
  }
}