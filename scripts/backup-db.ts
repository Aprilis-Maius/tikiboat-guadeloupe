// Sauvegarde manuelle de la base (même export que /api/cron/backup).
// Usage : npx tsx scripts/backup-db.ts → backups/tikiboat-AAAA-MM-JJ.json (ignoré par git)
// Restauration : scripts/restore-backup.ts
import { mkdirSync, writeFileSync } from "fs";
import { prisma } from "@/lib/prisma";
import { exportDatabase } from "@/lib/backup";

async function main() {
  const backup = await exportDatabase();
  const file   = `backups/tikiboat-${backup.exportedAt.slice(0, 10)}.json`;
  mkdirSync("backups", { recursive: true });
  writeFileSync(file, JSON.stringify(backup));

  for (const [table, rows] of Object.entries(backup)) {
    if (Array.isArray(rows)) console.log(`${table} : ${rows.length} ligne(s)`);
  }
  console.log("→", file);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
