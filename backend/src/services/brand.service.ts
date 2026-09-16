import { prisma } from "../config/prisma";

// =========================
// Get All Brands
// =========================
export async function getBrands() {
  return prisma.brand.findMany({
    include: {
      deviceType: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// =========================
// Get Brands By Device Type
// =========================
export async function getBrandsByDeviceType(deviceTypeId: string) {
  return prisma.brand.findMany({
    where: {
      deviceTypeId,
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

// =========================
// Create Brand
// =========================
export async function createBrand(
  name: string,
  deviceTypeId: string
) {
  return prisma.brand.create({
    data: {
      name,
      deviceTypeId,
    },
  });
}

// =========================
// Update Brand
// =========================
export async function updateBrand(
  id: string,
  data: {
    name?: string;
    active?: boolean;
    deviceTypeId?: string;
  }
) {
  return prisma.brand.update({
    where: {
      id,
    },
    data,
  });
}

// =========================
// Delete Brand
// =========================
export async function deleteBrand(id: string) {
  return prisma.brand.delete({
    where: {
      id,
    },
  });
}