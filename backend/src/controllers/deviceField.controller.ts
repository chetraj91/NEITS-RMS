import { Request, Response } from "express";
import * as deviceFieldService from "../services/deviceField.service";

// =================================
// Get All Device Fields
// =================================
export async function getDeviceFields(
  req: Request,
  res: Response
) {
  try {
    const data =
      await deviceFieldService.getDeviceFields();

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

// =================================
// Create Device Field
// =================================
export async function createDeviceField(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      fieldType,
      placeholder,
      required,
      active,
      category,
    } = req.body;

    const data =
      await deviceFieldService.createDeviceField({
        name,
        fieldType,
        placeholder,
        required,
        active,
        category,
      });

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

// =================================
// Update Device Field
// =================================
export async function updateDeviceField(
  req: Request,
  res: Response
) {
  try {
    const id =
      req.params.id as string;

    const data =
      await deviceFieldService.updateDeviceField(
        id,
        req.body
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

// =================================
// Delete Device Field
// =================================
export async function deleteDeviceField(
  req: Request,
  res: Response
) {
  try {
    const id =
      req.params.id as string;

    await deviceFieldService.deleteDeviceField(
      id
    );

    res.json({
      success: true,
      message:
        "Device Field deleted successfully",
    });
  } catch (error: any) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}