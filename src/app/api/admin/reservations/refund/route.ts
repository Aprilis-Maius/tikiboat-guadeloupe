import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });
}

// POST /api/admin/reservations/refund
// body: { id: string, amount?: number }  — amount en euros ; absent = remboursement total du payé
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "id manquant" }, { status: 400 });

  const resa = await prisma.reservation.findUnique({ where: { id } });
  if (!resa) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
  if (!resa.stripePaymentIntentId) {
    return NextResponse.json({
      error: "Pas de paiement Stripe lié (réservation manuelle ou antérieure à la mise à jour). Remboursez depuis le dashboard Stripe.",
    }, { status: 400 });
  }

  // Montant payé en ligne = acompte si deposit, sinon total
  const paidAmount = resa.paymentType === "deposit" ? resa.depositAmount : resa.totalPrice;
  const alreadyRefunded = resa.refundedAmount ?? 0;
  const maxRefundable = Math.max(0, paidAmount - alreadyRefunded);
  if (maxRefundable <= 0) {
    return NextResponse.json({ error: "Déjà intégralement remboursé." }, { status: 400 });
  }

  const requested = body.amount !== undefined ? Number(body.amount) : maxRefundable;
  if (!Number.isFinite(requested) || requested <= 0 || requested > maxRefundable) {
    return NextResponse.json({
      error: `Montant invalide. Maximum remboursable : ${maxRefundable.toFixed(2)} €`,
    }, { status: 400 });
  }

  try {
    await getStripe().refunds.create({
      payment_intent: resa.stripePaymentIntentId,
      amount: Math.round(requested * 100), // centimes
      reason: "requested_by_customer",
    });
  } catch (err) {
    console.error("Refund error:", err);
    const msg = err instanceof Stripe.errors.StripeError ? err.message : "Échec du remboursement Stripe";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const newRefunded = alreadyRefunded + requested;
  const updated = await prisma.reservation.update({
    where: { id },
    data: {
      refundedAmount: newRefunded,
      // Remboursement total → annulée ; partiel → statut inchangé
      ...(newRefunded >= paidAmount ? { status: "cancelled" } : {}),
    },
  });

  revalidateTag("admin-dashboard", {});
  return NextResponse.json({
    ok: true,
    refunded: requested,
    totalRefunded: newRefunded,
    status: updated.status,
  });
}
