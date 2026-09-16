import { Request, Response } from "express";
import * as deviceTypeFieldService from "../services/deviceTypeField.service";

// ===================================
// Get Fields of a Device Type
// ===================================

export async function getDeviceTypeFields(
  req: Request,
  res: Response
) {
  try {

    const deviceTypeId = req.params.deviceTypeId as string;

    const data =
      await deviceTypeFieldService.getDeviceTypeFields(
        deviceTypeId
      );

    res.json({
      success: true,
      data,
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

// ===================================
// Save Mapping
// ===================================

export async function saveDeviceTypeFields(
  req: Request,
  res: Response
) {
  try {

    const deviceTypeId = req.params.deviceTypeId as string;

    const { fields } = req.body;

    const data =
      await deviceTypeFieldService.saveDeviceTypeFields(
        deviceTypeId,
        fields
      );

    res.json({
      success: true,
      data,
    });

  } catch (error: any) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}