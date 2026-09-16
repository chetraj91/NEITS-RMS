import { runAutomaticExcelBackup } from "./googleDriveExcelBackup.service";

let backupRunning = false;
let backupQueued = false;

export function triggerAutomaticExcelBackup(): void {
  if (backupRunning) {
    backupQueued = true;

    console.log(
      "AUTOMATIC EXCEL BACKUP: backup already running. New backup queued."
    );

    return;
  }

  backupRunning = true;

  console.log(
    "AUTOMATIC EXCEL BACKUP: triggered."
  );

  void runBackup();
}

async function runBackup(): Promise<void> {
  try {
    const result =
      await runAutomaticExcelBackup();

    if (result.skipped) {
      console.log(
        "AUTOMATIC EXCEL BACKUP: skipped.",
        result.reason
      );

      return;
    }

    console.log(
      "AUTOMATIC EXCEL BACKUP: completed successfully."
    );

    console.log(
      "AUTOMATIC EXCEL BACKUP: Latest Google Drive file:",
      result.latestFile?.name ||
        "Unknown"
    );

    console.log(
      "AUTOMATIC EXCEL BACKUP: Latest Google Drive file ID:",
      result.latestFile?.id ||
        "Unknown"
    );

    console.log(
      "AUTOMATIC EXCEL BACKUP: Latest Google Drive modified time:",
      result.latestFile?.modifiedTime ||
        "Unknown"
    );

    console.log(
      "AUTOMATIC EXCEL BACKUP: Monthly Google Drive file:",
      result.monthlyFile?.name ||
        "Unknown"
    );

    console.log(
      "AUTOMATIC EXCEL BACKUP: Monthly Google Drive file ID:",
      result.monthlyFile?.id ||
        "Unknown"
    );

    console.log(
      "AUTOMATIC EXCEL BACKUP: Monthly Google Drive modified time:",
      result.monthlyFile?.modifiedTime ||
        "Unknown"
    );
  } catch (error: any) {
    console.error(
      "AUTOMATIC EXCEL BACKUP ERROR:",
      error?.message ||
        "Automatic Google Drive Excel backup failed."
    );

    console.error(
      "AUTOMATIC EXCEL BACKUP ERROR DETAILS:",
      error
    );
  } finally {
    backupRunning = false;

    if (backupQueued) {
      backupQueued = false;

      console.log(
        "AUTOMATIC EXCEL BACKUP: processing queued backup."
      );

      triggerAutomaticExcelBackup();
    }
  }
}