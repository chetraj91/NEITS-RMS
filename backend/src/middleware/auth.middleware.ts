import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  verifyToken,
  JwtPayload,
} from "../utils/jwt";

import { prisma } from "../config/prisma";

export interface AuthRequest
  extends Request {
  user?: JwtPayload;
}

// =====================================================
// AUTHENTICATE
// =====================================================

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message:
        "Authorization token missing",
    });
  }

  const token =
    authHeader.replace(
      "Bearer ",
      ""
    );

  try {
    req.user =
      verifyToken(token);

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token",
    });
  }
}

// =====================================================
// REQUIRE ONE PERMISSION
// =====================================================

export function requirePermission(
  permission: string
) {
  return async function (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      // Administrator has full access.
      if (
        req.user.role ===
        "Administrator"
      ) {
        return next();
      }

      const userPermission =
        await prisma.userPermission.findFirst(
          {
            where: {
              userId:
                req.user.id,

              permission,

              enabled: true,
            },
          }
        );

      if (!userPermission) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to access this resource.",
          permission,
        });
      }

      next();
    } catch (error) {
      console.error(
        "PERMISSION CHECK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify permissions.",
      });
    }
  };
}

// =====================================================
// REQUIRE ANY ONE OF MULTIPLE PERMISSIONS
// =====================================================

export function requireAnyPermission(
  permissions: string[]
) {
  return async function (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      if (
        req.user.role ===
        "Administrator"
      ) {
        return next();
      }

      const permission =
        await prisma.userPermission.findFirst(
          {
            where: {
              userId:
                req.user.id,

              permission: {
                in: permissions,
              },

              enabled: true,
            },
          }
        );

      if (!permission) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to access this resource.",
        });
      }

      next();
    } catch (error) {
      console.error(
        "PERMISSION CHECK ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify permissions.",
      });
    }
  };
}