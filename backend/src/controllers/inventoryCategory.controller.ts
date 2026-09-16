import { Request, Response } from "express";

import {
  getInventoryCategories,
  getAllInventoryCategories,
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "../services/inventoryCategory.service";

/**
 * GET ACTIVE CATEGORIES
 */
export async function getActive(req: Request, res: Response) {
  try {
    const categories = await getInventoryCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * GET ALL CATEGORIES
 */
export async function getAll(req: Request, res: Response) {
  try {
    const categories = await getAllInventoryCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * CREATE CATEGORY
 */
export async function create(req: Request, res: Response) {
  try {
    const category = await createInventoryCategory(
      req.body.name
    );

    res.status(201).json({
      success: true,
      message: "Inventory category created successfully.",
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * UPDATE CATEGORY
 */
export async function update(req: Request, res: Response) {
  try {
    const category = await updateInventoryCategory(
      String(req.params.id),
      req.body
    );

    res.json({
      success: true,
      message: "Inventory category updated successfully.",
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * DELETE CATEGORY
 */
export async function remove(req: Request, res: Response) {
  try {
    await deleteInventoryCategory(
      String(req.params.id)
    );

    res.json({
      success: true,
      message: "Inventory category deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}