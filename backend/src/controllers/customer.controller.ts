import { Request, Response } from "express";
import * as customerService from "../services/customer.service";

export async function createCustomer(req: Request, res: Response) {
  try {
    const customer = await customerService.createCustomer(req.body);

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCustomers(req: Request, res: Response) {
  try {
    const customers = await customerService.getCustomers();

    res.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getCustomer(req: Request, res: Response) {
  try {
    const customer = await customerService.getCustomer(req.params.id as string);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateCustomer(req: Request, res: Response) {
  try {
    const customer = await customerService.updateCustomer(
      req.params.id as string,
      req.body
    );

    res.json({
      success: true,
      message: "Customer updated successfully.",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteCustomer(req: Request, res: Response) {
  try {
    await customerService.deleteCustomer(req.params.id as string);

    res.json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}