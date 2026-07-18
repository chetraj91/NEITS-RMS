import { prisma } from "../config/prisma";

export async function createRepairJob(data: any) {
  const lastJob = await prisma.repairJob.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  let nextNumber = 1;

  if (lastJob) {
    nextNumber =
      parseInt(lastJob.jobNumber.replace("JOB-", "")) + 1;
  }

  const jobNumber = `JOB-${String(nextNumber).padStart(5, "0")}`;

  return prisma.repairJob.create({
    data: {
      jobNumber,
      ...data,
    },
  });
}

export async function getRepairJobs() {
  return prisma.repairJob.findMany({
    include: {
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getRepairJob(id: string) {
  return prisma.repairJob.findUnique({
    where: { id },
    include: {
      customer: true,
    },
  });
}

export async function updateRepairJob(id: string, data: any) {
  return prisma.repairJob.update({
    where: { id },
    data,
  });
}

export async function deleteRepairJob(id: string) {
  return prisma.repairJob.delete({
    where: { id },
  });
}