import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/availability?slug=grand-cul-de-sac-marin&month=2026-06
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug  = searchParams.get("slug");
  const month = searchParams.get("month"); // YYYY-MM

  if (!slug || !month) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Dispo manuellement gérées par l'admin
  const availabilities = await prisma.availability.findMany({
    where: { excursionId: slug, date: { startsWith: month } },
  });

  // Réservations confirmées (payées ou en attente)
  const reservations = await prisma.reservation.findMany({
    where: {
      excursionId: slug,
      date: { startsWith: month },
      status: { not: "cancelled" },
    },
    select: { date: true, adults: true, children: true },
  });

  // Compte les places prises par date
  const bookedByDate: Record<string, number> = {};
  for (const r of reservations) {
    bookedByDate[r.date] = (bookedByDate[r.date] || 0) + r.adults + r.children;
  }

  // Construit la map date → état
  const dates: Record<string, { spotsLeft: number; isBlocked: boolean }> = {};

  for (const a of availabilities) {
    const booked = Math.max(a.bookedSpots, bookedByDate[a.date] || 0);
    dates[a.date] = {
      spotsLeft: a.isBlocked ? 0 : Math.max(0, a.maxSpots - booked),
      isBlocked: a.isBlocked,
    };
  }

  // Dates avec réservations mais sans entrée Availability
  for (const [date, booked] of Object.entries(bookedByDate)) {
    if (!dates[date]) {
      dates[date] = { spotsLeft: Math.max(0, 12 - booked), isBlocked: false };
    }
  }

  return NextResponse.json({ dates });
}
