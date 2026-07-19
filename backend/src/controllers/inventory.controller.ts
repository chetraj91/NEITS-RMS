import { Request, Response } from "express";

import {
  createInventory,
  getInventory,
  getInventoryItem,
  updateInventory,
  deleteInventory,
} from "../services/inventory.service";

export async function create(req: Request, res: Response) {
  try {
    const inventory = await createInventory(req.body);

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully.",
      data: inventory,
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
    const inventory = await getInventory();

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const inventory = await getInventoryItem(String(req.params.id));

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found.",
      });
    }

    res.json({
      success: true,
      data: inventory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const inventory = await updateInventory(String(req.params.id), req.body);

    res.json({
      success: true,
      message: "Inventory updated successfully.",
      data: inventory,
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
    await deleteInventory(String(req.params.id));
    res.json({
      success: true,
      message: "Inventory deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}