import {
  Request,
  Response,
} from "express";

import {
  getReceivingPrintLayout,
  saveReceivingPrintLayout,
  getReceivingPrintSize,
  saveReceivingPrintSize,
} from "../services/receivingPrintLayout.service";

// =====================================================
// GET LAYOUT
// =====================================================

export async function getLayout(
  req: Request,
  res: Response
) {
  try {
    const documentType =
      req.params.documentType as string;

    const data =
      await getReceivingPrintLayout(
        documentType
      );

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "GET RECEIVING PRINT LAYOUT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load receiving print layout.",
    });
  }
}

// =====================================================
// SAVE LAYOUT
// =====================================================

export async function saveLayout(
  req: Request,
  res: Response
) {
  try {
    const documentType =
      req.params.documentType as string;

    const data =
      await saveReceivingPrintLayout(
        documentType,
        req.body?.fields
      );

    res.json({
      success: true,
      message:
        "Receiving print layout saved successfully.",
      data,
    });
  } catch (error: any) {
    console.error(
      "SAVE RECEIVING PRINT LAYOUT ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to save receiving print layout.",
    });
  }
}

// =====================================================
// GET PRINT SIZE
// =====================================================

export async function getPrintSize(
  req: Request,
  res: Response
) {
  try {
    const documentType =
      req.params.documentType as string;

    const data =
      await getReceivingPrintSize(
        documentType
      );

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "GET RECEIVING PRINT SIZE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load print size.",
    });
  }
}

// =====================================================
// SAVE PRINT SIZE
// =====================================================

export async function savePrintSize(
  req: Request,
  res: Response
) {
  try {
    const documentType =
      req.params.documentType as string;

    const data =
      await saveReceivingPrintSize(
        documentType,
        Number(
          req.body?.widthMm
        ),
        Number(
          req.body?.heightMm
        )
      );

    res.json({
      success: true,
      message:
        "Print size saved successfully.",
      data,
    });
  } catch (error: any) {
    console.error(
      "SAVE RECEIVING PRINT SIZE ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to save print size.",
    });
  }
}