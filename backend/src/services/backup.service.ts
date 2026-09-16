import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

// =====================================================
// FIND PG_DUMP
// =====================================================

function findPgDump(): string {
  if (process.platform === "win32") {

    const possiblePaths = [
      "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe",
      "C:\\Program Files\\PostgreSQL\\13\\bin\\pg_dump.exe",
    ];

    for (
      const pgDumpPath
      of possiblePaths
    ) {

      if (
        fs.existsSync(
          pgDumpPath
        )
      ) {
        return pgDumpPath;
      }
    }
  }

  return "pg_dump";
}

// =====================================================
// FIND PG_RESTORE
// =====================================================

function findPgRestore(): string {
  if (
    process.platform ===
    "win32"
  ) {

    const possiblePaths = [
      "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_restore.exe",
      "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_restore.exe",
      "C:\\Program Files\\PostgreSQL\\15\\bin\\pg_restore.exe",
      "C:\\Program Files\\PostgreSQL\\14\\bin\\pg_restore.exe",
      "C:\\Program Files\\PostgreSQL\\13\\bin\\pg_restore.exe",
    ];

    for (
      const restorePath
      of possiblePaths
    ) {

      if (
        fs.existsSync(
          restorePath
        )
      ) {
        return restorePath;
      }
    }
  }

  return "pg_restore";
}

// =====================================================
// CREATE DATABASE BACKUP
// =====================================================

export async function createDatabaseBackup(): Promise<{
  filePath: string;
  fileName: string;
}> {

  return new Promise(
    (resolve, reject) => {

      const databaseUrl =
        process.env.DATABASE_URL;

      if (!databaseUrl) {

        reject(
          new Error(
            "DATABASE_URL is not configured."
          )
        );

        return;
      }

      const pgDump =
        findPgDump();

      console.log(
        "BACKUP: Using pg_dump:",
        pgDump
      );

      // -------------------------------------------------
      // TEMPORARY DOWNLOAD DIRECTORY
      // -------------------------------------------------

      const backupDirectory =
        path.join(
          os.tmpdir(),
          "neits-rms-backups"
        );

      fs.mkdirSync(
        backupDirectory,
        {
          recursive: true,
        }
      );

      // -------------------------------------------------
      // FILE NAME
      // -------------------------------------------------

      const timestamp =
        new Date()
          .toISOString()
          .replace(
            /[:.]/g,
            "-"
          );

      const fileName =
        `neits-rms-backup-${timestamp}.dump`;

      const filePath =
        path.join(
          backupDirectory,
          fileName
        );

      console.log(
        "BACKUP: Output file:",
        filePath
      );

      // -------------------------------------------------
      // PG_DUMP
      // -------------------------------------------------

      const dumpProcess =
        spawn(
          pgDump,
          [
            `--dbname=${databaseUrl}`,
            "--format=custom",
            `--file=${filePath}`,
          ],
          {
            windowsHide: true,
          }
        );

      let errorOutput =
        "";

      dumpProcess.stderr.on(
        "data",
        (data) => {

          const message =
            data.toString();

          errorOutput +=
            message;

          console.error(
            "PG_DUMP:",
            message
          );
        }
      );

      dumpProcess.on(
        "error",
        (error) => {

          console.error(
            "PG_DUMP PROCESS ERROR:",
            error
          );

          reject(
            new Error(
              `Unable to start pg_dump: ${error.message}`
            )
          );
        }
      );

      dumpProcess.on(
        "close",
        (code) => {

          console.log(
            "BACKUP: pg_dump exit code:",
            code
          );

          if (
            code !== 0
          ) {

            reject(
              new Error(
                errorOutput.trim() ||
                `pg_dump failed with exit code ${code}.`
              )
            );

            return;
          }

          if (
            !fs.existsSync(
              filePath
            )
          ) {

            reject(
              new Error(
                "pg_dump completed, but the backup file was not created."
              )
            );

            return;
          }

          const stats =
            fs.statSync(
              filePath
            );

          console.log(
            "BACKUP: File size:",
            stats.size,
            "bytes"
          );

          if (
            stats.size === 0
          ) {

            reject(
              new Error(
                "Backup file was created but is empty."
              )
            );

            return;
          }

          resolve({
            filePath,
            fileName,
          });
        }
      );
    }
  );
}

// =====================================================
// CREATE PERMANENT SAFETY BACKUP
//
// This backup is NOT deleted automatically.
// It is created immediately before restore.
// =====================================================

async function createSafetyBackup(): Promise<{
  filePath: string;
  fileName: string;
}> {

  return new Promise(
    (resolve, reject) => {

      const databaseUrl =
        process.env.DATABASE_URL;

      if (!databaseUrl) {

        reject(
          new Error(
            "DATABASE_URL is not configured."
          )
        );

        return;
      }

      const pgDump =
        findPgDump();

      // -------------------------------------------------
      // PERMANENT BACKUP DIRECTORY
      // -------------------------------------------------

      const backupDirectory =
        path.join(
          process.cwd(),
          "backups"
        );

      fs.mkdirSync(
        backupDirectory,
        {
          recursive: true,
        }
      );

      // -------------------------------------------------
      // FILE NAME
      // -------------------------------------------------

      const timestamp =
        new Date()
          .toISOString()
          .replace(
            /[:.]/g,
            "-"
          );

      const fileName =
        `pre-restore-${timestamp}.dump`;

      const filePath =
        path.join(
          backupDirectory,
          fileName
        );

      console.log(
        "SAFETY BACKUP: Creating:",
        filePath
      );

      // -------------------------------------------------
      // PG_DUMP
      // -------------------------------------------------

      const dumpProcess =
        spawn(
          pgDump,
          [
            `--dbname=${databaseUrl}`,
            "--format=custom",
            `--file=${filePath}`,
          ],
          {
            windowsHide: true,
          }
        );

      let errorOutput =
        "";

      dumpProcess.stderr.on(
        "data",
        (data) => {

          const message =
            data.toString();

          errorOutput +=
            message;

          console.error(
            "SAFETY PG_DUMP:",
            message
          );
        }
      );

      dumpProcess.on(
        "error",
        (error) => {

          console.error(
            "SAFETY BACKUP ERROR:",
            error
          );

          reject(
            new Error(
              `Unable to start safety backup: ${error.message}`
            )
          );
        }
      );

      dumpProcess.on(
        "close",
        (code) => {

          console.log(
            "SAFETY BACKUP: pg_dump exit code:",
            code
          );

          if (
            code !== 0
          ) {

            reject(
              new Error(
                errorOutput.trim() ||
                `Safety backup failed with exit code ${code}.`
              )
            );

            return;
          }

          if (
            !fs.existsSync(
              filePath
            )
          ) {

            reject(
              new Error(
                "Safety backup file was not created."
              )
            );

            return;
          }

          const stats =
            fs.statSync(
              filePath
            );

          if (
            stats.size === 0
          ) {

            reject(
              new Error(
                "Safety backup file is empty."
              )
            );

            return;
          }

          console.log(
            "SAFETY BACKUP: Created successfully:",
            filePath
          );

          resolve({
            filePath,
            fileName,
          });
        }
      );
    }
  );
}

// =====================================================
// VALIDATE BACKUP FILE
//
// pg_restore --list reads the archive without restoring.
// =====================================================

async function validateBackupFile(
  backupFilePath: string
): Promise<void> {

  return new Promise(
    (resolve, reject) => {

      const pgRestore =
        findPgRestore();

      console.log(
        "VALIDATE: Using pg_restore:",
        pgRestore
      );

      console.log(
        "VALIDATE: Backup:",
        backupFilePath
      );

      const process =
        spawn(
          pgRestore,
          [
            "--list",
            backupFilePath,
          ],
          {
            windowsHide: true,
          }
        );

      let errorOutput =
        "";

      process.stderr.on(
        "data",
        (data) => {

          errorOutput +=
            data.toString();
        }
      );

      process.on(
        "error",
        (error) => {

          reject(
            new Error(
              `Unable to validate backup: ${error.message}`
            )
          );
        }
      );

      process.on(
        "close",
        (code) => {

          console.log(
            "VALIDATE: pg_restore exit code:",
            code
          );

          if (
            code !== 0
          ) {

            reject(
              new Error(
                errorOutput.trim() ||
                "The selected file is not a valid PostgreSQL backup."
              )
            );

            return;
          }

          resolve();
        }
      );
    }
  );
}

// =====================================================
// RESTORE DATABASE
// =====================================================

export async function restoreDatabase(
  backupFilePath: string
): Promise<void> {

  const databaseUrl =
    process.env.DATABASE_URL;

  if (!databaseUrl) {

    throw new Error(
      "DATABASE_URL is not configured."
    );
  }

  // ===================================================
  // FILE CHECK
  // ===================================================

  if (
    !fs.existsSync(
      backupFilePath
    )
  ) {

    throw new Error(
      "Uploaded backup file was not found."
    );
  }

  const stats =
    fs.statSync(
      backupFilePath
    );

  if (
    stats.size === 0
  ) {

    throw new Error(
      "The backup file is empty."
    );
  }

  // ===================================================
  // STEP 1
  // VALIDATE SELECTED BACKUP
  // ===================================================

  console.log(
    "RESTORE: Validating selected backup..."
  );

  await validateBackupFile(
    backupFilePath
  );

  console.log(
    "RESTORE: Backup validation successful."
  );

  // ===================================================
  // STEP 2
  // CREATE SAFETY BACKUP
  //
  // IMPORTANT:
  // If this fails, RESTORE WILL NOT START.
  // ===================================================

  console.log(
    "RESTORE: Creating safety backup of current database..."
  );

  const safetyBackup =
    await createSafetyBackup();

  console.log(
    "RESTORE: Safety backup created:",
    safetyBackup.filePath
  );

  // ===================================================
  // STEP 3
  // FIND PG_RESTORE
  // ===================================================

  const pgRestore =
    findPgRestore();

  console.log(
    "RESTORE: Using pg_restore:",
    pgRestore
  );

  console.log(
    "RESTORE: Backup file:",
    backupFilePath
  );

  // ===================================================
  // STEP 4
  // RESTORE
  // ===================================================

  await new Promise<void>(
    (resolve, reject) => {

      const restoreProcess =
        spawn(
          pgRestore,
          [
            `--dbname=${databaseUrl}`,
            "--clean",
            "--if-exists",
            "--no-owner",
            "--no-privileges",
            backupFilePath,
          ],
          {
            windowsHide: true,
          }
        );

      let errorOutput =
        "";

      restoreProcess.stderr.on(
        "data",
        (data) => {

          const message =
            data.toString();

          errorOutput +=
            message;

          console.error(
            "PG_RESTORE:",
            message
          );
        }
      );

      restoreProcess.on(
        "error",
        (error) => {

          console.error(
            "PG_RESTORE PROCESS ERROR:",
            error
          );

          reject(
            new Error(
              `Unable to start pg_restore: ${error.message}`
            )
          );
        }
      );

      restoreProcess.on(
        "close",
        (code) => {

          console.log(
            "RESTORE: pg_restore exit code:",
            code
          );

          if (
            code !== 0
          ) {

            reject(
              new Error(
                errorOutput.trim() ||
                `pg_restore failed with exit code ${code}.`
              )
            );

            return;
          }

          resolve();
        }
      );
    }
  );

  // ===================================================
  // RESTORE SUCCESS
  // ===================================================

  console.log(
    "================================================="
  );

  console.log(
    "RESTORE SUCCESSFUL"
  );

  console.log(
    "Safety backup:",
    safetyBackup.filePath
  );

  console.log(
    "================================================="
  );
}