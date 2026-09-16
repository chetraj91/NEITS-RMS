import { prisma } from "../config/prisma";

import {
  comparePassword,
  hashPassword,
} from "../utils/password";

import { generateToken } from "../utils/jwt";
import {
  PERMISSIONS,
} from "../config/permissions";

export async function login(
  username: string,
  password: string
) {
  const user =
    await prisma.user.findUnique({
      where: {
        username,
      },

      include: {
        permissions: {
          where: {
            enabled: true,
          },

          select: {
            permission: true,
          },
        },
      },
    });

  if (!user) {
    throw new Error(
      "Invalid username or password"
    );
  }

  if (!user.active) {
    throw new Error(
      "This user account is inactive."
    );
  }

  const validPassword =
    await comparePassword(
      password,
      user.password
    );

  if (!validPassword) {
    throw new Error(
      "Invalid username or password"
    );
  }

  const token =
    generateToken({
      id: user.id,
      username:
        user.username,
      role: user.role,
    });

  // Administrator always receives full access.
  const permissions =
    user.role ===
    "Administrator"
      ? PERMISSIONS.map(
          (item) =>
            item.key
        )
      : user.permissions.map(
          (item) =>
            item.permission
        );

  return {
    token,

    user: {
      id: user.id,
      fullName:
        user.fullName,
      username:
        user.username,
      role:
        user.role,
      active:
        user.active,
      permissions,
    },
  };
}
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  const validPassword =
    await comparePassword(
      oldPassword,
      user.password
    );

  if (!validPassword) {
    throw new Error(
      "Old password is incorrect."
    );
  }

  const newPasswordHash =
    await hashPassword(
      newPassword
    );

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password:
        newPasswordHash,
    },
  });

  return {
    success: true,
    message:
      "Password changed successfully.",
  };
}