import { prisma } from "../config/prisma";

export async function createSupplier(data: any) {
  const exists = await prisma.supplier.findFirst({
    where: {
      OR: [
        { phone: data.phone },
        ...(data.email ? [{ email: data.email }] : [])
      ]
    }
  });

  if (exists) {
    throw new Error("Supplier already exists.");
  }

  return prisma.supplier.create({
    data
  });
}

export async function getSuppliers() {
  return prisma.supplier.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getSupplier(id: string) {
  return prisma.supplier.findUnique({
    where: {
      id
    }
  });
}

export async function updateSupplier(id: string, data: any) {
  return prisma.supplier.update({
    where: {
      id
    },
    data
  });
}

export async function deleteSupplier(id: string) {
  return prisma.supplier.delete({
    where: {
      id
    }
  });
}