import Stripe from "stripe";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, CalendarDays, Mail, Phone, Home, Users, CreditCard } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réservation confirmée !",
  robots: { index: false },
};

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });
}

function formatDate(d: string, dateLocale: string) {
  // Parse en local à midi pour éviter le décalage de fuseau (Guadeloupe UTC-4)
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, (m || 1) - 1, day || 1, 12).toLocaleDateString(dateLocale, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

// La page est accessible par simple possession du session_id (URL dans l'historique
// d'un poste partagé, etc.) — on masque l'email pour ne pas exposer de PID en clair.
function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const shown = user.slice(0, 1);
  return `${shown}${"•".repeat(Math.max(2, user.length - 1))}@${domain}`;
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const t = await getTranslations("reservationPage");
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";

  let meta: Record<string, string> | null = null;
  let customerEmail: string | null = null;
  let reference: string | null = null;

  if (session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      // N'affiche le récap que si le paiement a bien été effectué
      if (session.payment_status === "paid") {
        meta = session.metadata as Record<string, string>;
        customerEmail = session.customer_email;
        reference = session_id.slice(-8).toUpperCase();
      }
    } catch {}
  }

  const adults       = parseInt(meta?.adults ?? "0");
  const children     = parseInt(meta?.children ?? "0");
  const totalPrice   = parseFloat(meta?.totalPrice ?? "0");
  const depositAmount = parseFloat(meta?.depositAmount ?? "0");
  const isDeposit    = meta?.paymentType === "deposit";
  const remaining    = totalPrice - depositAmount;
  const infants      = parseInt(meta?.infants ?? "0");
  const isEn         = locale === "en";
  const paxLabel     = isEn
    ? `${adults} adult${adults > 1 ? "s" : ""}${children > 0 ? ` + ${children} child${children > 1 ? "ren" : ""}` : ""}${infants > 0 ? ` + ${infants} bab${infants > 1 ? "ies" : "y"}` : ""}`
    : `${adults} adulte${adults > 1 ? "s" : ""}${children > 0 ? ` + ${children} enfant${children > 1 ? "s" : ""}` : ""}${infants > 0 ? ` + ${infants} bébé${infants > 1 ? "s" : ""}` : ""}`;

  return (
    <section className="min-h-screen pt-32 pb-16 bg-white flex items-center">
      {/* Paiement terminé : on efface le brouillon de réservation sauvegardé */}
      <script dangerouslySetInnerHTML={{ __html: `try{sessionStorage.removeItem("tikiboat-booking")}catch(e){}` }} />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <CheckCircle2 className="text-green-400" size={48} />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-tiki-gold mb-4">
          {t("confTitle")}
        </h1>
        <p className="text-slate-800 text-xl mb-8">
          {t("confSubtitle")}
        </p>

        {/* Récapitulatif réservation */}
        {meta && (
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8 text-left">
            {/* Header */}
            <div className="bg-tiki-ocean px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
                  {t("confYourBooking")}{reference ? ` · ${t("confRef")} ${reference}` : ""}
                </p>
                <p className="text-white font-bold text-lg leading-tight">{meta.excursionTitle}</p>
              </div>
              <div className="bg-amber-400/20 border border-amber-400/40 rounded-full px-3 py-1">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wide">{t("confPending")}</span>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-5 space-y-0">
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <CalendarDays size={16} className="text-tiki-gold shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">{t("confDate")}</span>
                <span className="font-semibold text-slate-800 text-sm capitalize ml-auto">{formatDate(meta.date, dateLocale)}</span>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <Users size={16} className="text-tiki-gold shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">{t("confPassengers")}</span>
                <span className="font-semibold text-slate-800 text-sm ml-auto">{paxLabel}</span>
              </div>
              {customerEmail && (
                <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                  <Mail size={16} className="text-tiki-gold shrink-0" />
                  <span className="text-slate-500 text-sm w-28 shrink-0">{t("confEmail")}</span>
                  <span className="font-semibold text-slate-800 text-sm ml-auto">{maskEmail(customerEmail)}</span>
                </div>
              )}
              <div className="flex items-center gap-3 py-3 border-b border-slate-100">
                <CreditCard size={16} className="text-tiki-gold shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">{t("confTotal")}</span>
                <span className="font-bold text-slate-800 text-sm ml-auto">{totalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex items-center gap-3 py-3">
                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                <span className="text-slate-500 text-sm w-28 shrink-0">{isDeposit ? t("confDepositPaid") : t("confPaid")}</span>
                <span className="font-bold text-green-600 ml-auto">{isDeposit ? depositAmount.toFixed(2) : totalPrice.toFixed(2)} €</span>
              </div>
            </div>

            {/* Footer solde */}
            {isDeposit && (
              <div className="bg-amber-50 border-t border-amber-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-amber-800 font-semibold text-sm">{t("confBalance")}</p>
                  <p className="text-amber-600 text-xs mt-0.5">{t("confBalanceSub")}</p>
                </div>
                <span className="text-amber-800 font-bold text-xl">{remaining.toFixed(2)} €</span>
              </div>
            )}
          </div>
        )}

        {/* What's next */}
        <div className="card-dark text-left mb-8">
          <h2 className="font-bold text-slate-800 text-lg mb-4">{t("confNext")}</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail className="text-tiki-gold shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-slate-800">{t("confEmailTitle")}</div>
                <div className="text-slate-500 text-sm">{t("confEmailSub")}</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="text-tiki-gold shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-slate-800">{t("confWhatsappTitle")}</div>
                <div className="text-slate-500 text-sm">{t("confWhatsappSub")}</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CalendarDays className="text-tiki-gold shrink-0 mt-0.5" size={20} />
              <div>
                <div className="font-medium text-slate-800">{t("confDayTitle")}</div>
                <div className="text-slate-500 text-sm">{t("confDaySub")}</div>
              </div>
            </li>
          </ul>
        </div>


        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            <Home size={18} />
            {t("confHome")}
          </Link>
          <a
            href="https://wa.me/590690495848"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            {t("confContact")}
          </a>
        </div>
      </div>
    </section>
  );
}
