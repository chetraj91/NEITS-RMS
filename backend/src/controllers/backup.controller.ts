import { Request, Response } from "express";
import fs from "fs";

import {
  createDatabaseBackup,
  restoreDatabase,
} from "../services/backup.service";

// =====================================================
// CREATE DATABASE BACKUP
// =====================================================

export async function createBackup(
  req: Request,
  res: Response
) {
  let backupFilePath = "";

  try {
    const backup =
      await createDatabaseBackup();

    backupFilePath =
      backup.filePath;

    if (
      !fs.existsSync(
        backupFilePath
      )
    ) {
      return res.status(500).json({
        success: false,
        message:
          "Backup file was not created.",
      });
    }

    res.download(
      backupFilePath,
      backup.fileName,
      (error) => {

        // Delete temporary file
        // after download finishes.
        try {
          if (
            fs.existsSync(
              backupFilePath
            )
          ) {
            fs.unlinkSync(
              backupFilePath
            );
          }
        } catch (cleanupError) {
          console.error(
            "BACKUP FILE CLEANUP ERROR:",
            cleanupError
          );
        }

        if (error) {
          console.error(
            "BACKUP DOWNLOAD ERROR:",
            error
          );
        }
      }
    );

  } catch (error: any) {

    console.error(
      "CREATE DATABASE BACKUP ERROR:",
      error
    );

    // If backup creation failed
    // but a file was created,
    // remove it.
    try {
      if (
        backupFilePath &&
        fs.existsSync(
          backupFilePath
        )
      ) {
        fs.unlinkSync(
          backupFilePath
        );
      }
    } catch {
      // Ignore cleanup error
    }

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to create database backup.",
    });
  }
}
// =====================================================
// RESTORE DATABASE
// =====================================================

export async function restoreBackup(
  req: Request,
  res: Response
) {
  const uploadedFile =
    req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message:
        "Please select a .dump backup file.",
    });
  }

  const uploadedFilePath =
    uploadedFile.path;

  try {

    console.log(
      "RESTORE: Uploaded file:",
      uploadedFile.originalname
    );

    console.log(
      "RESTORE: Temporary path:",
      uploadedFilePath
    );

    // =================================================
    // RESTORE
    // =================================================

    await restoreDatabase(
      uploadedFilePath
    );

    return res.json({
      success: true,
      message:
        "Database restored successfully.",
    });

  } catch (error: any) {

    console.error(
      "RESTORE DATABASE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to restore database.",
    });

  } finally {

    // =================================================
    // DELETE UPLOADED TEMPORARY FILE
    // =================================================

    try {

      if (
        fs.existsSync(
          uploadedFilePath
        )
      ) {
        fs.unlinkSync(
          uploadedFilePath
        );
      }

    } catch (cleanupError) {

      console.error(
        "RESTORE FILE CLEANUP ERROR:",
        cleanupError
      );

    }

  }
}