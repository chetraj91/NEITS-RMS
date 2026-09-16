import { Request, Response } from "express";

import {
  createSalesReturn,
  getSalesReturns,
  getSalesReturn,
} from "../services/salesReturn.service";

// =====================================================
// CREATE SALES RETURN
// =====================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const salesReturn =
      await createSalesReturn(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Sales return created successfully.",
      data: salesReturn,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
}

// =====================================================
// GET ALL SALES RETURNS
// =====================================================

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const salesReturns =
      await getSalesReturns();

    return res.json({
      success: true,
      data: salesReturns,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
}

// =====================================================
// GET ONE SALES RETURN
// =====================================================

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const salesReturn =
      await getSalesReturn(
        req.params.id as string
      );

    if (!salesReturn) {
      return res.status(404).json({
        success: false,
        message:
          "Sales return not found.",
      });
    }

    return res.json({
      success: true,
      data: salesReturn,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error.message,
    });
  }
}