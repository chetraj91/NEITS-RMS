import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Hide the password before sending the user object
    const { password: _, ...safeUser } = result.user;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: safeUser,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}