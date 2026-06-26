import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/email";
import { excursions as staticExcursions } from "@/data/excursions";
import { revalidateTag } from "next/cache";

const invalidateDashboard = () => revalidateTag("admin-dashboard", {});


export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date   = searchParams.get("date");
  const status = searchParams.get("status");

  const VALID_STATUSES = ["pending", "confirmed", "cancelled"];
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(date   ? { date }   : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { date: "asc" },
    select: {
      id: true, excursionId: true, excursionTitle: true, date: true,
      adults: true, children: true, infants: true, source: true,
      totalPrice: true, depositAmount: true, paymentType: true,
      status: true, isPaid: true,
      customerName: true, customerEmail: true, customerPhone: true,
      notes: true, passengerNames: true, certificationAccepted: true, createdAt: true,
      // stripeSessionId volontairement exclu
    },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  // Vérification conflits privatisation côté serveur
  const existingOnDay = await prisma.reservation.findMany({
    where: { date: body.date, status: { not: "cancelled" } },
    select: { excursionId: true, customerName: true },
  });
  const hasPrivatisation = existingOnDay.some(r => r.excursionId === "privatisation");

  const blocksDay = body.blocksDay === true || body.blocksDay === "true";
  if (blocksDay && existingOnDay.length > 0) {
    return NextResponse.json({
      error: `Impossible : des réservations existent déjà le ${body.date}. Annulez-les d'abord.`,
    }, { status: 409 });
  }
  if (!blocksDay && hasPrivatisation) {
    return NextResponse.json({
      error: "Ce jour est privatisé. Impossible d'ajouter une réservation.",
    }, { status: 409 });
  }

  const reservation = await prisma.reservation.create({
    data: {
      excursionId:    body.excursionId    ?? "",
      excursionTitle: body.excursionTitle,
      date:           body.date,
      adults:         Number(body.adults ?? 1),
      children:       Number(body.children ?? 0),
      infants:        Number(body.infants ?? 0),
      source:         "manual",
      totalPrice:     Number(body.totalPrice ?? 0),
      depositAmount:  Number(body.depositAmount ?? 0),
      paymentType:    body.paymentType ?? "full",
      isPaid:         body.isPaid ?? false,
      status:         body.status ?? "confirmed",
      customerName:   body.customerName,
      customerEmail:  body.customerEmail ?? "",
      customerPhone:  body.customerPhone ?? "",
      notes:          body.notes ?? null,
    },
  });
  // Emails — en parallèle, sans bloquer la réponse
  if (body.customerEmail) {
    const emailData = {
      customerName:   body.customerName,
      customerEmail:  body.customerEmail,
      customerPhone:  body.customerPhone ?? "",
      excursionTitle: body.excursionTitle,
      excursionSlug:  body.excursionSlug,
      date:           body.date,
      adults:         Number(body.adults ?? 1),
      children:       Number(body.children ?? 0),
      infants:        Number(body.infants ?? 0),
      totalPrice:     Number(body.totalPrice ?? 0),
      depositAmount:  Number(body.depositAmount ?? 0),
      paymentType:    body.paymentType ?? "full",
      notes:          body.notes || undefined,
    };
    Promise.allSettled([
      sendConfirmationEmail(emailData),
      sendAdminNotification(emailData),
    ]).catch(() => {});
  }

  // Privatisation → bloquer le jour pour toutes les excursions (statiques + DB)
  if (blocksDay) {
    const dbExcursions = await prisma.excursion.findMany({ select: { slug: true } });
    const allSlugs = Array.from(new Set([
      ...staticExcursions.map(e => e.slug),
      ...dbExcursions.map(e => e.slug),
    ]));
    await Promise.all(allSlugs.map(slug =>
      prisma.availability.upsert({
        where: { date_excursionId: { date: body.date, excursionId: slug } },
        update: { isBlocked: true, blockReason: "Privatisation", bookedSpots: 12 },
        create: { date: body.date, excursionId: slug, maxSpots: 12, bookedSpots: 12, isBlocked: true, blockReason: "Privatisation" },
      })
    ));
  }

  invalidateDashboard();
  return NextResponse.json(reservation);
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;

  const data: Record<string, unknown> = {};
  if (fields.status       !== undefined) data.status        = fields.status;
  if (fields.isPaid       !== undefined) data.isPaid        = fields.isPaid;
  if (fields.notes        !== undefined) data.notes         = fields.notes;
  if (fields.date         !== undefined) data.date          = fields.date;
  if (fields.adults       !== undefined) data.adults        = Number(fields.adults);
  if (fields.children     !== undefined) data.children      = Number(fields.children);
  if (fields.infants      !== undefined) data.infants       = Number(fields.infants);
  if (fields.customerName  !== undefined) data.customerName = fields.customerName;
  if (fields.customerEmail !== undefined) data.customerEmail = fields.customerEmail;
  if (fields.customerPhone !== undefined) data.customerPhone = fields.customerPhone;
  if (fields.paymentType  !== undefined) data.paymentType   = fields.paymentType;

  const updated = await prisma.reservation.update({
    where: { id },
    data,
  });

  // Quand l'admin confirme manuellement → envoie l'email de confirmation au client
  if (fields.action === "confirm" && updated.customerEmail) {
    const emailData = {
      customerName:   updated.customerName,
      customerEmail:  updated.customerEmail,
      customerPhone:  updated.customerPhone,
      excursionTitle: updated.excursionTitle,
      excursionSlug:  updated.excursionId,
      date:           updated.date,
      adults:         updated.adults,
      children:       updated.children,
      infants:        updated.infants,
      totalPrice:     updated.totalPrice,
      depositAmount:  updated.depositAmount,
      paymentType:    updated.paymentType,
      notes:          updated.notes ?? undefined,
    };
    Promise.allSettled([sendConfirmationEmail(emailData)]).catch(() => {});
  }

  // Si une privatisation est annulée, débloquer le jour
  if (fields.status === "cancelled" && updated.excursionId === "privatisation") {
    await prisma.availability.updateMany({
      where: { date: updated.date, blockReason: "Privatisation" },
      data: { isBlocked: false, bookedSpots: 0, blockReason: null },
    });
  }

  invalidateDashboard();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const reservation = await prisma.reservation.findUnique({ where: { id }, select: { excursionId: true, date: true } });

  await prisma.reservation.delete({ where: { id } });

  // Si c'était une privatisation, débloquer le jour dans Availability
  if (reservation?.excursionId === "privatisation") {
    await prisma.availability.updateMany({
      where: { date: reservation.date, blockReason: "Privatisation" },
      data: { isBlocked: false, bookedSpots: 0, blockReason: null },
    });
  }

  invalidateDashboard();
  return NextResponse.json({ ok: true });
}
