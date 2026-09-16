import { prisma } from "../config/prisma";
import { triggerAutomaticExcelBackup } from "./automaticExcelBackup.service";

export async function createTechnician(data: any) {
  const technician = await prisma.technician.create({
    data,
  });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return technician;
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

export async function updateTechnician(
  id: string,
  data: any
) {
  const technician = await prisma.technician.update({
    where: { id },
    data,
  });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return technician;
}

export async function deleteTechnician(id: string) {
  const technician = await prisma.technician.delete({
    where: { id },
  });

  // =====================================================
  // AUTOMATIC EXCEL BACKUP
  // =====================================================

  triggerAutomaticExcelBackup();

  return technician;
}