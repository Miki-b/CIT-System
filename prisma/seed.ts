import { PrismaClient } from "@prisma/client";
import { seedDemoData } from "../src/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CIT tracking database...");
  await seedDemoData(prisma, { reset: true });
  console.log("Seed complete: 5 drivers, 3 clients, 3 deliveries.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
