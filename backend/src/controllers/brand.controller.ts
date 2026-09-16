import { Request, Response } from "express";
import * as brandService from "../services/brand.service";

// =========================
// Get All Brands
// =========================
export async function getBrands(req: Request, res: Response) {
  try {
    const data = await brandService.getBrands();

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

// =========================
// Get Brands By Device Type
// =========================
export async function getBrandsByDeviceType(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId = String(req.params.deviceTypeId);

    const data =
      await brandService.getBrandsByDeviceType(deviceTypeId);

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

// =========================
// Create Brand
// =========================
export async function createBrand(req: Request, res: Response) {
  try {
    const { name, deviceTypeId } = req.body;

    const data =
      await brandService.createBrand(name, deviceTypeId);

    res.json({
      success: true,
      data,
    });

  } catch (error: any) {
    console.error("BRAND ERROR");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// =========================
// Update Brand
// =========================
export async function updateBrand(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const data =
      await brandService.updateBrand(id, req.body);

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

// =========================
// Delete Brand
// =========================
export async function deleteBrand(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    await brandService.deleteBrand(id);

    res.json({
      success: true,
      message: "Brand deleted successfully",
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}