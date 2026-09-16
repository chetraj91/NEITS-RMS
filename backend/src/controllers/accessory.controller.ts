import { Request, Response } from "express";

import {
  getAccessories,
  getActiveAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
  getAccessoriesByDeviceType,
  addAccessoryToDeviceType,
  updateDeviceTypeAccessory,
  removeAccessoryFromDeviceType,
  saveDeviceTypeAccessories,
} from "../services/accessory.service";

// =====================================================
// GET ALL ACCESSORIES
// =====================================================

export async function getAccessoriesController(
  req: Request,
  res: Response
) {
  try {
    const data = await getAccessories();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get accessories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get accessories",
    });
  }
}

// =====================================================
// GET ACTIVE ACCESSORIES
// =====================================================

export async function getActiveAccessoriesController(
  req: Request,
  res: Response
) {
  try {
    const data = await getActiveAccessories();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get active accessories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get active accessories",
    });
  }
}

// =====================================================
// GET ACCESSORY BY ID
// =====================================================

export async function getAccessoryByIdController(
  req: Request,
  res: Response
) {
  try {
    const id = String(req.params.id);

    const data = await getAccessoryById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Accessory not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get accessory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get accessory",
    });
  }
}

// =====================================================
// CREATE ACCESSORY
// =====================================================

export async function createAccessoryController(
  req: Request,
  res: Response
) {
  try {
    const {
      name,
      displayOrder,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Accessory name is required",
      });
    }

    const data = await createAccessory(
      name,
      Number(displayOrder) || 0
    );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Create accessory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create accessory",
    });
  }
}

// =====================================================
// UPDATE ACCESSORY
// =====================================================

export async function updateAccessoryController(
  req: Request,
  res: Response
) {
  try {
    const id = String(req.params.id);

    const {
      name,
      active,
      displayOrder,
    } = req.body;

    const data = await updateAccessory(
      id,
      {
        ...(name !== undefined
          ? { name }
          : {}),

        ...(active !== undefined
          ? { active: Boolean(active) }
          : {}),

        ...(displayOrder !== undefined
          ? {
              displayOrder:
                Number(displayOrder) || 0,
            }
          : {}),
      }
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Update accessory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update accessory",
    });
  }
}

// =====================================================
// DELETE ACCESSORY
// =====================================================

export async function deleteAccessoryController(
  req: Request,
  res: Response
) {
  try {
    const id = String(req.params.id);

    await deleteAccessory(id);

    return res.json({
      success: true,
      message:
        "Accessory deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete accessory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete accessory",
    });
  }
}

// =====================================================
// GET ACCESSORIES BY DEVICE TYPE
// =====================================================

export async function getAccessoriesByDeviceTypeController(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId = String(
      req.params.deviceTypeId
    );

    if (!deviceTypeId) {
      return res.status(400).json({
        success: false,
        message:
          "Device Type ID is required",
      });
    }

    const data =
      await getAccessoriesByDeviceType(
        deviceTypeId
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Get device type accessories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get accessories for device type",
    });
  }
}

// =====================================================
// ADD ACCESSORY TO DEVICE TYPE
// =====================================================

export async function addAccessoryToDeviceTypeController(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId = String(
      req.params.deviceTypeId
    );

    const {
      accessoryId,
      visible,
      required,
      displayOrder,
    } = req.body;

    if (!deviceTypeId) {
      return res.status(400).json({
        success: false,
        message:
          "Device Type ID is required",
      });
    }

    if (
      typeof accessoryId !== "string" ||
      !accessoryId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Accessory ID is required",
      });
    }

    const data =
      await addAccessoryToDeviceType(
        deviceTypeId,
        accessoryId,
        {
          visible:
            visible !== undefined
              ? Boolean(visible)
              : true,

          required:
            required !== undefined
              ? Boolean(required)
              : false,

          displayOrder:
            Number(displayOrder) || 0,
        }
      );

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Add accessory to device type error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to assign accessory to device type",
    });
  }
}

// =====================================================
// UPDATE DEVICE TYPE ACCESSORY
// =====================================================

export async function updateDeviceTypeAccessoryController(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId = String(
      req.params.deviceTypeId
    );

    const accessoryId = String(
      req.params.accessoryId
    );

    const {
      visible,
      required,
      displayOrder,
    } = req.body;

    if (!deviceTypeId) {
      return res.status(400).json({
        success: false,
        message:
          "Device Type ID is required",
      });
    }

    if (!accessoryId) {
      return res.status(400).json({
        success: false,
        message:
          "Accessory ID is required",
      });
    }

    const data =
      await updateDeviceTypeAccessory(
        deviceTypeId,
        accessoryId,
        {
          ...(visible !== undefined
            ? {
                visible:
                  Boolean(visible),
              }
            : {}),

          ...(required !== undefined
            ? {
                required:
                  Boolean(required),
              }
            : {}),

          ...(displayOrder !== undefined
            ? {
                displayOrder:
                  Number(displayOrder) || 0,
              }
            : {}),
        }
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Update device type accessory error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update device type accessory",
    });
  }
}

// =====================================================
// REMOVE ACCESSORY FROM DEVICE TYPE
// =====================================================

export async function removeAccessoryFromDeviceTypeController(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId = String(
      req.params.deviceTypeId
    );

    const accessoryId = String(
      req.params.accessoryId
    );

    if (!deviceTypeId) {
      return res.status(400).json({
        success: false,
        message:
          "Device Type ID is required",
      });
    }

    if (!accessoryId) {
      return res.status(400).json({
        success: false,
        message:
          "Accessory ID is required",
      });
    }

    await removeAccessoryFromDeviceType(
      deviceTypeId,
      accessoryId
    );

    return res.json({
      success: true,
      message:
        "Accessory removed from device type",
    });
  } catch (error) {
    console.error(
      "Remove accessory from device type error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove accessory from device type",
    });
  }
}


// =====================================================
// SAVE DEVICE TYPE ACCESSORIES
// =====================================================

export async function saveDeviceTypeAccessoriesController(
  req: Request,
  res: Response
) {
  try {
    const deviceTypeId = String(
      req.params.deviceTypeId
    );

    if (!deviceTypeId) {
      return res.status(400).json({
        success: false,
        message: "Device Type ID is required",
      });
    }

    const { accessories } = req.body;

    if (!Array.isArray(accessories)) {
      return res.status(400).json({
        success: false,
        message: "Accessories must be an array",
      });
    }

    const data = await saveDeviceTypeAccessories(
      deviceTypeId,
      accessories
    );

    return res.json({
      success: true,
      message: "Accessories saved successfully",
      data,
    });
  } catch (error) {
    console.error(
      "Save device type accessories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to save accessories",
    });
  }
}