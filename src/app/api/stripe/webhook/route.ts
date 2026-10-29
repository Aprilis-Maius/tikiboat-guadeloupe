import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendPendingEmail, sendAdminPendingNotification, OVERBOOKING_ALERT } from "@/lib/email";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature")!;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-08-26.dahlia",
  });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature invalid" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta    = session.metadata;
    if (!meta?.excursionSlug || !meta?.date) {
      // Metadata absente/corrompue : ne pas faire retenter Stripe en boucle
      console.error("Webhook: metadata manquante pour session", session.id);
      return NextResponse.json({ received: true });
    }
    // Ne traiter que les paiements réellement effectués
    if (session.payment_status !== "paid") return NextResponse.json({ received: true });

    // Idempotence : ignorer les replays Stripe (Stripe peut renvoyer jusqu'à 3 fois)
    const existing = await prisma.reservation.findFirst({ where: { stripeSessionId: session.id } });
    if (existing) return NextResponse.json({ received: true });

    const adults   = parseInt(meta.adults)   || 0;
    const children = parseInt(meta.children) || 0;
    const infants  = parseInt(meta.infants)  || 0;

    // Re-check capacité au moment du paiement (le check du checkout date
    // d'avant la session Stripe — race condition possible entre 2 clients).
    // Le client a payé : on enregistre quand même, mais on alerte l'admin.
    const others = await prisma.reservation.findMany({
      where: { date: meta.date, excursionId: meta.excursionSlug, status: { not: "cancelled" } },
      select: { adults: true, children: true, infants: true },
    });
    // Mêmes règles que le checkout : jour bloqué (privatisation, météo…), jauge du jour, places saisies par l'admin
    const avail = await prisma.availability.findUnique({
      where: { date_excursionId: { date: meta.date, excursionId: meta.excursionSlug } },
    });
    const alreadyBooked = Math.max(
      avail?.bookedSpots ?? 0,
      others.reduce((s, r) => s + r.adults + r.children + (r.infants ?? 0), 0),
    );
    const capacity = await prisma.excursion.findUnique({ where: { slug: meta.excursionSlug }, select: { maxPassengers: true } }).catch(() => null);
    const maxSpots = avail?.maxSpots ?? capacity?.maxPassengers ?? 12;
    const overbooked = !!avail?.isBlocked || alreadyBooked + adults + children + infants > maxSpots;
    const notesWithAlert = overbooked
      ? `${OVERBOOKING_ALERT} ${meta.notes || ""}`.trim()
      : meta.notes || null;

    // Restaure les noms de passagers depuis le format compact de la metadata
    let passengerNamesJson: string | null = null;
    try {
      const compact = JSON.parse(meta.passengerNames || "[]") as [string, string][];
      const typeMap: Record<string, string> = { a: "adult", c: "child", i: "infant" };
      passengerNamesJson = JSON.stringify(compact.map(([name, t]) => ({ name, type: typeMap[t] ?? "adult" })));
    } catch {
      passengerNamesJson = meta.passengerNames || null; // ancien format (JSON complet)
    }

    // Sauvegarde la réservation — le @unique sur stripeSessionId garantit
    // l'atomicité de la dédup même si deux livraisons arrivent en parallèle
    try {
      await prisma.reservation.create({
        data: {
          excursionId:     meta.excursionSlug,
          excursionTitle:  meta.excursionTitle,
          date:            meta.date,
          adults,
          children,
          infants,
          source:          "online",
          totalPrice:      parseFloat(meta.totalPrice) || 0,
          depositAmount:   parseFloat(meta.depositAmount) || 0,
          paymentType:     meta.paymentType,
          status:          "pending",
          isPaid:          true,
          customerName:    meta.customerName,
          customerEmail:   session.customer_email ?? "",
          customerPhone:   meta.customerPhone,
          stripeSessionId:       session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          notes:                 notesWithAlert,
          passengerNames:        passengerNamesJson,
          certificationAccepted: meta.certificationAccepted === "true",
        },
      });
    } catch (err: unknown) {
      // P2002 = doublon stripeSessionId : replay concurrent déjà traité
      if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
        return NextResponse.json({ received: true });
      }
      throw err; // vraie erreur DB → 500 → Stripe retentera
    }

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
    const emailResults = await Promise.allSettled([
      sendPendingEmail(emailData),
      // L'admin reçoit l'alerte de surréservation ; le client, jamais
      sendAdminPendingNotification({ ...emailData, notes: notesWithAlert ?? undefined }),
    ]);
    emailResults.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(`Webhook: échec email ${i === 0 ? "client" : "admin"} pour session ${session.id}:`, r.reason);
      }
    });

    // Pas de compteur de places à incrémenter : calendrier et checkout comptent
    // les réservations elles-mêmes, donc une annulation libère bien les places.
  }

  revalidateTag("admin-dashboard", {});
  return NextResponse.json({ received: true });
}
