import { Request, Response } from "express";
import * as technicianService from "../services/technician.service";

export async function createTechnician(req: Request, res: Response) {
  try {
    const technician = await technicianService.createTechnician(req.body);

    res.status(201).json({
      success: true,
      message: "Technician created successfully.",
      data: technician,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTechnicians(req: Request, res: Response) {
  try {
    const technicians = await technicianService.getTechnicians();

    res.json({
      success: true,
      data: technicians,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getTechnician(req: Request, res: Response) {
  try {
    const technician = await technicianService.getTechnician(
      req.params.id as string
    );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: "Technician not found.",
      });
    }

    res.json({
      success: true,
      data: technician,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateTechnician(req: Request, res: Response) {
  try {
    const technician = await technicianService.updateTechnician(
      req.params.id as string,
      req.body
    );

    res.json({
      success: true,
      message: "Technician updated successfully.",
      data: technician,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteTechnician(req: Request, res: Response) {
  try {
    await technicianService.deleteTechnician(req.params.id as string);

    res.json({
      success: true,
      message: "Technician deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}