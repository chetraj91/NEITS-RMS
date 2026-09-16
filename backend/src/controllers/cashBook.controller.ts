import { Request, Response } from "express";
import {
  getCashBook,
  getCashBookPaymentSummary,
} from "../services/cashBook.service";

// =====================================================
// GET CASH BOOK
// =====================================================

export async function getCashBookController(
  req: Request,
  res: Response
) {
  try {
    const data =
      await getCashBook();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message:
        "Unable to load cash book",
    });
  }
}

// =====================================================
// CASH BOOK PAYMENT METHOD SUMMARY
// =====================================================

export async function getCashBookPaymentSummaryController(
  req: Request,
  res: Response
) {
  try {
    const fromDate =
      req.query.fromDate
        ? String(req.query.fromDate)
        : undefined;

    const toDate =
      req.query.toDate
        ? String(req.query.toDate)
        : undefined;

    const data =
      await getCashBookPaymentSummary(
        fromDate,
        toDate
      );

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(
      "Unable to load cash book payment summary:",
      err
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to load cash book payment summary",
    });
  }
}