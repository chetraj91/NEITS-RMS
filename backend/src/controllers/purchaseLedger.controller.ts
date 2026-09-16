import { Request, Response } from "express";
import { getPurchasePartyLedger } from "../services/purchaseLedger.service";

export async function getLedger(
  _req: Request,
  res: Response
) {
  try {
    const data =
      await getPurchasePartyLedger();

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "PURCHASE PARTY LEDGER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to load purchase party ledger.",
    });
  }
}