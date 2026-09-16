import { prisma } from "../config/prisma";

// =====================================================
// GET PAYMENT METHODS
// =====================================================

export async function getPaymentMethods(
  activeOnly = false
) {
  return prisma.paymentMethod.findMany({
    where: activeOnly
      ? {
          active: true,
        }
      : undefined,

    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        name: "asc",
      },
    ],
  });
}

// =====================================================
// GET ONE PAYMENT METHOD
// =====================================================

export async function getPaymentMethod(
  id: string
) {
  return prisma.paymentMethod.findUnique({
    where: {
      id,
    },
  });
}

// =====================================================
// CREATE PAYMENT METHOD
// =====================================================

export async function createPaymentMethod(
  data: any
) {
  const name =
    String(
      data.name || ""
    ).trim();

  const code =
    String(
      data.code || ""
    )
      .trim()
      .toUpperCase();

  const sortOrder =
    Number(
      data.sortOrder ?? 0
    );

  const active =
    data.active !== false;

  if (!name) {
    throw new Error(
      "Payment method name is required."
    );
  }

  if (!code) {
    throw new Error(
      "Payment method code is required."
    );
  }

  const existing =
    await prisma.paymentMethod.findUnique({
      where: {
        code,
      },
    });

  if (existing) {
    throw new Error(
      "Payment method code already exists."
    );
  }

  return prisma.paymentMethod.create({
    data: {
      name,
      code,
      sortOrder:
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,
      active,
    },
  });
}

// =====================================================
// UPDATE PAYMENT METHOD
// =====================================================

export async function updatePaymentMethod(
  id: string,
  data: any
) {
  const existing =
    await prisma.paymentMethod.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "Payment method not found."
    );
  }

  const name =
    data.name !== undefined
      ? String(
          data.name
        ).trim()
      : existing.name;

  const code =
    data.code !== undefined
      ? String(
          data.code
        )
          .trim()
          .toUpperCase()
      : existing.code;

  const active =
    data.active !== undefined
      ? Boolean(
          data.active
        )
      : existing.active;

  const sortOrder =
    data.sortOrder !== undefined
      ? Number(
          data.sortOrder
        )
      : existing.sortOrder;

  if (!name) {
    throw new Error(
      "Payment method name is required."
    );
  }

  if (!code) {
    throw new Error(
      "Payment method code is required."
    );
  }

  if (
    code !==
    existing.code
  ) {
    const duplicate =
      await prisma.paymentMethod.findUnique({
        where: {
          code,
        },
      });

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new Error(
        "Payment method code already exists."
      );
    }
  }

  return prisma.paymentMethod.update({
    where: {
      id,
    },

    data: {
      name,
      code,
      active,
      sortOrder:
        Number.isFinite(
          sortOrder
        )
          ? sortOrder
          : 0,
    },
  });
}

// =====================================================
// DELETE PAYMENT METHOD
// =====================================================

export async function deletePaymentMethod(
  id: string
) {
  const existing =
    await prisma.paymentMethod.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "Payment method not found."
    );
  }

  return prisma.paymentMethod.delete({
    where: {
      id,
    },
  });
}