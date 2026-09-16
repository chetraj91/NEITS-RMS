import { Request, Response } from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserPermissions,
} from "../services/user.service";

// =====================================================
// GET ALL USERS
// =====================================================

export async function getAll(
  req: Request,
  res: Response
) {
  try {
    const users =
      await getUsers();

    return res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load users.",
    });
  }
}

// =====================================================
// GET ONE USER
// =====================================================

export async function getOne(
  req: Request,
  res: Response
) {
  try {
    const user =
      await getUser(
        String(req.params.id)
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error(
      "GET USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load user.",
    });
  }
}

// =====================================================
// GET USER PERMISSIONS
// =====================================================

export async function getPermissions(
  req: Request,
  res: Response
) {
  try {
    const permissions =
      await getUserPermissions(
        String(req.params.id)
      );

    return res.json({
      success: true,
      data: permissions,
    });
  } catch (error: any) {
    console.error(
      "GET USER PERMISSIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Unable to load user permissions.",
    });
  }
}

// =====================================================
// CREATE USER
// =====================================================

export async function create(
  req: Request,
  res: Response
) {
  try {
    const user =
      await createUser(
        req.body
      );

    return res.status(201).json({
      success: true,
      message:
        "User created successfully.",
      data: user,
    });
  } catch (error: any) {
    console.error(
      "CREATE USER ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to create user.",
    });
  }
}

// =====================================================
// UPDATE USER
// =====================================================

export async function update(
  req: Request,
  res: Response
) {
  try {
    const user =
      await updateUser(
        String(req.params.id),
        req.body
      );

    return res.json({
      success: true,
      message:
        "User updated successfully.",
      data: user,
    });
  } catch (error: any) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to update user.",
    });
  }
}

// =====================================================
// DELETE USER
// =====================================================

export async function remove(
  req: Request,
  res: Response
) {
  try {
    await deleteUser(
      String(req.params.id)
    );

    return res.json({
      success: true,
      message:
        "User deleted successfully.",
    });
  } catch (error: any) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to delete user.",
    });
  }
}