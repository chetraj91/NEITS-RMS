import { Request, Response } from "express";

import {
  getCustomerLayout,
  saveCustomerLayout,
} from "../services/customerLayout.service";

// =====================================================
// GET
// =====================================================

export async function getLayout(
  req: Request,
  res: Response
) {
  try {
    const data =
      await getCustomerLayout();

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "GET CUSTOMER LAYOUT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load customer layout.",
    });
  }
}

// =====================================================
// SAVE
// =====================================================

export async function saveLayout(
  req: Request,
  res: Response
) {
  try {
    const data =
      await saveCustomerLayout(
        req.body?.fields
      );

    res.json({
      success: true,
      message:
        "Customer layout saved successfully.",
      data,
    });
  } catch (error: any) {
    console.error(
      "SAVE CUSTOMER LAYOUT ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to save customer layout.",
    });
  }
}