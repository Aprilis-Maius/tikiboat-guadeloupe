import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendConfirmationEmail, sendAdminNotification } from "@/lib/email";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date   = searchParams.get("date");
  const status = searchParams.get("status");

  const reservations = await prisma.reservation.findMany({
    where: {
      ...(date   ? { date }   : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
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

  // Privatisation → bloquer le jour pour toutes les excursions
  if (body.blocksDay) {
    const excursions = await prisma.excursion.findMany({ select: { slug: true } });
    await Promise.all(excursions.map(e =>
      prisma.availability.upsert({
        where: { date_excursionId: { date: body.date, excursionId: e.slug } },
        update: { isBlocked: true, blockReason: "Privatisation", bookedSpots: 12 },
        create: { date: body.date, excursionId: e.slug, maxSpots: 12, bookedSpots: 12, isBlocked: true, blockReason: "Privatisation" },
      })
    ));
  }

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

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.reservation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
