import { Request, Response } from "express";

import {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier
} from "../services/supplier.service";

export async function create(req: Request, res: Response) {
  try {
    const supplier = await createSupplier(req.body);

    res.status(201).json({
      success: true,
      message: "Supplier created successfully.",
      data: supplier
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
}

export async function getAll(req: Request, res: Response) {
  try {

    const suppliers = await getSuppliers();

    res.json({
      success: true,
      data: suppliers
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
}

export async function getOne(req: Request, res: Response) {
  try {

    const supplier = await getSupplier(req.params.id as string);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found."
      });
    }

    res.json({
      success: true,
      data: supplier
    });

  } catch (error: any) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
}

export async function update(req: Request, res: Response) {
  try {

    const supplier = await updateSupplier(req.params.id as string, req.body);

    res.json({
      success: true,
      message: "Supplier updated successfully.",
      data: supplier
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
}

export async function remove(req: Request, res: Response) {
  try {

    await deleteSupplier(req.params.id as string);

    res.json({
      success: true,
      message: "Supplier deleted successfully."
    });

  } catch (error: any) {

    res.status(400).json({
      success: false,
      message: error.message
    });

  }
}