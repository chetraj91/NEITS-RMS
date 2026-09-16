import { Readable } from "stream";
import { createNeitsRmsWorkbook } from "./excelBackup.service";
import { google } from "googleapis";
import { getGoogleDriveClient } from "./googleDrive.service";
import { getCompanySettings } from "./companySettings.service";
import { prisma } from "../config/prisma";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const ROOT_FILE_NAME =
  "NEITS RMS Data.xlsx";

const BACKUP_FOLDER_NAME =
  "NEITS RMS Backup";

const MONTHLY_FOLDER_NAME =
  "Monthly Backup";

function escapeDriveQueryValue(
  value: string
): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

async function findDriveFile(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
) {
  const conditions = [
    `name = '${escapeDriveQueryValue(name)}'`,
    "trashed = false",
  ];

  if (parentId) {
    conditions.push(
      `'${escapeDriveQueryValue(parentId)}' in parents`
    );
  }

  const response =
    await drive.files.list({
      q: conditions.join(" and "),
      fields:
        "files(id, name, mimeType, parents)",
      pageSize: 10,
    });

  return response.data.files?.[0] ?? null;
}

async function createFolder(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
) {
  const requestBody: {
    name: string;
    mimeType: string;
    parents?: string[];
  } = {
    name,
    mimeType:
      "application/vnd.google-apps.folder",
  };

  if (parentId) {
    requestBody.parents = [
      parentId,
    ];
  }

  const response =
    await drive.files.create({
      requestBody,
      fields: "id, name, mimeType",
    });

  if (!response.data.id) {
    throw new Error(
      `Unable to create Google Drive folder: ${name}`
    );
  }

  return response.data.id;
}

async function getBackupRootFolder(
  drive: ReturnType<typeof google.drive>
) {
  const settings =
    await getCompanySettings();

  const configuredFolderId =
    settings.googleDriveFolderId?.trim();

  /*
   * First try the folder ID configured in Company Settings.
   *
   * If Google reports that the folder is not accessible
   * with the current drive.file authorization, create a
   * new folder through the application itself.
   *
   * A folder created by the application is accessible
   * under the drive.file scope.
   */
  if (configuredFolderId) {
    try {
      const response =
        await drive.files.get({
          fileId: configuredFolderId,
          fields:
            "id, name, mimeType, trashed",
        });

      if (
        response.data.id &&
        !response.data.trashed &&
        response.data.mimeType ===
          "application/vnd.google-apps.folder"
      ) {
        return response.data.id;
      }

      console.log(
        "Configured Google Drive backup location is not a valid folder. Creating an application-managed folder."
      );
    } catch (error: any) {
      console.warn(
        "Configured Google Drive backup folder is not accessible. Creating an application-managed backup folder.",
        error?.message || error
      );
    }
  }

  /*
   * Create the backup folder through NEITS RMS.
   *
   * Because the application creates this folder,
   * it is compatible with the drive.file OAuth scope.
   */
  const newFolderId =
    await createFolder(
      drive,
      BACKUP_FOLDER_NAME
    );

  /*
   * Save the new application-managed folder ID
   * into CompanySettings so future backups reuse
   * the same folder instead of creating another one.
   */
  await prisma.companySettings.update({
    where: {
      id: settings.id,
    },
    data: {
      googleDriveFolderId:
        newFolderId,
    },
  });

  console.log(
    "Google Drive backup folder created by NEITS RMS:",
    newFolderId
  );

  return newFolderId;
}

async function getMonthlyBackupFolder(
  drive: ReturnType<typeof google.drive>,
  rootFolderId: string
) {
  const existing =
    await findDriveFile(
      drive,
      MONTHLY_FOLDER_NAME,
      rootFolderId
    );

  if (existing?.id) {
    return existing.id;
  }

  return createFolder(
    drive,
    MONTHLY_FOLDER_NAME,
    rootFolderId
  );
}

async function uploadOrUpdateExcelFile(
  drive: ReturnType<typeof google.drive>,
  fileName: string,
  buffer: Buffer,
  parentId: string
) {
  const existing =
    await findDriveFile(
      drive,
      fileName,
      parentId
    );

  const media = {
    mimeType: EXCEL_MIME_TYPE,
    body: Readable.from(buffer),
  };

  if (existing?.id) {
    const response =
      await drive.files.update({
        fileId: existing.id,
        media,
        fields:
          "id, name, webViewLink, modifiedTime",
      });

    return response.data;
  }

  const response =
    await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [
          parentId,
        ],
      },
      media,
      fields:
        "id, name, webViewLink, modifiedTime",
    });

  return response.data;
}

export async function uploadLatestExcelBackup(
  buffer: Buffer
) {
  const drive =
    await getGoogleDriveClient();

  const rootFolderId =
    await getBackupRootFolder(
      drive
    );

  return uploadOrUpdateExcelFile(
    drive,
    ROOT_FILE_NAME,
    buffer,
    rootFolderId
  );
}

export async function uploadMonthlyExcelBackup(
  buffer: Buffer,
  date = new Date()
) {
  const drive =
    await getGoogleDriveClient();

  const rootFolderId =
    await getBackupRootFolder(
      drive
    );

  const monthlyFolderId =
    await getMonthlyBackupFolder(
      drive,
      rootFolderId
    );

  const monthName =
    date.toLocaleString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  const fileName =
    `NEITS RMS Data - ${monthName}.xlsx`;

  return uploadOrUpdateExcelFile(
    drive,
    fileName,
    buffer,
    monthlyFolderId
  );
}

export async function createExcelBackupBuffer(): Promise<Buffer> {
  const workbook =
    await createNeitsRmsWorkbook();

  const buffer =
    await workbook.xlsx.writeBuffer();

  return Buffer.from(buffer);
}

export async function runAutomaticExcelBackup() {
  const settings =
    await getCompanySettings();

  if (!settings.excelBackupEnabled) {
    return {
      skipped: true,
      reason:
        "Excel backup is disabled.",
    };
  }

  if (!settings.googleDriveRefreshToken) {
    return {
      skipped: true,
      reason:
        "Google Drive is not connected.",
    };
  }

  if (
    !settings.googleDriveFolderId?.trim()
  ) {
    return {
      skipped: true,
      reason:
        "Google Drive backup folder is not configured.",
    };
  }

  const buffer =
    await createExcelBackupBuffer();

  const latestFile =
    await uploadLatestExcelBackup(
      buffer
    );

  const monthlyFile =
    await uploadMonthlyExcelBackup(
      buffer
    );

  return {
    skipped: false,
    latestFile,
    monthlyFile,
  };
}