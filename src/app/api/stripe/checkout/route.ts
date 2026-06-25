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

    // Prix recalculés côté serveur — ne jamais faire confiance au client
    const numAdults   = Math.max(0, parseInt(String(adults))   || 0);
    const numChildren = Math.max(0, parseInt(String(children)) || 0);
    const numInfants  = Math.max(0, parseInt(String(body.infants ?? 0)) || 0);
    const serverTotal   = numAdults * excursion.priceAdult + numChildren * excursion.priceChild;
    const serverDeposit = paymentType === "deposit" ? Math.round(serverTotal * 0.3 * 100) / 100 : 0;
    const serverAmountToPay = paymentType === "deposit" ? serverDeposit : serverTotal;
    if (serverTotal <= 0) return NextResponse.json({ error: "Prix invalide" }, { status: 400 });

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
    const requested   = numAdults + numChildren + numInfants;
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
              description: `${date} · ${numAdults} adulte${numAdults > 1 ? "s" : ""}${numChildren > 0 ? ` + ${numChildren} enfant${numChildren > 1 ? "s" : ""}` : ""} · Départ ${excursion.departureTime} · Retour ${excursion.returnTime}`,
              images: excursion.images[0] ? [`${baseUrl}${excursion.images[0]}`] : [],
            },
            unit_amount: Math.round(serverAmountToPay * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        excursionSlug,
        excursionTitle: excursion.title,
        date,
        adults:        String(numAdults),
        children:      String(numChildren),
        infants:       String(numInfants),
        customerName,
        customerPhone,
        totalPrice:    String(serverTotal),
        depositAmount: String(serverDeposit),
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
