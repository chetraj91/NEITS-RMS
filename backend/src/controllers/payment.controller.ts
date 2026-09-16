import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";

export async function receivePayment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const payment = await paymentService.receivePayment(req.body);

    res.status(201).json({
      success: true,
      message: "Payment received successfully.",
      data: payment,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getPayments(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const repairJobId = String(req.params.repairJobId);

    const payments = await paymentService.getPayments(repairJobId);

    res.json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}