import { Request, Response } from "express";

import {
  getDashboardReport,
} from "../services/report.service";

export async function dashboardReportController(
  req: Request,
  res: Response
) {
  try {
    const fromDate =
      req.query.fromDate
        ? String(
            req.query.fromDate
          )
        : undefined;

  const toDate =
  req.query.toDate
    ? String(
        req.query.toDate
      )
    : undefined;

const paymentType =
  req.query.paymentType
    ? String(
        req.query.paymentType
      )
    : undefined;

const paymentMethod =
  req.query.paymentMethod
    ? String(
        req.query.paymentMethod
      )
    : undefined;

const customerId =
  req.query.customerId
    ? String(
        req.query.customerId
      )
    : undefined;

const supplierId =
  req.query.supplierId
    ? String(
        req.query.supplierId
      )
    : undefined;

const report =
  await getDashboardReport(
    fromDate,
    toDate,
    paymentType,
    paymentMethod,
    customerId,
    supplierId
  );

    return res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error(
      "REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to generate report.",
    });
  }
}