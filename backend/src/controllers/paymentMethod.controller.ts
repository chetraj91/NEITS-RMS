import { Request, Response } from "express";

import {
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../services/paymentMethod.service";

// =====================================================
// GET ALL
// =====================================================

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const activeOnly =
      String(
        req.query.activeOnly || ""
      ).toLowerCase() ===
      "true";

    const data =
      await getPaymentMethods(
        activeOnly
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load payment methods.",
    });
  }
}

// =====================================================
// GET ONE
// =====================================================

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const data =
      await getPaymentMethod(
        String(req.params.id)
      );

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Payment method not found.",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load payment method.",
    });
  }
}

// =====================================================
// CREATE
// =====================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const data =
      await createPaymentMethod(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Payment method created successfully.",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to create payment method.",
    });
  }
}

// =====================================================
// UPDATE
// =====================================================

export async function update(
  req: Request,
  res: Response
) {
  try {
    const data =
      await updatePaymentMethod(
        String(req.params.id),
        req.body
      );

    return res.json({
      success: true,
      message:
        "Payment method updated successfully.",
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update payment method.",
    });
  }
}

// =====================================================
// DELETE
// =====================================================

export async function remove(
  req: Request,
  res: Response
) {
  try {
    await deletePaymentMethod(
      String(req.params.id)
    );

    return res.json({
      success: true,
      message:
        "Payment method deleted successfully.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to delete payment method.",
    });
  }
}