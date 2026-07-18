import { Request, Response } from "express";
import * as repairJobService from "../services/repairJob.service";

export async function createRepairJob(req: Request, res: Response) {
  try {
    const job = await repairJobService.createRepairJob(req.body);

    res.status(201).json({
      success: true,
      message: "Repair job created successfully.",
      data: job,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getRepairJobs(req: Request, res: Response) {
  try {
    const jobs = await repairJobService.getRepairJobs();

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getRepairJob(req: Request, res: Response) {
  try {
    const job = await repairJobService.getRepairJob(req.params.id as string);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Repair job not found.",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateRepairJob(req: Request, res: Response) {
  try {
    const job = await repairJobService.updateRepairJob(
      req.params.id as string,
      req.body
    );

    res.json({
      success: true,
      message: "Repair job updated successfully.",
      data: job,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function deleteRepairJob(req: Request, res: Response) {
  try {
    await repairJobService.deleteRepairJob(req.params.id as string);

    res.json({
      success: true,
      message: "Repair job deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}