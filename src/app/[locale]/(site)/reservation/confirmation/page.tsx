import Stripe from "stripe";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, CalendarDays, Mail, Phone, Home, Users, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réservation confirmée !",
};

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let meta: Record<string, string> | null = null;
  let customerEmail: string | null = null;

  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      meta = session.metadata as Record<string, string>;
      customerEmail = session.customer_email;
    } catch {}
  }

  const adults       = parseInt(meta?.adults ?? "0");
  const children     = parseInt(meta?.children ?? "0");
  const totalPrice   = parseFloat(meta?.totalPrice ?? "0");
  const depositAmount = parseFloat(meta?.depositAmount ?? "0");
  const isDeposit    = meta?.paymentType === "deposit";
  const remaining    = totalPrice - depositAmount;
  const paxLabel     = `${adults} adulte${adults > 1 ? "s" : ""}${children > 0 ? ` + ${children} enfant${children > 1 ? "s" : ""}` : ""}`;

  return (
    <section className="min-h-screen pt-32 pb-16 bg-white flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <CheckCircle2 className="text-green-400" size={48} />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-tiki-gold mb-4">
          Réservation confirmée !
        </h1>
        <p className="text-slate-800 text-xl mb-8">
          Merci pour votre réservation. Vous allez recevoir un email de confirmation dans quelques minutes.
        </p>

        {/* Récapitulatif réservation */}
        {meta && (
          <div className="bg-tiki-ocean/5 border border-tiki-ocean/20 rounded-2xl p-6 text-left mb-8">
            <h2 className="font-bold text-tiki-ocean text-lg mb-4 text-center">
              📋 Récapitulatif de votre réservation
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Excursion</span>
                <span className="font-semibold text-slate-800 text-sm text-right max-w-[60%]">{meta.excursionTitle}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Date</span>
                <span className="font-semibold text-slate-800 text-sm capitalize">{formatDate(meta.date)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm flex items-center gap-1.5"><Users size={14} /> Passagers</span>
                <span className="font-semibold text-slate-800 text-sm">{paxLabel}</span>
              </div>
              {customerEmail && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">Email</span>
                  <span className="font-semibold text-slate-800 text-sm">{customerEmail}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 text-sm">Total</span>
                <span className="font-bold text-tiki-gold text-lg">{totalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 text-sm flex items-center gap-1.5"><CreditCard size={14} /> {isDeposit ? "Acompte payé (30%)" : "Payé"}</span>
                <span className="font-semibold text-green-600 text-sm">✓ {isDeposit ? depositAmount.toFixed(2) : totalPrice.toFixed(2)} €</span>
              </div>
              {isDeposit && (
                <div className="flex items-center justify-between py-1.5 bg-amber-50 rounded-lg px-3 -mx-1">
                  <span className="text-amber-700 text-sm font-medium">Solde à régler le jour J</span>
                  <span className="font-bold text-amber-700 text-sm">{remaining.toFixed(2)} €</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What's next */}
        <div className="card-dark text-left mb-8">
          <h2 className="font-bold text-slate-800 text-lg mb-4">Et maintenant ?</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="text-tiki-gold shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-slate-800">Email de confirmation</div>
                <div className="text-slate-500 text-sm">Vérifiez votre boîte mail (et les spams). Vous y trouverez tous les détails de votre sortie.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="text-tiki-gold shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-slate-800">Contact WhatsApp</div>
                <div className="text-slate-500 text-sm">Notre équipe vous contactera sous 24h pour confirmer les détails et le point de rendez-vous exact.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CalendarDays className="text-tiki-gold shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-slate-800">Le jour J</div>
                <div className="text-slate-500 text-sm">Arrivez 15 minutes avant le départ. Prévoyez maillot de bain, crème solaire et une bonne humeur !</div>
              </div>
            </li>
          </ul>
        </div>

        {/* Info acompte */}
        {isDeposit && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-tiki-gold/10 border border-tiki-gold/30 text-left mb-8">
            <CheckCircle2 className="text-tiki-gold shrink-0 mt-0.5" size={18} />
            <p className="text-slate-500 text-sm">
              Vous avez payé un acompte de <strong className="text-slate-800">{depositAmount.toFixed(2)} €</strong>. Le <strong className="text-slate-800">solde de {remaining.toFixed(2)} € sera à régler le jour de l&apos;excursion</strong>, avant l&apos;embarquement (CB ou espèces).
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={18} />
            Retour à l&apos;accueil
          </Link>
          <a
            href="https://wa.me/590690495848"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Nous contacter sur WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
