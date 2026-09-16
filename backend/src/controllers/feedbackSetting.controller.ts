import { Request, Response } from "express";

import {
  getFeedbackSettings,
  updateFeedbackSettings,
} from "../services/feedbackSetting.service";

// =====================================================
// GET FEEDBACK SETTINGS
// =====================================================

export async function getFeedback(
  req: Request,
  res: Response
) {
  try {
    const settings =
      await getFeedbackSettings();

    return res.json({
      success: true,
      data: settings,
    });

  } catch (error: any) {

    console.error(
      "GET FEEDBACK SETTINGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load feedback settings.",
    });
  }
}

// =====================================================
// UPDATE FEEDBACK SETTINGS
// =====================================================

export async function updateFeedback(
  req: Request,
  res: Response
) {
  try {

    const settings =
      await updateFeedbackSettings(
        req.body
      );

    return res.json({
      success: true,
      message:
        "Feedback settings updated successfully.",
      data: settings,
    });

  } catch (error: any) {

    console.error(
      "UPDATE FEEDBACK SETTINGS ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update feedback settings.",
    });
  }
}