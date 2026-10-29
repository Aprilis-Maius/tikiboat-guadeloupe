import { NextRequest, NextResponse, after } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail, sendAdminNotification, OVERBOOKING_ALERT } from "@/lib/email";
import { getAllExcursionSlugs } from "@/lib/excursions";
import { revalidateTag } from "next/cache";

const invalidateDashboard = () => revalidateTag("admin-dashboard", {});

// Privatisation → bloquer le jour pour toutes les excursions (statiques + DB)
async function blockDay(date: string) {
  const slugs = await getAllExcursionSlugs();
  await Promise.all(slugs.map(slug =>
    prisma.availability.upsert({
      where: { date_excursionId: { date, excursionId: slug } },
      update: { isBlocked: true, blockReason: "Privatisation", bookedSpots: 12 },
      create: { date, excursionId: slug, maxSpots: 12, bookedSpots: 12, isBlocked: true, blockReason: "Privatisation" },
    })
  ));
}

async function unblockDay(date: string) {
  await prisma.availability.updateMany({
    where: { date, blockReason: "Privatisation" },
    data: { isBlocked: false, bookedSpots: 0, blockReason: null },
  });
}

// Emails envoyés après la réponse : after() empêche Vercel de couper l'envoi en cours
function sendAfterResponse(label: string, sends: Promise<unknown>[]) {
  after(async () => {
    const results = await Promise.allSettled(sends);
    results.forEach(r => {
      if (r.status === "rejected") console.error(`[admin/reservations] ${label} :`, r.reason);
    });
  });
}


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
      refundedAmount: true,
      // Bool uniquement — l'ID Stripe lui-même ne sort pas de l'API
      stripePaymentIntentId: true,
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
      passengerNames:        typeof body.passengerNames === "string" ? body.passengerNames : null,
      certificationAccepted: body.certificationAccepted === true,
    },
  });

  // Le client n'est prévenu que d'une réservation confirmée (une demande en attente
  // l'est à sa confirmation, PATCH action "confirm") ; les notes de l'admin restent internes
  if (reservation.customerEmail) {
    const emailData = {
      customerName:   reservation.customerName,
      customerEmail:  reservation.customerEmail,
      customerPhone:  reservation.customerPhone,
      excursionTitle: reservation.excursionTitle,
      excursionSlug:  body.excursionSlug ?? reservation.excursionId,
      date:           reservation.date,
      adults:         reservation.adults,
      children:       reservation.children,
      infants:        reservation.infants,
      totalPrice:     reservation.totalPrice,
      depositAmount:  reservation.depositAmount,
      paymentType:    reservation.paymentType,
      isPaid:         reservation.isPaid,
    };
    sendAfterResponse("email réservation manuelle", [
      ...(reservation.status === "confirmed" ? [sendConfirmationEmail(emailData)] : []),
      sendAdminNotification({ ...emailData, notes: reservation.notes ?? undefined }),
    ]);
  }

  if (blocksDay) await blockDay(body.date);

  invalidateDashboard();
  return NextResponse.json(reservation);
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...fields } = body;

  const before = await prisma.reservation.findUnique({
    where: { id },
    select: { date: true, status: true, excursionId: true },
  });
  if (!before) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });

  // Privatisation déplacée ou réactivée : le nouveau jour doit être libre
  const isPrivatisation = before.excursionId === "privatisation";
  const newDate   = fields.date   ?? before.date;
  const newStatus = fields.status ?? before.status;
  const blocksNewDay = isPrivatisation && newStatus !== "cancelled"
    && (newDate !== before.date || before.status === "cancelled");
  if (blocksNewDay) {
    const conflicts = await prisma.reservation.count({
      where: { date: newDate, status: { not: "cancelled" }, id: { not: id } },
    });
    if (conflicts > 0) {
      return NextResponse.json({
        error: `Impossible : des réservations existent déjà le ${newDate}. Annulez-les d'abord.`,
      }, { status: 409 });
    }
  }

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

  // Quand l'admin confirme manuellement → envoie l'email de confirmation au client.
  // Seule la remarque du client y figure : jamais les notes internes ni l'alerte de surréservation
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
      isPaid:         updated.isPaid,
      notes:          updated.source === "online"
        ? updated.notes?.replace(OVERBOOKING_ALERT, "").trim() || undefined
        : undefined,
    };
    sendAfterResponse("email de confirmation", [sendConfirmationEmail(emailData)]);
  }

  // Privatisation annulée, déplacée ou réactivée : le jour bloqué la suit
  if (isPrivatisation) {
    if (before.status !== "cancelled" && (updated.status === "cancelled" || updated.date !== before.date)) {
      await unblockDay(before.date);
    }
    if (blocksNewDay) await blockDay(updated.date);
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
    await unblockDay(reservation.date);
  }

  invalidateDashboard();
  return NextResponse.json({ ok: true });
}
