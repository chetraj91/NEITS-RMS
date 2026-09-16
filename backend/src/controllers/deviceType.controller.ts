import { Request, Response } from "express";
import * as deviceTypeService from "../services/deviceType.service";

export async function getDeviceTypes(req: Request, res: Response) {
  try {
    const data = await deviceTypeService.getDeviceTypes();

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

export async function createDeviceType(req: Request, res: Response) {
  try {
    const data = await deviceTypeService.createDeviceType(req.body.name);

    res.json({
      success: true,
      data,
    });
  } catch (error: any) {

  console.error("DEVICE TYPE ERROR");
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message,
  });

}
}

export async function updateDeviceType(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const data = await deviceTypeService.updateDeviceType(id, req.body);

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

export async function deleteDeviceType(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    await deviceTypeService.deleteDeviceType(id);

    res.json({
      success: true,
      message: "Device Type deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}