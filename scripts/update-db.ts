import { prisma } from "@/lib/prisma";

async function main() {
  const r1 = await prisma.excursion.updateMany({
    where: { slug: "coucher-de-soleil" },
    data: { isActive: false },
  });
  console.log("Coucher de soleil désactivé :", r1.count, "ligne(s)");

  const r2 = await prisma.excursion.updateMany({
    where: { slug: "grand-cul-de-sac-marin" },
    data: { departureTime: "09h00", returnTime: "16h00" },
  });
  console.log("Horaires mis à jour :", r2.count, "ligne(s)");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
