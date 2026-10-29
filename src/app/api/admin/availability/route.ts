import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllExcursionSlugs } from "@/lib/excursions";


export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  const where = month
    ? { date: { startsWith: month } }
    : {};

  const availabilities = await prisma.availability.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(availabilities);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, excursionId, maxSpots, bookedSpots, isBlocked, blockReason } = body;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  }

  // Sans excursion précise (calendrier admin), le réglage du jour s'applique à
  // toutes : le calendrier public et le paiement lisent la ligne de leur excursion
  const slugs = excursionId ? [String(excursionId)] : await getAllExcursionSlugs();
  const availabilities = await Promise.all(slugs.map(slug =>
    prisma.availability.upsert({
      where: { date_excursionId: { date, excursionId: slug } },
      update: {
        ...(maxSpots    !== undefined ? { maxSpots }    : {}),
        ...(bookedSpots !== undefined ? { bookedSpots } : {}),
        ...(isBlocked   !== undefined ? { isBlocked }   : {}),
        ...(blockReason !== undefined ? { blockReason } : {}),
      },
      create: { date, excursionId: slug, maxSpots: maxSpots ?? 12, bookedSpots: bookedSpots ?? 0, isBlocked: isBlocked ?? false, blockReason },
    })
  ));

  return NextResponse.json(availabilities);
}
