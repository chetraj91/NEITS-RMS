import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: {
      username: "admin",
    },
  });

  if (existing) {
    console.log("Administrator already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.create({
    data: {
      fullName: "Administrator",
      username: "admin",
      password: hashedPassword,
      role: "Administrator",
      active: true,
    },
  });

  console.log("Administrator created successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });