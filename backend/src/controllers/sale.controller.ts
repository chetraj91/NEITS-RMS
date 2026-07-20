import { Request, Response } from "express";

import {
  createSale,
  getSales,
  getSale,
  updateSale,
  deleteSale,
} from "../services/sale.service";

export async function create(req: Request, res: Response) {
  try {
    const sale = await createSale(req.body);

    res.status(201).json({
      success: true,
      message: "Sale created successfully.",
      data: sale,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const sales = await getSales();

    res.json({
      success: true,
      data: sales,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const sale = await getSale(req.params.id as string);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }

    res.json({
      success: true,
      data: sale,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const sale = await updateSale(req.params.id as string, req.body);

    res.json({
      success: true,
      message: "Sale updated successfully.",
      data: sale,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    await deleteSale(req.params.id as string);

    res.json({
      success: true,
      message: "Sale deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}