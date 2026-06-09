import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resetDatabase, seedDatabase } from "@/lib/seed";

export default async function globalSetup() {
  const url = process.env.DATABASE_URL ?? "";
  // Hard guard: this wipes the database, so refuse anything but a local host.
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) {
    throw new Error(
      `Refusing to reset/seed a non-local database. DATABASE_URL must point at localhost for E2E. Got: ${url.replace(/:[^:@/]*@/, ":***@")}`,
    );
  }

  const prisma = new PrismaClient();
  try {
    await resetDatabase(prisma);
    await seedDatabase(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
