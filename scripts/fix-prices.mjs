import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updated = await prisma.excursion.updateMany({
  where: { slug: "grand-cul-de-sac-marin" },
  data: { priceAdult: 95, priceChild: 55 },
});

console.log(`✅ ${updated.count} excursion(s) mise(s) à jour — 95€ adulte / 55€ enfant`);
await prisma.$disconnect();
