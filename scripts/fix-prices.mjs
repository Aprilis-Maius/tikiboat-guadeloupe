import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const updated = await prisma.excursion.updateMany({
  where: { slug: "grand-cul-de-sac-marin" },
  data: { priceAdult: 100, priceChild: 60 },
});

console.log(`✅ ${updated.count} excursion(s) mise(s) à jour — 100€ adulte / 60€ enfant`);

const check = await prisma.excursion.findFirst({ where: { slug: "grand-cul-de-sac-marin" }, select: { priceAdult: true, priceChild: true } });
console.log("Prix en base :", check);

await prisma.$disconnect();
