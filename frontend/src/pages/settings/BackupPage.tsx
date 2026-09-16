import {
  useRef,
  useState,
} from "react";

import {
  downloadDatabaseBackup,
  restoreDatabaseBackup,
  downloadExcelBackup,
  connectGoogleDrive,
  uploadExcelBackupToGoogleDrive,
} from "../../api/backup";

// =====================================================
// BACKUP PAGE
// =====================================================

export default function BackupPage() {

  const [isBackingUp, setIsBackingUp] =
    useState(false);

  const [isRestoring, setIsRestoring] =
    useState(false);

  const [isExcelBackingUp, setIsExcelBackingUp] =
    useState(false);

    const [isGoogleDriveConnecting, setIsGoogleDriveConnecting] =
  useState(false);

  const [isGoogleDriveBackingUp, setIsGoogleDriveBackingUp] =
  useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  // =====================================================
  // DOWNLOAD DATABASE BACKUP
  // =====================================================

  async function handleBackup() {

    try {

      setIsBackingUp(true);
      setMessage("");
      setError("");

      const response =
        await downloadDatabaseBackup();

      const blob =
        new Blob(
          [response.data],
          {
            type:
              "application/octet-stream",
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "neits-rms-backup.dump";

      document.body.appendChild(
        link
      );

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        url
      );

      setMessage(
        "Database backup created and downloaded successfully."
      );

    } catch (err: any) {

      console.error(
        "DATABASE BACKUP ERROR:",
        err
      );

      let errorMessage =
        "Unable to create database backup.";

      if (
        err?.response?.data
      ) {

        const data =
          err.response.data;

        if (
          typeof data ===
            "object" &&
          data.message
        ) {
          errorMessage =
            data.message;
        }
      }

      setError(
        errorMessage
      );

    } finally {

      setIsBackingUp(
        false
      );

    }
  }

  // =====================================================
// DOWNLOAD EXCEL BACKUP
// =====================================================

async function handleExcelBackup() {

  try {

    setIsExcelBackingUp(true);
    setMessage("");
    setError("");

    const response =
      await downloadExcelBackup();

    const blob =
      new Blob(
        [response.data],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "NEITS RMS Data.xlsx";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );

    setMessage(
      "Excel backup created and downloaded successfully."
    );

  } catch (err: any) {

    console.error(
      "EXCEL BACKUP ERROR:",
      err
    );

    let errorMessage =
      "Unable to create Excel backup.";

    if (
      err?.response?.data
    ) {

      const data =
        err.response.data;

      if (
        typeof data ===
          "object" &&
        data.message
      ) {

        errorMessage =
          data.message;

      }

    }

    setError(
      errorMessage
    );

  } finally {

    setIsExcelBackingUp(
      false
    );

  }
}

  // =====================================================
  // CONNECT GOOGLE DRIVE
  // =====================================================

  async function handleConnectGoogleDrive() {

    try {

      setIsGoogleDriveConnecting(true);
      setMessage("");
      setError("");

      const response =
        await connectGoogleDrive();

      const authorizationUrl =
        response?.data?.authorizationUrl;

      if (!authorizationUrl) {
        throw new Error(
          "Google authorization URL was not received."
        );
      }

      window.location.href =
        authorizationUrl;

    } catch (err: any) {

      console.error(
        "GOOGLE DRIVE CONNECT ERROR:",
        err
      );

      let errorMessage =
        "Unable to connect Google Drive.";

      if (
        err?.response?.data
      ) {

        const data =
          err.response.data;

        if (
          typeof data ===
            "object" &&
          data.message
        ) {

          errorMessage =
            data.message;

        }

      } else if (
        err?.message
      ) {

        errorMessage =
          err.message;

      }

      setError(
        errorMessage
      );

    } finally {

      setIsGoogleDriveConnecting(
        false
      );

    }
  }

    // =====================================================
  // UPLOAD EXCEL BACKUP TO GOOGLE DRIVE
  // =====================================================

  async function handleGoogleDriveBackup() {

    try {

      setIsGoogleDriveBackingUp(true);
      setMessage("");
      setError("");

      const response =
        await uploadExcelBackupToGoogleDrive();

      const responseMessage =
        response?.data?.message ||
        "Excel backup uploaded to Google Drive successfully.";

      setMessage(
        responseMessage
      );

    } catch (err: any) {

      console.error(
        "GOOGLE DRIVE EXCEL BACKUP ERROR:",
        err
      );

      let errorMessage =
        "Unable to upload Excel backup to Google Drive.";

      if (
        err?.response?.data
      ) {

        const data =
          err.response.data;

        if (
          typeof data ===
            "object" &&
          data.message
        ) {

          errorMessage =
            data.message;

        }

      } else if (
        err?.message
      ) {

        errorMessage =
          err.message;

      }

      setError(
        errorMessage
      );

    } finally {

      setIsGoogleDriveBackingUp(
        false
      );

    }
  }

  // =====================================================
  // SELECT RESTORE FILE
  // =====================================================

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const fileName =
      file.name.toLowerCase();

    if (
      !fileName.endsWith(".dump")
    ) {

      setSelectedFile(null);

      setError(
        "Please select a PostgreSQL .dump backup file."
      );

      event.target.value =
        "";

      return;
    }

    setSelectedFile(
      file
    );
  }

  // =====================================================
  // RESTORE DATABASE
  // =====================================================

  async function handleRestore() {

    if (!selectedFile) {

      setError(
        "Please select a backup file first."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "WARNING!\n\n" +
        "Restoring this backup will replace the current database data.\n\n" +
        "A safety backup of the current database will be created before the restore.\n\n" +
        "Are you sure you want to continue?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setIsRestoring(
        true
      );

      setMessage("");
      setError("");

      await restoreDatabaseBackup(
        selectedFile
      );

      setMessage(
        "Database restored successfully. Please refresh the application."
      );

      setSelectedFile(
        null
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }

    } catch (err: any) {

      console.error(
        "DATABASE RESTORE ERROR:",
        err
      );

      let errorMessage =
        "Unable to restore database.";

      if (
        err?.response?.data
      ) {

        const data =
          err.response.data;

        if (
          typeof data ===
            "object" &&
          data.message
        ) {

          errorMessage =
            data.message;

        } else if (
          typeof data ===
          "string"
        ) {

          try {

            const parsed =
              JSON.parse(
                data
              );

            if (
              parsed?.message
            ) {
              errorMessage =
                parsed.message;
            }

          } catch {
            // Ignore parsing error
          }
        }
      }

      setError(
        errorMessage
      );

    } finally {

      setIsRestoring(
        false
      );

    }
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold">
          Database Backup
        </h1>

        <p className="text-gray-500 mt-1">
          Create, download and restore
          your NEITS RMS database.
        </p>

      </div>


      {/* =================================================
          BACKUP CARD
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">

        <div className="flex items-center gap-4 mb-6">

          <div className="text-5xl">
            💾
          </div>

          <div>

            <h2 className="text-xl font-bold">
              Create Database Backup
            </h2>

            <p className="text-gray-500 mt-1">
              The backup contains your
              NEITS RMS database data.
            </p>

          </div>

        </div>


        {/* =================================================
            WARNING
        ================================================= */}

        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">

          <p className="font-semibold text-yellow-800">
            Important
          </p>

          <p className="text-sm text-yellow-700 mt-1">
            Keep your backup file in a safe
            location. It may contain customer,
            sales, purchase, repair and other
            business information.
          </p>

        </div>


        {/* =================================================
            BACKUP BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={
            handleBackup
          }
          disabled={
            isBackingUp ||
            isRestoring
          }
          className="
            bg-blue-600
            text-white
            px-6
            py-3
            rounded-lg
            font-semibold
            hover:bg-blue-700
            disabled:bg-gray-400
            disabled:cursor-not-allowed
            transition
          "
        >

          {isBackingUp
            ? "Creating Backup..."
            : "Create & Download Backup"}

        </button>


        {/* =================================================
            DIVIDER
            ================================================= */}

           <div className="border-t my-8" />

          {/* =================================================
          EXCEL BACKUP
          ================================================= */}

<div className="border-t my-8" />

<div className="mb-8">

  <div className="flex items-center gap-4 mb-4">

    <div className="text-5xl">
      📊
    </div>

    <div>

      <h2 className="text-xl font-bold">
        Excel Backup
      </h2>

      <p className="text-gray-500 mt-1">
        Export your NEITS RMS business data
        to an Excel workbook.
      </p>

    </div>

  </div>

  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">

    <p className="font-semibold text-blue-800">
      NEITS RMS Data.xlsx
    </p>

    <p className="text-sm text-blue-700 mt-1">
      The workbook contains Repair, Sales
      and Purchase data from the RMS database.
    </p>

  </div>

  <button
    type="button"
    onClick={handleExcelBackup}
    disabled={
      isExcelBackingUp ||
      isBackingUp ||
      isRestoring
    }
    className="
      bg-green-600
      text-white
      px-6
      py-3
      rounded-lg
      font-semibold
      hover:bg-green-700
      disabled:bg-gray-400
      disabled:cursor-not-allowed
      transition
    "
  >
    {isExcelBackingUp
      ? "Creating Excel Backup..."
      : "Download NEITS RMS Data.xlsx"}
  </button>

</div>

        {/* =================================================
            RESTORE
        ================================================= */}

        <div>

          <div className="flex items-center gap-4 mb-4">

            <div className="text-5xl">
              📂
            </div>

            <div>

              <h2 className="text-xl font-bold">
                Restore Database
              </h2>

              <p className="text-gray-500 mt-1">
                Restore your database from a
                PostgreSQL .dump backup file.
              </p>

            </div>

          </div>


          {/* =================================================
              RESTORE WARNING
          ================================================= */}

          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-5">

            <p className="font-semibold text-red-800">
              ⚠️ Warning
            </p>

            <p className="text-sm text-red-700 mt-1">
              Restoring a backup will replace
              the current database data.
            </p>

            <p className="text-sm text-red-700 mt-1">
              A safety backup of the current
              database should be created before
              restoring.
            </p>

          </div>


          {/* =================================================
              FILE SELECT
          ================================================= */}

          <div className="mb-4">

            <label className="block font-semibold mb-2">
              Select Backup File
            </label>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".dump,application/octet-stream"
              onChange={
                handleFileChange
              }
              disabled={
                isRestoring
              }
              className="
                block
                w-full
                border
                border-gray-300
                rounded-lg
                p-3
                bg-white
                cursor-pointer
                disabled:bg-gray-100
                disabled:cursor-not-allowed
              "
            />

          </div>


          {/* =================================================
              SELECTED FILE
          ================================================= */}

          {selectedFile && (

            <div className="bg-gray-50 border rounded-lg p-3 mb-4">

              <p className="text-sm text-gray-500">
                Selected backup:
              </p>

              <p className="font-semibold break-all">
                {selectedFile.name}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Size:{" "}
                {(
                  selectedFile.size /
                  1024
                ).toFixed(1)}
                {" "}KB
              </p>

            </div>

          )}


          {/* =================================================
              RESTORE BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={
              handleRestore
            }
            disabled={
              !selectedFile ||
              isRestoring ||
              isBackingUp
            }
            className="
              bg-red-600
              text-white
              px-6
              py-3
              rounded-lg
              font-semibold
              hover:bg-red-700
              disabled:bg-gray-400
              disabled:cursor-not-allowed
              transition
            "
          >

            {isRestoring
              ? "Restoring Database..."
              : "Restore Database"}

          </button>

            <div className="mt-4">

    <button
      type="button"
      onClick={handleConnectGoogleDrive}
      disabled={
        isGoogleDriveConnecting ||
        isExcelBackingUp ||
        isBackingUp ||
        isRestoring
      }
      className="
        bg-blue-600
        text-white
        px-6
        py-3
        rounded-lg
        font-semibold
        hover:bg-blue-700
        disabled:bg-gray-400
        disabled:cursor-not-allowed
        transition
      "
    >
      {isGoogleDriveConnecting
        ? "Connecting to Google Drive..."
        : "Connect Google Drive"}
    </button>

    <p className="text-sm text-gray-500 mt-2">
      Connect NEITS RMS to your Google Drive for automatic Excel backup.
    </p>

        <button
      type="button"
      onClick={handleGoogleDriveBackup}
      disabled={
        isGoogleDriveBackingUp ||
        isGoogleDriveConnecting ||
        isExcelBackingUp ||
        isBackingUp ||
        isRestoring
      }
      className="
        bg-green-600
        text-white
        px-6
        py-3
        rounded-lg
        font-semibold
        hover:bg-green-700
        disabled:bg-gray-400
        disabled:cursor-not-allowed
        transition
        mt-3
        "
        >
        {isGoogleDriveBackingUp
        ? "Uploading to Google Drive..."
        : "Backup Excel to Google Drive"}
        </button>

        </div>

        </div>


        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && (

          <div className="mt-5 bg-green-50 border border-green-300 rounded-lg p-4">

            <p className="text-green-700 font-medium">
              ✓ {message}
            </p>

          </div>

        )}


        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (

          <div className="mt-5 bg-red-50 border border-red-300 rounded-lg p-4">

            <p className="text-red-700 font-medium">
              ✕ {error}
            </p>

          </div>

        )}

      </div>

    </div>
  );
}