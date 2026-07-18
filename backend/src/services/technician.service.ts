import { prisma } from "../config/prisma";

export async function createTechnician(data: any) {
  return prisma.technician.create({
    data,
  });
}

export async function getTechnicians() {
  return prisma.technician.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getTechnician(id: string) {
  return prisma.technician.findUnique({
    where: { id },
  });
}

export async function updateTechnician(id: string, data: any) {
  return prisma.technician.update({
    where: { id },
    data,
  });
}

export async function deleteTechnician(id: string) {
  return prisma.technician.delete({
    where: { id },
  });
}