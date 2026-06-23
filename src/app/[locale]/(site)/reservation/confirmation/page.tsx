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
  const infants      = parseInt(meta?.infants ?? "0");
  const paxLabel     = `${adults} adulte${adults > 1 ? "s" : ""}${children > 0 ? ` + ${children} enfant${children > 1 ? "s" : ""}` : ""}${infants > 0 ? ` + ${infants} bébé${infants > 1 ? "s" : ""}` : ""}`;

  return (
    <section className="min-h-screen pt-32 pb-16 bg-white flex items-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <CheckCircle2 className="text-green-400" size={48} />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-tiki-gold mb-4">
          Demande reçue !
        </h1>
        <p className="text-slate-800 text-xl mb-8">
          Merci pour votre paiement. Votre réservation sera confirmée sous 24 à 48h par notre équipe.
        </p>

        {/* Récapitulatif réservation */}
        {meta && (
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8 text-left">
            {/* Header */}
            <div className="bg-tiki-ocean px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Votre réservation</p>
                <p className="text-white font-bold text-lg leading-tight">{meta.excursionTitle}</p>
              </div>
              <div className="bg-amber-400/20 border border-amber-400/40 rounded-full px-3 py-1">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">En attente</span>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5 space-y-0">
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <CalendarDays size={16} className="text-tiki-gold shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">Date</span>
                <span className="font-semibold text-slate-800 text-sm capitalize ml-auto">{formatDate(meta.date)}</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <Users size={16} className="text-tiki-gold shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">Passagers</span>
                <span className="font-semibold text-slate-800 text-sm ml-auto">{paxLabel}</span>
              </div>
              {customerEmail && (
                <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                  <Mail size={16} className="text-tiki-gold shrink-0" />
                  <span className="text-slate-500 text-sm w-28 shrink-0">Email</span>
                  <span className="font-semibold text-slate-800 text-sm ml-auto">{customerEmail}</span>
                </div>
              )}
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <CreditCard size={16} className="text-tiki-gold shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">Total excursion</span>
                <span className="font-bold text-slate-800 text-sm ml-auto">{totalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex items-center gap-3 py-3">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">{isDeposit ? "Acompte payé" : "Payé"}</span>
                <span className="font-bold text-green-600 ml-auto">{isDeposit ? depositAmount.toFixed(2) : totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            {/* Footer solde */}
            {isDeposit && (
              <div className="bg-amber-50 border-t border-amber-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-800 font-semibold text-sm">Solde à régler le jour J</p>
                  <p className="text-amber-600 text-xs mt-0.5">Avant l&apos;embarquement · CB ou espèces</p>
                </div>
                <span className="text-amber-800 font-bold text-xl">{remaining.toFixed(2)} €</span>
              </div>
            )}
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
