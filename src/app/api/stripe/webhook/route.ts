import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendPendingEmail, sendAdminPendingNotification } from "@/lib/email";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta    = session.metadata!;

    // Idempotence : ignorer les replays Stripe (Stripe peut renvoyer jusqu'à 3 fois)
    const existing = await prisma.reservation.findFirst({ where: { stripeSessionId: session.id } });
    if (existing) return NextResponse.json({ received: true });

    const adults   = parseInt(meta.adults)   || 0;
    const children = parseInt(meta.children) || 0;
    const infants  = parseInt(meta.infants)  || 0;

    // Sauvegarde la réservation
    await prisma.reservation.create({
      data: {
        excursionId:     meta.excursionSlug,
        excursionTitle:  meta.excursionTitle,
        date:            meta.date,
        adults,
        children,
        infants,
        source:          "online",
        totalPrice:      parseFloat(meta.totalPrice),
        depositAmount:   parseFloat(meta.depositAmount),
        paymentType:     meta.paymentType,
        status:          "pending",
        isPaid:          true,
        customerName:    meta.customerName,
        customerEmail:   session.customer_email ?? "",
        customerPhone:   meta.customerPhone,
        stripeSessionId:       session.id,
        notes:                 meta.notes || null,
        passengerNames:        meta.passengerNames || null,
        certificationAccepted: meta.certificationAccepted === "true",
      },
    });

    // Emails de confirmation
    const emailData = {
      customerName:   meta.customerName,
      customerEmail:  session.customer_email ?? "",
      customerPhone:  meta.customerPhone,
      excursionTitle: meta.excursionTitle,
      excursionSlug:  meta.excursionSlug,
      date:           meta.date,
      adults, children, infants,
      totalPrice:     parseFloat(meta.totalPrice),
      depositAmount:  parseFloat(meta.depositAmount),
      paymentType:    meta.paymentType,
      notes:          meta.notes || undefined,
    };
    await Promise.allSettled([
      sendPendingEmail(emailData),
      sendAdminPendingNotification(emailData),
    ]);

    // Met à jour les places prises dans Availability
    const totalPassengers = adults + children + infants;
    await prisma.availability.upsert({
      where: { date_excursionId: { date: meta.date, excursionId: meta.excursionSlug } },
      update: { bookedSpots: { increment: totalPassengers } },
      create: {
        date:        meta.date,
        excursionId: meta.excursionSlug,
        maxSpots:    12,
        bookedSpots: totalPassengers,
        isBlocked:   false,
      },
    });
  }

  revalidateTag("admin-dashboard", {});
  return NextResponse.json({ received: true });
}
