import { PrismaClient } from "../generated/prisma";
import { hashPassword } from "../utils/password";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: {
      email: "admin@neits.com",
    },
  });

  if (existing) {
    console.log("✅ Admin user already exists.");
    return;
  }

  const password = await hashPassword("Admin@123");

  await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@neits.com",
      password,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created successfully.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });