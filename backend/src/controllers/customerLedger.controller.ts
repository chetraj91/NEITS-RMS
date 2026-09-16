import { Request, Response } from "express";

import {
  getCustomerLedger,
  getCustomerDetailedLedger,
} from "../services/customerLedger.service";

export async function ledger(req: Request, res: Response) {
  try {
    const customerId = String(req.params.customerId);

    const data = await getCustomerLedger(customerId);

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Unable to load ledger",
    });
  }
}

export async function detailedLedger(
  req: Request,
  res: Response
) {
  try {
    const customerId =
      String(req.params.customerId);

    const data =
      await getCustomerDetailedLedger(
        customerId
      );

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message:
        "Unable to load detailed ledger",
    });
  }
}