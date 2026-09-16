import api from "./axios";

// =====================================================
// DOWNLOAD DATABASE BACKUP
// =====================================================

export async function downloadDatabaseBackup() {
  const response = await api.get(
    "/backup/download",
    {
      responseType: "blob",
    }
  );

  return response;
}

// =====================================================
// RESTORE DATABASE BACKUP
// =====================================================

export async function restoreDatabaseBackup(
  file: File
) {
  const formData =
    new FormData();

  formData.append(
    "backup",
    file
  );

  const response =
    await api.post(
      "/backup/restore",
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      }
    );

  return response;
}

// =====================================================
// DOWNLOAD EXCEL BACKUP
// =====================================================

export async function downloadExcelBackup() {
  const response = await api.get(
    "/excel-backup/download",
    {
      responseType: "blob",
    }
  );

  return response;
}

// =====================================================
// CONNECT GOOGLE DRIVE
// =====================================================

export async function connectGoogleDrive() {
  const response = await api.get(
    "/google-drive/connect"
  );

  return response;
}

// =====================================================
// UPLOAD EXCEL BACKUP TO GOOGLE DRIVE
// =====================================================

export async function uploadExcelBackupToGoogleDrive() {
  const response = await api.post(
    "/google-drive/excel-backup"
  );

  return response;
}