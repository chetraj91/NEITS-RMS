import { Request, Response } from "express";

import {
  addRepairPart,
  getRepairParts,
  deleteRepairPart,
} from "../services/repairPart.service";

export async function create(req: Request, res: Response) {
  try {
    const repairPart = await addRepairPart(req.body);

    res.status(201).json({
      success: true,
      message: "Repair part added successfully.",
      data: repairPart,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAll(req: Request, res: Response) {
  try {
    const repairJobId = req.params.repairJobId as string;

    const repairParts = await getRepairParts(repairJobId);

    res.json({
      success: true,
      data: repairParts,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    await deleteRepairPart(id);

    res.json({
      success: true,
      message: "Repair part removed successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}