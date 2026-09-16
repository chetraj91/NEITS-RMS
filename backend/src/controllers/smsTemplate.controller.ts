import { Request, Response } from "express";
import { prisma } from "../config/prisma";

// =====================================================
// GET ALL SMS TEMPLATES
// =====================================================

export async function getSmsTemplates(
  req: Request,
  res: Response
) {
  try {
    const templates =
      await prisma.smsTemplate.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });

    return res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error(
      "GET SMS TEMPLATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load SMS templates.",
    });
  }
}

// =====================================================
// CREATE SMS TEMPLATE
// =====================================================

export async function createSmsTemplate(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      code,
      message,
      enabled,
    } = req.body;

    if (
      !name ||
      !code ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, code and message are required.",
      });
    }

    const existing =
      await prisma.smsTemplate.findUnique({
        where: {
          code,
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "A template with this code already exists.",
      });
    }

    const template =
      await prisma.smsTemplate.create({
        data: {
          name: name.trim(),
          code: code.trim(),
          message: message.trim(),
          enabled:
            enabled !== false,
        },
      });

    return res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error(
      "CREATE SMS TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create SMS template.",
    });
  }
}

// =====================================================
// UPDATE SMS TEMPLATE
// =====================================================

export async function updateSmsTemplate(
  req: Request,
  res: Response
) {
  try {

 const id = String(req.params.id);

    const {
      name,
      code,
      message,
      enabled,
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Template ID is required.",
      });
    }

    if (
      !name ||
      !code ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, code and message are required.",
      });
    }

    const existing =
      await prisma.smsTemplate.findFirst({
        where: {
          code,
          NOT: {
            id,
          },
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message:
          "Another template already uses this code.",
      });
    }

    const template =
      await prisma.smsTemplate.update({
        where: {
          id,
        },
        data: {
          name: name.trim(),
          code: code.trim(),
          message: message.trim(),
          enabled:
            enabled !== false,
        },
      });

    return res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error(
      "UPDATE SMS TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update SMS template.",
    });
  }
}

// =====================================================
// TOGGLE SMS TEMPLATE
// =====================================================

export async function toggleSmsTemplate(
  req: Request,
  res: Response
) {
  try {
   const id = String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Template ID is required.",
      });
    }

    const template =
      await prisma.smsTemplate.findUnique({
        where: {
          id,
        },
      });

    if (!template) {
      return res.status(404).json({
        success: false,
        message:
          "SMS template not found.",
      });
    }

    const updated =
      await prisma.smsTemplate.update({
        where: {
          id,
        },
        data: {
          enabled:
            !template.enabled,
        },
      });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error(
      "TOGGLE SMS TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change SMS template status.",
    });
  }
}

// =====================================================
// DELETE SMS TEMPLATE
// =====================================================

export async function deleteSmsTemplate(
  req: Request,
  res: Response
) {
  try {
 const id = String(req.params.id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Template ID is required.",
      });
    }

    await prisma.smsTemplate.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message:
        "SMS template deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE SMS TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete SMS template.",
    });
  }
}