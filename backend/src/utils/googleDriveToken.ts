import crypto from "crypto";
import { env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const secret = env.GOOGLE_TOKEN_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY is not configured."
    );
  }

  return crypto
    .createHash("sha256")
    .update(secret)
    .digest();
}

export function encryptGoogleDriveToken(
  token: string
): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    ALGORITHM,
    key,
    iv,
    { authTagLength: AUTH_TAG_LENGTH }
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptGoogleDriveToken(
  encryptedToken: string
): string {
  const parts = encryptedToken.split(".");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid encrypted Google Drive token format."
    );
  }

  const [ivBase64, authTagBase64, encryptedBase64] =
    parts;

  const key = getEncryptionKey();
  const iv = Buffer.from(ivBase64, "base64");
  const authTag = Buffer.from(authTagBase64, "base64");
  const encrypted = Buffer.from(
    encryptedBase64,
    "base64"
  );

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    iv,
    { authTagLength: AUTH_TAG_LENGTH }
  );

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function encryptGoogleDriveSecret(
  secret: string
): string {
  return encryptGoogleDriveToken(secret);
}

export function decryptGoogleDriveSecret(
  encryptedSecret: string
): string {
  return decryptGoogleDriveToken(
    encryptedSecret
  );
}