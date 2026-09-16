import { Request, Response } from "express";

import {
  getCompanySettings,
  updateCompanySettings,
} from "../services/companySettings.service";

// =====================================================
// GET COMPANY SETTINGS
// =====================================================

export async function getCompany(
  req: Request,
  res: Response
) {
  try {
    const company =
      await getCompanySettings();

    return res.json({
      success: true,
      data: company,
    });
  } catch (error: any) {
    console.error(
      "GET COMPANY SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load company settings.",
    });
  }
}

// =====================================================
// UPDATE COMPANY SETTINGS
// =====================================================

export async function updateCompany(
  req: Request,
  res: Response
) {
  try {
    const company =
      await updateCompanySettings(
        req.body
      );

    return res.json({
      success: true,
      message:
        "Company settings updated successfully.",
      data: company,
    });
  } catch (error: any) {
    console.error(
      "UPDATE COMPANY SETTINGS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update company settings.",
    });
  }
}