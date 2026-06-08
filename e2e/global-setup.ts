import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resetDatabase, seedDatabase } from "@/lib/seed";

export default async function globalSetup() {
  const prisma = new PrismaClient();
  try {
    await resetDatabase(prisma);
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
