import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function createSupplier(data: any) {
  const phone = String(data.phone ?? "").trim();
  const email = String(data.email ?? "").trim();

  const duplicateConditions: any[] = [];

  if (phone) {
    duplicateConditions.push({
      phone,
    });
  }

  if (email) {
    duplicateConditions.push({
      email,
    });
  }

  if (duplicateConditions.length > 0) {
    const exists = await prisma.supplier.findFirst({
      where: {
        OR: duplicateConditions,
      },
    });

    if (exists) {
      throw new Error("Supplier already exists.");
    }
  }

  const supplier = await prisma.supplier.create({
    data: {
      ...data,
      phone: phone || "",
      email: email || "",
    },
  });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return supplier;
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
  const supplier = await prisma.supplier.update({
    where: {
      id
    },
    data
  });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return supplier;
}

export async function deleteSupplier(id: string) {
  const supplier = await prisma.supplier.delete({
    where: {
      id
    }
  });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return supplier;
}