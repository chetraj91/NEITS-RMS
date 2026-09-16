import { Router } from "express";
import multer from "multer";
import os from "os";
import path from "path";

import {
  createBackup,
  restoreBackup,
} from "../controllers/backup.controller";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// TEMPORARY UPLOAD STORAGE
// =====================================================

const upload = multer({
  dest: path.join(
    os.tmpdir(),
    "neits-rms-restore"
  ),

  limits: {
    fileSize:
      100 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {

    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    if (
      extension !== ".dump"
    ) {
      callback(
        new Error(
          "Only PostgreSQL .dump backup files are allowed."
        )
      );

      return;
    }

    callback(
      null,
      true
    );
  },
});

// =====================================================
// BACKUP PERMISSION
// =====================================================

router.use(
  authenticate,
  requirePermission(
    "settings.backup"
  )
);

// =====================================================
// CREATE / DOWNLOAD BACKUP
// =====================================================

router.get(
  "/download",
  createBackup
);

// =====================================================
// RESTORE DATABASE
// =====================================================

router.post(
  "/restore",
  upload.single("backup"),
  restoreBackup
);

export default router;