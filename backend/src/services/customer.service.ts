import { prisma } from "../config/prisma";

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
    throw new Error("Customer already exists with this phone number.");
  }

  const customerCount = await prisma.customer.count();

  const customerCode = `CUS-${String(customerCount + 1).padStart(5, "0")}`;

  return prisma.customer.create({
    data: {
      customerCode,
      ...data,
    },
  });
}

export async function getCustomers() {
  return prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: {
      id,
    },
  });
}

export async function updateCustomer(id: string, data: any) {
  return prisma.customer.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteCustomer(id: string) {
  return prisma.customer.delete({
    where: {
      id,
    },
  });
}