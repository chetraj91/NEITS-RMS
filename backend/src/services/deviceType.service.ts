import { prisma } from "../config/prisma";

export async function getDeviceTypes() {
  return prisma.deviceType.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function createDeviceType(name: string) {
  return prisma.deviceType.create({
    data: {
      name,
    },
  });
}

export async function updateDeviceType(
  id: string,
  data: {
    name?: string;
    active?: boolean;
  }
) {
  return prisma.deviceType.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteDeviceType(id: string) {
  return prisma.deviceType.delete({
    where: {
      id,
    },
  });
}