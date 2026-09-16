import {
  Request,
  Response,
} from "express";

import {
  getReceivingPrinterSettings,
  saveReceivingPrinterSettings,
} from "../services/receivingPrinterSetting.service";

// =====================================================
// GET
// =====================================================

export async function getSettings(
  _req: Request,
  res: Response
) {
  try {
    const data =
      await getReceivingPrinterSettings();

    res.json({
      success: true,
      data,
    });

  } catch (error: any) {

    console.error(
      "GET RECEIVING PRINTER SETTINGS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load printer settings.",
    });
  }
}

// =====================================================
// SAVE
// =====================================================

export async function saveSettings(
  req: Request,
  res: Response
) {
  try {

    const voucherPrinter =
      typeof req.body?.voucherPrinter ===
      "string"
        ? req.body.voucherPrinter
        : null;

    const stickerPrinter =
      typeof req.body?.stickerPrinter ===
      "string"
        ? req.body.stickerPrinter
        : null;

    const data =
      await saveReceivingPrinterSettings(
        voucherPrinter,
        stickerPrinter
      );

    res.json({
      success: true,
      message:
        "Receiving printer settings saved successfully.",
      data,
    });

  } catch (error: any) {

    console.error(
      "SAVE RECEIVING PRINTER SETTINGS ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to save printer settings.",
    });
  }
}