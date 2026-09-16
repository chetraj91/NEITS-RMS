import { Request, Response } from "express";

import {
  getSystemSettings,
  updateSystemSettings,
} from "../services/systemSettings.service";

// =====================================================
// GET
// =====================================================

export async function getSystem(
  req: Request,
  res: Response
) {
  try {
    const settings =
      await getSystemSettings();

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error(
      "GET SYSTEM SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load system settings.",
    });
  }
}

// =====================================================
// UPDATE
// =====================================================

export async function updateSystem(
  req: Request,
  res: Response
) {
  try {
    const settings =
      await updateSystemSettings(
        req.body
      );

    return res.json({
      success: true,
      message:
        "System settings updated successfully.",
      data: settings,
    });
  } catch (error: any) {
    console.error(
      "UPDATE SYSTEM SETTINGS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update system settings.",
    });
  }
}