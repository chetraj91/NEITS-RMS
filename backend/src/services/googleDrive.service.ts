import { google } from "googleapis";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { getCompanySettings } from "./companySettings.service";

import {
  encryptGoogleDriveToken,
  decryptGoogleDriveToken,
  decryptGoogleDriveSecret,
} from "../utils/googleDriveToken";

const GOOGLE_DRIVE_SCOPE =
  "https://www.googleapis.com/auth/drive.file";

export async function createGoogleOAuthClient() {
const settings =
  await prisma.companySettings.findUnique({
    where: {
      id: "company",
    },
  });

  const clientId =
    settings?.googleClientId ||
    env.GOOGLE_CLIENT_ID;

      const clientSecret =
      settings?.googleClientSecret
      ? decryptGoogleDriveSecret(
        settings?.googleClientSecret
      )
    : env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Google OAuth credentials are not configured."
    );
  }

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    env.GOOGLE_REDIRECT_URI
  );
}

export async function getGoogleDriveAuthorizationUrl(): Promise<string> {
  const oauth2Client =
    await createGoogleOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent",
    scope: [GOOGLE_DRIVE_SCOPE],
  });
}

export async function exchangeGoogleAuthorizationCode(
  code: string
) {
 const oauth2Client = await createGoogleOAuthClient();

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token."
    );
  }

  const encryptedRefreshToken =
    encryptGoogleDriveToken(tokens.refresh_token);
const companySettings =
  await getCompanySettings();

await prisma.companySettings.update({
  where: {
    id: companySettings.id,
  },
  data: {
    googleDriveRefreshToken:
      encryptedRefreshToken,
  },
});

  return {
    hasRefreshToken: true,
    email: tokens.id_token ? "authorized" : undefined,
  };
}

export async function getGoogleDriveClient() {
  const settings =
    await prisma.companySettings.findUnique({
      where: {
        id: "company",
      },
    });

  if (!settings?.googleDriveRefreshToken) {
    throw new Error(
      "Google Drive is not connected."
    );
  }

  const refreshToken = decryptGoogleDriveToken(
    settings.googleDriveRefreshToken
  );

  const oauth2Client = await createGoogleOAuthClient();

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  return google.drive({
    version: "v3",
    auth: oauth2Client,
  });
}