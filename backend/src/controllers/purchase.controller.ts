import { Request, Response } from "express";

import {
  createPurchase,
  getPurchases,
  getPurchase,
  deletePurchase,
} from "../services/purchase.service";

// Create Purchase
export async function create(req: Request, res: Response) {
  try {
    const purchase = await createPurchase(req.body);

    return res.status(201).json({
      success: true,
      message: "Purchase created successfully.",
      data: purchase,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Get All Purchases
export async function getAll(req: Request, res: Response) {
  try {
    const purchases = await getPurchases();

    return res.json({
      success: true,
      data: purchases,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Get Single Purchase
export async function getOne(req: Request, res: Response) {
  try {
    const purchase = await getPurchase(req.params.id as string);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found.",
      });
    }

    return res.json({
      success: true,
      data: purchase,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete Purchase
export async function remove(req: Request, res: Response) {
  try {
    await deletePurchase(req.params.id as string);

    return res.json({
      success: true,
      message: "Purchase deleted successfully.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}