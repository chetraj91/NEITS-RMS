import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    const { password, ...safeUser } = user;

res.json({
  success: true,
  message: "Login successful",
  data: {
    token,
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