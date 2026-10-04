import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import * as repairRefundService from "../services/repairRefund.service";

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

// =====================================================
// REPAIR REFUND
// =====================================================

export async function createRepairRefund(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const refund =
  await repairRefundService.createRepairRefund(
    req.body
  );

    res.status(201).json({
      success: true,
      message:
        "Repair refund recorded successfully.",
      data: refund,
    });
  } catch (error: any) {
    console.error(
      "CREATE REPAIR REFUND ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to create repair refund.",
    });
  }
}

// =====================================================
// GET REPAIR REFUNDS
// =====================================================

export async function getRepairRefunds(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const refunds =
  await repairRefundService.getRepairRefunds(
    String(req.params.repairJobId)
  );

    res.json({
      success: true,
      data: refunds,
    });
  } catch (error: any) {
    console.error(
      "GET REPAIR REFUNDS ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to load repair refunds.",
    });
  }
}