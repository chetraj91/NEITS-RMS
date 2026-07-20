import { Request, Response } from "express";

import {
  getRepairInvoice,
  getSaleInvoice,
} from "../services/invoice.service";

export async function repairInvoice(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const invoice = await getRepairInvoice(id);

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function saleInvoice(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const invoice = await getSaleInvoice(id);

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}