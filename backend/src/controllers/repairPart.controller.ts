import { Request, Response } from "express";
import {
  addRepairPart,
  getRepairParts,
  deleteRepairPart,
} from "../services/repairPart.service";

export async function create(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("========== CREATE REPAIR PART ==========");
    console.log(req.body);

    const repairPart = await addRepairPart(req.body);

    res.status(201).json({
      success: true,
      message: "Repair part added successfully.",
      data: repairPart,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getAll(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const repairJobId = String(req.params.repairJobId);

    const repairParts = await getRepairParts(repairJobId);

    res.json({
      success: true,
      data: repairParts,
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function remove(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const id = String(req.params.id);

    await deleteRepairPart(id);

    res.json({
      success: true,
      message: "Repair part removed successfully.",
    });
  } catch (error: any) {
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}