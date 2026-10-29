import { NextRequest, NextResponse } from "next/server";
import { exportDatabase } from "@/lib/backup";
import { sendBackupEmail } from "@/lib/email";

// Cron hebdomadaire (vercel.json) : le plan gratuit Supabase ne fait aucune
// sauvegarde. Export JSON de toutes les tables, envoyé par email.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backup   = await exportDatabase();
  const filename = `tikiboat-${backup.exportedAt.slice(0, 10)}.json`;
  try {
    await sendBackupEmail(filename, JSON.stringify(backup), backup.reservations.length);
  } catch (err) {
    console.error("[cron/backup]", err);
    return NextResponse.json({ error: "Envoi de la sauvegarde impossible" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, filename });
}
