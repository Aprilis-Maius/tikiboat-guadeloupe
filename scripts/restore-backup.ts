// Restaure une sauvegarde envoyée chaque semaine par /api/cron/backup.
// Usage : npx tsx scripts/restore-backup.ts tikiboat-AAAA-MM-JJ.json
// Les lignes déjà présentes (même id) sont ignorées : rien n'est écrasé.
import { readFileSync } from "fs";
import { prisma } from "@/lib/prisma";

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage : npx tsx scripts/restore-backup.ts <fichier.json>");
  const b = JSON.parse(readFileSync(file, "utf8"));

  const results = {
    excursions:   await prisma.excursion.createMany({ data: b.excursions, skipDuplicates: true }),
    blogPosts:    await prisma.blogPost.createMany({ data: b.blogPosts, skipDuplicates: true }),
    galleryItems: await prisma.galleryItem.createMany({ data: b.galleryItems, skipDuplicates: true }),
    siteContent:  await prisma.siteContent.createMany({ data: b.siteContent, skipDuplicates: true }),
    availability: await prisma.availability.createMany({ data: b.availability, skipDuplicates: true }),
    reservations: await prisma.reservation.createMany({ data: b.reservations, skipDuplicates: true }),
  };

  for (const [table, { count }] of Object.entries(results)) {
    console.log(`${table} : ${count} ligne(s) restaurée(s) sur ${b[table].length}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
