import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user,
      },
    });

  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}
export async function changePassword(
  req: Request,
  res: Response
) {
  try {
    const userId = String(
      (req as any).user.id
    );

    const {
      oldPassword,
      newPassword,
    } = req.body;

    if (
      !oldPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Old password and new password are required.",
      });
    }

    await authService.changePassword(
      userId,
      oldPassword,
      newPassword
    );

    return res.json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error: any) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Unable to change password.",
    });
  }
}