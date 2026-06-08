import { prisma } from "@/lib/db";
import { resetDatabase, seedDatabase } from "@/lib/seed";

async function main() {
  console.log("Resetting database…");
  await resetDatabase(prisma);
  console.log("Seeding…");
  await seedDatabase(prisma);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
