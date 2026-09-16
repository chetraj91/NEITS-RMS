import { Request, Response } from "express";

import {
  getDeviceTypeLayout,
  saveDeviceTypeLayout,
} from "../services/deviceTypeLayout.service";

// =====================================================
// GET
// =====================================================

export async function getLayout(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId =
      req.params.deviceTypeId as string;

    const data =
      await getDeviceTypeLayout(
        deviceTypeId
      );

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "GET DEVICE TYPE LAYOUT ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load device type layout.",
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
    const deviceTypeId =
      req.params.deviceTypeId as string;

    const data =
      await saveDeviceTypeLayout(
        deviceTypeId,
        req.body?.fields
      );

    res.json({
      success: true,
      message:
        "Device Type layout saved successfully.",
      data,
    });
  } catch (error: any) {
    console.error(
      "SAVE DEVICE TYPE LAYOUT ERROR:",
      error
    );

    res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to save device type layout.",
    });
  }
}