import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";

import {
  PERMISSIONS,
  isValidPermission,
} from "../config/permissions";

// =====================================================
// PERMISSION HELPERS
// =====================================================

export async function getUserPermissions(
  userId: string
) {
  const records =
    await prisma.userPermission.findMany({
      where: {
        userId,
        enabled: true,
      },
      orderBy: {
        permission: "asc",
      },
    });

  return records.map(
    (item) => item.permission
  );
}

// =====================================================
// SAVE USER PERMISSIONS
// =====================================================

async function saveUserPermissions(
  tx: any,
  userId: string,
  permissions: string[]
) {
  const validPermissions =
    permissions.filter(
      (permission) =>
        isValidPermission(
          permission
        )
    );

  await tx.userPermission.deleteMany({
    where: {
      userId,
    },
  });

  if (
    validPermissions.length === 0
  ) {
    return;
  }

  await tx.userPermission.createMany({
    data: validPermissions.map(
      (permission) => ({
        userId,
        permission,
        enabled: true,
      })
    ),
    skipDuplicates: true,
  });
}

// =====================================================
// GET ALL USERS
// =====================================================

export async function getUsers() {
  const users =
    await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,

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

  return users.map(
    (user) => ({
      ...user,

      permissions:
        user.permissions.map(
          (item) =>
            item.permission
        ),
    })
  );
}

// =====================================================
// GET ONE USER
// =====================================================

export async function getUser(
  id: string
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        fullName: true,
        username: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,

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
    return null;
  }

  return {
    ...user,

    permissions:
      user.permissions.map(
        (item) =>
          item.permission
      ),
  };
}

// =====================================================
// CREATE USER
// =====================================================

export async function createUser(
  data: any
) {
  const fullName =
    String(
      data.fullName || ""
    ).trim();

  const username =
    String(
      data.username || ""
    ).trim();

  const password =
    String(
      data.password || ""
    );

  const role =
    String(
      data.role ||
        "Technician"
    ).trim();

  const active =
    data.active !== false;

  const permissions =
    Array.isArray(
      data.permissions
    )
      ? data.permissions
      : [];

  if (!fullName) {
    throw new Error(
      "Full name is required."
    );
  }

  if (!username) {
    throw new Error(
      "Username is required."
    );
  }

  if (!password) {
    throw new Error(
      "Password is required."
    );
  }

  if (password.length < 4) {
    throw new Error(
      "Password must be at least 4 characters."
    );
  }

  const existing =
    await prisma.user.findUnique({
      where: {
        username,
      },
    });

  if (existing) {
    throw new Error(
      "Username already exists."
    );
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  return prisma.$transaction(
    async (tx) => {
      const user =
        await tx.user.create({
          data: {
            fullName,
            username,
            password:
              hashedPassword,
            role,
            active,
          },
        });

      await saveUserPermissions(
        tx,
        user.id,
        permissions
      );

      return {
        id: user.id,
        fullName:
          user.fullName,
        username:
          user.username,
        role: user.role,
        active:
          user.active,
        permissions:
        permissions.filter(
        (permission: string) =>
       isValidPermission(
        permission
      )
      ),
        createdAt:
          user.createdAt,
        updatedAt:
          user.updatedAt,
      };
    }
  );
}

// =====================================================
// UPDATE USER
// =====================================================

export async function updateUser(
  id: string,
  data: any
) {
  const existing =
    await prisma.user.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "User not found."
    );
  }

  const fullName =
    data.fullName !==
    undefined
      ? String(
          data.fullName
        ).trim()
      : existing.fullName;

  const username =
    data.username !==
    undefined
      ? String(
          data.username
        ).trim()
      : existing.username;

  const role =
    data.role !==
    undefined
      ? String(
          data.role
        ).trim()
      : existing.role;

  const active =
    data.active !==
    undefined
      ? Boolean(
          data.active
        )
      : existing.active;

  const permissionsProvided =
    Array.isArray(
      data.permissions
    );

  const permissions =
    permissionsProvided
      ? data.permissions
      : [];

  if (!fullName) {
    throw new Error(
      "Full name is required."
    );
  }

  if (!username) {
    throw new Error(
      "Username is required."
    );
  }

  if (!role) {
    throw new Error(
      "Role is required."
    );
  }

  if (
    username !==
    existing.username
  ) {
    const usernameExists =
      await prisma.user.findUnique({
        where: {
          username,
        },
      });

    if (
      usernameExists &&
      usernameExists.id !== id
    ) {
      throw new Error(
        "Username already exists."
      );
    }
  }

  const updateData: any = {
    fullName,
    username,
    role,
    active,
  };

  // ===============================================
  // PASSWORD
  // Blank password = keep old password
  // ===============================================

  if (
    data.password !==
      undefined &&
    String(
      data.password
    ).length > 0
  ) {
    const password =
      String(
        data.password
      );

    if (password.length < 4) {
      throw new Error(
        "Password must be at least 4 characters."
      );
    }

    updateData.password =
      await bcrypt.hash(
        password,
        10
      );
  }

  return prisma.$transaction(
    async (tx) => {
      const user =
        await tx.user.update({
          where: {
            id,
          },

          data: updateData,
        });

      if (
        permissionsProvided
      ) {
        await saveUserPermissions(
          tx,
          user.id,
          permissions
        );
      }

      const savedPermissions =
        await tx.userPermission.findMany({
          where: {
            userId:
              user.id,
            enabled:
              true,
          },

          select: {
            permission: true,
          },

          orderBy: {
            permission:
              "asc",
          },
        });

      return {
        id: user.id,
        fullName:
          user.fullName,
        username:
          user.username,
        role: user.role,
        active:
          user.active,
        permissions:
          savedPermissions.map(
            (item) =>
              item.permission
          ),
        createdAt:
          user.createdAt,
        updatedAt:
          user.updatedAt,
      };
    }
  );
}

// =====================================================
// DELETE USER
// =====================================================

export async function deleteUser(
  id: string
) {
  const existing =
    await prisma.user.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "User not found."
    );
  }

  if (
    existing.username ===
    "admin"
  ) {
    throw new Error(
      "The main admin user cannot be deleted."
    );
  }

  return prisma.user.delete({
    where: {
      id,
    },
  });
}