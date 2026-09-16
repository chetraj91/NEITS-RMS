import { Request, Response } from "express";
import * as repairJobService from "../services/repairJob.service";

// =========================================
// CREATE REPAIR JOB
// =========================================
export async function createRepairJob(req: Request, res: Response) {
  try {
    const job = await repairJobService.createRepairJob(req.body);

    res.status(201).json({
      success: true,
      message: "Repair Job Created Successfully",
      data: job,
    });

  } catch (error: any) {

    console.error("========== CREATE REPAIR JOB ==========");
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// =========================================
// GET ALL REPAIR JOBS
// =========================================
export async function getRepairJobs(
  req: Request,
  res: Response
) {
  try {

    const jobs = await repairJobService.getRepairJobs();

    res.json({
      success: true,
      data: jobs,
    });

  } catch (error: any) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

// =========================================
// GET SINGLE REPAIR JOB
// =========================================
export async function getRepairJob(
  req: Request,
  res: Response
) {
  try {

   const job = await repairJobService.getRepairJob(
  req.params.id as string
);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Repair Job Not Found",
      });
    }

    res.json({
      success: true,
      data: job,
    });

  } catch (error: any) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
}

// =========================================
// UPDATE REPAIR JOB
// =========================================
export async function updateRepairJob(
  req: Request,
  res: Response
) {
  try {

    const job = await repairJobService.updateRepairJob(
  req.params.id as string,
  req.body
);

    res.json({
      success: true,
      message: "Repair Job Updated Successfully",
      data: job,
    });

  } catch (error: any) {

    console.error("========== UPDATE REPAIR JOB ==========");
    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}

// =========================================
// DELETE REPAIR JOB
// =========================================
export async function deleteRepairJob(
  req: Request,
  res: Response
) {
  try {

   await repairJobService.deleteRepairJob(
  req.params.id as string
);

    res.json({
      success: true,
      message: "Repair Job Deleted Successfully",
    });

  } catch (error: any) {

    console.error(error);

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
}