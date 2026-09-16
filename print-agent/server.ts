import express from "express";
import cors from "cors";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

import puppeteer from "puppeteer";
import {
  getPrinters,
  print,
} from "pdf-to-printer";

const app = express();

const PORT = 9123;

app.use(
  cors({
    origin: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

// =====================================================
// HEALTH
// =====================================================

app.get(
  "/health",
  (_req, res) => {
    res.json({
      success: true,
      service: "NEITS RMS Print Agent",
    });
  }
);

// =====================================================
// GET WINDOWS PRINTERS
// =====================================================

app.get(
  "/printers",
  async (_req, res) => {
    try {
      const printers =
        await getPrinters();

      res.json({
        success: true,
        data: printers,
      });

    } catch (error: any) {

      console.error(
        "GET PRINTERS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to get printers.",
      });
    }
  }
);

// =====================================================
// PRINT HTML
// =====================================================

app.post(
  "/print/html",
  async (req, res) => {

    let browser:
      | puppeteer.Browser
      | null = null;

    let pdfPath:
      | string
      | null = null;

    try {

      const {
        html,
        printer,
        widthMm,
        heightMm,
        orientation:
          requestedOrientation,
      } = req.body;

      // =================================================
      // VALIDATE HTML
      // =================================================

      if (
        typeof html !==
        "string"
      ) {

        return res.status(400).json({
          success: false,
          message:
            "HTML is required.",
        });
      }

      // =================================================
      // VALIDATE PRINTER
      // =================================================

      if (
        typeof printer !==
          "string" ||
        !printer.trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Printer name is required.",
        });
      }

      // =================================================
      // DIMENSIONS
      // =================================================

      const width =
        Number(widthMm);

      const height =
        Number(heightMm);

      if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width <= 0 ||
        height <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Valid width and height are required.",
        });
      }

      // =================================================
      // ORIENTATION
      // =================================================

      const calculatedOrientation =
        width > height
          ? "landscape"
          : "portrait";

      const orientation =
        requestedOrientation ===
          "landscape" ||
        requestedOrientation ===
          "portrait"
          ? requestedOrientation
          : calculatedOrientation;

      console.log(
        "======================================"
      );

      console.log(
        "PRINT REQUEST"
      );

      console.log({
        printer:
          printer.trim(),

        widthMm:
          width,

        heightMm:
          height,

        orientation,
      });

      console.log(
        "======================================"
      );

      // =================================================
      // TEMP PDF
      // =================================================

      const tempName =
        `neits-${crypto.randomUUID()}.pdf`;

      pdfPath =
        path.join(
          os.tmpdir(),
          tempName
        );

      // =================================================
      // LAUNCH BROWSER
      // =================================================

      browser =
        await puppeteer.launch({
          headless: true,

          args: [
            "--disable-gpu",
            "--no-sandbox",
          ],
        });

      const page =
        await browser.newPage();

      // =================================================
      // VIEWPORT
      // =================================================

      await page.setViewport({

        width:
          Math.max(
            1,
            Math.round(
              width * 3.78
            )
          ),

        height:
          Math.max(
            1,
            Math.round(
              height * 3.78
            )
          ),

        deviceScaleFactor: 1,
      });

      // =================================================
      // LOAD HTML
      // =================================================

      await page.setContent(
        html,
        {
          waitUntil:
            "networkidle0",
        }
      );

      // =================================================
      // WAIT FOR FONTS
      // =================================================

      await page.evaluate(
        async () => {

          if (
            "fonts" in
            document
          ) {

            await (
              document as any
            ).fonts.ready;
          }
        }
      );

      // =================================================
      // GENERATE PDF
      // =================================================
      //
      // IMPORTANT:
      //
      // We keep the actual physical page:
      //
      // 70 × 30 mm
      //
      // We do NOT rotate the printer driver.
      //
      // =================================================

      await page.pdf({

        path:
          pdfPath,

        width:
          `${width}mm`,

        height:
          `${height}mm`,

        landscape:
          false,

        printBackground:
          true,

        margin: {

          top:
            "0mm",

          right:
            "0mm",

          bottom:
            "0mm",

          left:
            "0mm",
        },

        preferCSSPageSize:
          false,
      });

      // =================================================
      // CLOSE BROWSER
      // =================================================

      await browser.close();

      browser = null;

      // =================================================
      // PRINT OPTIONS
      // =================================================

      const printOptions: any = {

        printer:
          printer.trim(),

        scale:
          "noscale",

        silent:
          true,
      };

      // =================================================
      // STICKER PRINTER
      // =================================================
      //
      // EML-300L uses the 7030 profile:
      //
      // 70 mm × 30 mm
      //
      // We tell SumatraPDF to use the document's
      // physical size and prevent automatic rotation.
      //
      // =================================================

      if (
        printer
          .trim()
          .toLowerCase()
          .includes(
            "eml-300l"
          )
      ) {

        printOptions.paperSize =
          "70mm x 30mm";

        printOptions.orientation =
          "landscape";
      }

      // =================================================
      // A4 / NORMAL PRINTER
      // =================================================

      else {

        printOptions.orientation =
          orientation;
      }

      console.log(
        "PRINT OPTIONS:",
        printOptions
      );

      // =================================================
      // SEND TO WINDOWS PRINTER
      // =================================================

      await print(
        pdfPath,
        printOptions
      );

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        "PRINT SENT SUCCESSFULLY"
      );

      res.json({

        success:
          true,

        message:
          "Print job sent successfully.",

        printer:
          printer.trim(),

        widthMm:
          width,

        heightMm:
          height,

        orientation,
      });

    } catch (error: any) {

      console.error(
        "PRINT ERROR:",
        error
      );

      // =================================================
      // CLOSE BROWSER ON ERROR
      // =================================================

      if (browser) {

        try {

          await browser.close();

        } catch {
          // ignore
        }
      }

      res.status(500).json({

        success:
          false,

        message:
          error?.message ||
          "Unable to print.",
      });

    } finally {

      // =================================================
      // DELETE TEMP PDF
      // =================================================

      if (pdfPath) {

        try {

          await fs.unlink(
            pdfPath
          );

        } catch {
          // ignore
        }
      }
    }
  }
);

// =====================================================
// START
// =====================================================

app.listen(
  PORT,
  "127.0.0.1",
  () => {

    console.log(
      "======================================"
    );

    console.log(
      "NEITS RMS PRINT AGENT"
    );

    console.log(
      `Running on http://127.0.0.1:${PORT}`
    );

    console.log(
      "======================================"
    );
  }
);