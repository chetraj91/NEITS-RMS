import { Router } from "express";

import {
  exchangeGoogleAuthorizationCode,
  getGoogleDriveAuthorizationUrl,
} from "../services/googleDrive.service";

import {
  createExcelBackupBuffer,
  uploadLatestExcelBackup,
  uploadMonthlyExcelBackup,
} from "../services/googleDriveExcelBackup.service";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

/**
 * Start Google Drive OAuth authorization.
 *
 * The user must have the existing settings.backup permission.
 */
router.get(
  "/connect",
  authenticate,
  requirePermission("settings.backup"),
  async (_req, res) => {
    try {
      const authorizationUrl =
  await getGoogleDriveAuthorizationUrl();

      return res.json({
        success: true,
        authorizationUrl,
      });
    } catch (error) {
      console.error(
        "Google Drive authorization error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to start Google Drive authorization.",
      });
    }
  }
);

 /**
  * Upload the current Excel backup to Google Drive.
  *
  * This creates/updates:
  * 1. NEITS RMS Data.xlsx
  * 2. Monthly Backup/NEITS RMS Data - Month Year.xlsx
  */
router.post(
  "/excel-backup",
  authenticate,
  requirePermission("settings.backup"),
  async (_req, res) => {
    try {
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

      return res.json({
        success: true,
        message:
          "Excel backup uploaded to Google Drive successfully.",
        latestFile: {
          id: latestFile.id,
          name: latestFile.name,
          webViewLink:
            latestFile.webViewLink,
          modifiedTime:
            latestFile.modifiedTime,
        },
        monthlyFile: {
          id: monthlyFile.id,
          name: monthlyFile.name,
          webViewLink:
            monthlyFile.webViewLink,
          modifiedTime:
            monthlyFile.modifiedTime,
        },
      });
    } catch (error) {
      console.error(
        "Google Drive Excel backup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to upload Excel backup to Google Drive.",
      });
    }
  }
);

/**
 * Google OAuth callback.
 *
 * This is intentionally only a token-exchange test for now.
 * We will securely store the refresh token in a later step.
 */
router.get("/oauth/callback", async (req, res) => {
  try {
    const code =
      typeof req.query.code === "string"
        ? req.query.code
        : "";

    if (!code) {
      return res.status(400).send(
        "Google authorization code is missing."
      );
    }

    const tokens =
      await exchangeGoogleAuthorizationCode(code);

    console.log(
      "Google OAuth completed successfully."
    );

    console.log(
    "Google Drive refresh token saved:",
     tokens.hasRefreshToken
     );

    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Google Drive Connected</title>
        </head>
        <body>
          <h2>Google Drive authorization successful</h2>
          <p>You can close this window and return to NEITS RMS.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error(
      "Google OAuth callback error:",
      error
    );

    return res.status(500).send(
      "Google Drive authorization failed."
    );
  }
});

export default router;