import { Router } from "express";

import {
  createNeitsRmsWorkbook,
} from "../services/excelBackup.service";

import {
  authenticate,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

// =====================================================
// EXCEL BACKUP PERMISSION
// =====================================================

router.use(
  authenticate,
  requirePermission("settings.backup")
);

// =====================================================
// DOWNLOAD NEITS RMS EXCEL WORKBOOK
// =====================================================

router.get(
  "/download",
  async (req, res) => {
    try {
      const workbook =
        await createNeitsRmsWorkbook();

      const fileName =
        "NEITS RMS Data.xlsx";

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      await workbook.xlsx.write(res);

      res.end();
    } catch (error) {
      console.error(
        "Excel backup generation failed:",
        error
      );

      res.status(500).json({
        message:
          "Failed to generate Excel backup.",
      });
    }
  }
);

export default router;