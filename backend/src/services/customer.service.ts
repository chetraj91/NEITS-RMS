import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function createCustomer(data: {
  fullName: string;
  companyName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  panVat?: string;
  notes?: string;
}) {
  const exists = await prisma.customer.findUnique({
    where: {
      phone: data.phone,
    },
  });

  if (exists) {
    throw new Error(
      "Customer already exists with this phone number."
    );
  }

  const customerCount =
    await prisma.customer.count();

  const customerCode =
    `CUS-${String(
      customerCount + 1
    ).padStart(5, "0")}`;

  const customer =
    await prisma.customer.create({
      data: {
        customerCode,
        ...data,
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return customer;
}

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomer(
  id: string
) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
  });
}

export async function updateCustomer(
  id: string,
  data: any
) {
  const customer =
    await prisma.customer.update({
      where: {
        id,
      },
      data,
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return customer;
}

export async function deleteCustomer(
  id: string
) {
  const customer =
    await prisma.customer.delete({
      where: {
        id,
      },
    });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return customer;
}

// ==========================================
// SEARCH CUSTOMERS
// ==========================================

export async function searchCustomers(
  query: string
) {
  return prisma.customer.findMany({
    where: {
      OR: [
        {
          fullName: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: query,
          },
        },
        {
          email: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          customerCode: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      fullName: "asc",
    },
    take: 10,
  });
}