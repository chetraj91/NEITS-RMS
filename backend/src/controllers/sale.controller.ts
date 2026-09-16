import { Request, Response } from "express";

import {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
  receiveSalePayment,
} from "../services/sale.service";

// =====================================================
// CREATE SALE
// =====================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const sale =
      await createSale(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "Sale created successfully.",
      data: sale,
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
// GET ALL SALES
// =====================================================

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const sales =
      await getSales();

    return res.json({
      success: true,
      data: sales,
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
// GET ONE SALE
// =====================================================

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const sale =
      await getSale(
        req.params.id as string
      );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message:
          "Sale not found.",
      });
    }

    return res.json({
      success: true,
      data: sale,
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
// UPDATE SALE
// =====================================================

export async function update(
  req: Request,
  res: Response
) {
  try {
    const sale =
      await updateSale(
        req.params.id as string,
        req.body
      );

    return res.json({
      success: true,
      message:
        "Sale updated successfully.",
      data: sale,
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
// RECEIVE PAYMENT
// =====================================================

export async function receivePayment(
  req: Request,
  res: Response
) {
  try {
    const sale =
      await receiveSalePayment(
        req.params.id as string,
        {
          amount:
            Number(
              req.body.amount
            ),

          method:
            req.body.method ||
            "CASH",

          remarks:
            req.body.remarks,
        }
      );

    return res.json({
      success: true,
      message:
        "Payment received successfully.",
      data: sale,
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
// DELETE
// =====================================================

export async function remove(
  req: Request,
  res: Response
) {
  try {
    await deleteSale(
      req.params.id as string
    );

    return res.json({
      success: true,
      message:
        "Sale deleted successfully.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error.message,
    });
  }
}