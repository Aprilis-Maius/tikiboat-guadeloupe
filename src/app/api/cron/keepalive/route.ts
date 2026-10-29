import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cron quotidien (vercel.json) : Supabase met en pause les projets du plan
// gratuit après 7 jours sans activité sur la base.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const excursions = await prisma.excursion.count();
  return NextResponse.json({ ok: true, excursions });
}
