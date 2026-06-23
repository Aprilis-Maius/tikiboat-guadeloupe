import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getExcursionBySlug } from "@/lib/excursions";
import { prisma } from "@/lib/prisma";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      excursionSlug,
      date,
      adults,
      children,
      customerName,
      customerEmail,
      customerPhone,
      paymentType,
      totalPrice,
      depositAmount,
      amountToPay,
      notes,
    } = body;

    const excursion = await getExcursionBySlug(excursionSlug);
    if (!excursion) return NextResponse.json({ error: "Excursion not found" }, { status: 404 });

    // Vérification capacité côté serveur (filet de sécurité)
    const avail = await prisma.availability.findUnique({
      where: { date_excursionId: { date, excursionId: excursionSlug } },
    });
    if (avail?.isBlocked) {
      return NextResponse.json({ error: "Ce jour n'est plus disponible (privatisé ou complet)." }, { status: 409 });
    }
    const existingResas = await prisma.reservation.findMany({
      where: { date, excursionId: excursionSlug, status: { not: "cancelled" } },
      select: { adults: true, children: true, infants: true },
    });
    const bookedCount = existingResas.reduce((s, r) => s + r.adults + r.children + (r.infants ?? 0), 0);
    const maxSpots    = avail?.maxSpots ?? excursion.maxPassengers ?? 12;
    const remaining   = maxSpots - bookedCount;
    const requested   = Number(adults) + Number(children) + Number(body.infants ?? 0);
    if (requested > remaining) {
      return NextResponse.json({
        error: `Plus assez de places. Il reste ${remaining} place${remaining !== 1 ? "s" : ""} ce jour.`,
        spotsLeft: remaining,
      }, { status: 409 });
    }

    const isDeposit = paymentType === "deposit";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: isDeposit
                ? `Acompte — ${excursion.title}`
                : excursion.title,
              description: `${date} · ${adults} adulte${adults > 1 ? "s" : ""}${children > 0 ? ` + ${children} enfant${children > 1 ? "s" : ""}` : ""} · Départ ${excursion.departureTime} · Retour ${excursion.returnTime}`,
              images: excursion.images[0] ? [`${baseUrl}${excursion.images[0]}`] : [],
            },
            unit_amount: Math.round(amountToPay * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        excursionSlug,
        excursionTitle: excursion.title,
        date,
        adults:        String(adults),
        children:      String(children),
        infants:       String(body.infants ?? 0),
        customerName,
        customerPhone,
        totalPrice:    String(totalPrice),
        depositAmount: String(paymentType === "full" ? 0 : depositAmount),
        paymentType,
        notes:         notes || "",
      },
      success_url: `${baseUrl}/reservation/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/reservation?excursion=${excursionSlug}`,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: "Stripe session failed" }, { status: 500 });
  }
}
