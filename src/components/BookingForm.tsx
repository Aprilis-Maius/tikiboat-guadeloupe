"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Users, CalendarDays, CreditCard, CheckCircle2, Info } from "lucide-react";
import BookingCalendar from "@/components/BookingCalendar";
import { excursions } from "@/data/excursions";
import { formatPrice, calculateTotal, calculateDeposit } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface BookingData {
  excursionSlug: string;
  date: string;
  adults: number;
  children: number;
  infants: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentType: "deposit" | "full";
  notes: string;
}

const inputCls =
  "w-full bg-tiki-ocean border border-white/15 focus:border-tiki-gold rounded-xl px-4 py-4 text-white placeholder-white/30 outline-none transition-colors";

function BookingFormInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BookingData>({
    excursionSlug: searchParams.get("excursion") || "",
    date: "",
    adults: 2,
    children: 0,
    infants: 0,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    paymentType: "deposit",
    notes: "",
  });

  const excursion = excursions.find((e) => e.slug === data.excursionSlug);
  const total      = excursion ? calculateTotal(data.adults, data.children, excursion.priceAdult, excursion.priceChild) : 0;
  const deposit    = calculateDeposit(total);
  const amountToPay = data.paymentType === "deposit" ? deposit : total;

  const steps = [
    { num: 1, label: "Excursion" },
    { num: 2, label: "Date" },
    { num: 3, label: "Infos" },
    { num: 4, label: "Paiement" },
  ];

  const canGoNext = () => {
    if (step === 1) return !!data.excursionSlug;
    if (step === 2) return !!data.date && data.adults >= 1;
    if (step === 3) return !!data.customerName && !!data.customerEmail && !!data.customerPhone;
    return false;
  };

  const handleSubmit = async () => {
    if (!excursion) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, totalPrice: total, depositAmount: deposit, amountToPay }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="bg-tiki-ocean-mid rounded-2xl border border-white/10 p-5 sm:p-7">

      {/* Barre de progression */}
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
                step > s.num  ? "bg-tiki-gold text-tiki-ocean" :
                step === s.num ? "bg-tiki-red text-white" :
                "bg-tiki-ocean border border-white/20 text-white/40"
              }`}>
                {step > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium leading-none ${step >= s.num ? "text-tiki-gold" : "text-white/30"}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-1 mx-1.5 sm:mx-2 mb-4 transition-all ${step > s.num ? "bg-tiki-gold" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1 — Excursion ── */}
      {step === 1 && (
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-tiki-gold mb-5">Quelle excursion ?</h2>
          <div className="space-y-3">
            {excursions.filter((e) => !e.pricePrivate).map((exc) => (
              <label key={exc.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[64px] ${
                  data.excursionSlug === exc.slug
                    ? "border-tiki-gold bg-tiki-gold/10"
                    : "border-white/10 hover:border-tiki-gold/40"
                }`}>
                <input type="radio" name="excursion" value={exc.slug}
                  checked={data.excursionSlug === exc.slug}
                  onChange={() => setData({ ...data, excursionSlug: exc.slug })}
                  className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  data.excursionSlug === exc.slug ? "border-tiki-gold" : "border-white/30"
                }`}>
                  {data.excursionSlug === exc.slug && <div className="w-2.5 h-2.5 rounded-full bg-tiki-gold" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <div className="font-bold text-white text-sm leading-tight">{exc.title}</div>
                      <div className="text-white/40 text-xs mt-0.5">{exc.duration}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-tiki-gold font-bold text-sm">{formatPrice(exc.priceAdult)}</div>
                      <div className="text-white/35 text-xs">/ adulte</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
              <Info size={16} className="text-tiki-gold shrink-0 mt-0.5" />
              <p className="text-white/50 text-sm">
                Pour une <strong className="text-white">privatisation</strong>,{" "}
                <a href="/contact?type=privatisation" className="text-tiki-gold underline">contactez-nous</a> pour un devis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 — Date & passagers ── */}
      {step === 2 && excursion && (
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-tiki-gold mb-5">Date & passagers</h2>
          <div className="space-y-6">

            {/* Date */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-3">
                <CalendarDays size={14} className="inline mr-1.5 text-tiki-gold" />
                Date de l&apos;excursion *
              </label>
              <BookingCalendar
                excursionSlug={data.excursionSlug}
                value={data.date}
                onChange={(date) => setData({ ...data, date })}
              />
              {data.date && (
                <p className="text-white/50 text-xs mt-2">
                  {new Date(data.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {" · "}Départ {excursion.departureTime} — Retour {excursion.returnTime}
                </p>
              )}
            </div>

            {/* Passagers */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-3">
                <Users size={14} className="inline mr-1.5 text-tiki-gold" />
                Nombre de passagers
              </label>
              {(() => {
                const total = data.adults + data.children + data.infants;
                const remaining = excursion.maxPassengers - total;
                const counters = [
                  { label: "Adultes",  sub: "13 ans et +",    count: data.adults,   min: 1, free: false,
                    onDec: () => setData((d) => ({ ...d, adults:   Math.max(1, d.adults - 1) })),
                    onInc: () => setData((d) => ({ ...d, adults:   d.adults + d.children + d.infants < excursion.maxPassengers ? d.adults + 1 : d.adults })),
                    price: formatPrice(excursion.priceAdult) },
                  { label: "Enfants",  sub: "3–12 ans",        count: data.children, min: 0, free: false,
                    onDec: () => setData((d) => ({ ...d, children: Math.max(0, d.children - 1) })),
                    onInc: () => setData((d) => ({ ...d, children: d.adults + d.children + d.infants < excursion.maxPassengers ? d.children + 1 : d.children })),
                    price: formatPrice(excursion.priceChild) },
                  { label: "Bébés",    sub: "Moins de 3 ans",  count: data.infants,  min: 0, free: true,
                    onDec: () => setData((d) => ({ ...d, infants:  Math.max(0, d.infants - 1) })),
                    onInc: () => setData((d) => ({ ...d, infants:  d.adults + d.children + d.infants < excursion.maxPassengers ? d.infants + 1 : d.infants })),
                    price: "Gratuit" },
                ];
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {counters.map((p) => (
                        <div key={p.label} className="bg-tiki-ocean border border-white/10 rounded-xl p-3 text-center">
                          <div className="text-white font-medium text-sm mb-0.5">{p.label}</div>
                          <div className="text-white/35 text-xs mb-3 leading-tight">{p.sub}</div>
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" onClick={p.onDec}
                              className="w-10 h-10 rounded-full border border-white/20 text-white hover:bg-tiki-red/20 hover:border-tiki-red/40 transition-colors font-bold text-lg flex items-center justify-center">
                              −
                            </button>
                            <span className="text-tiki-gold font-black text-2xl w-7 text-center tabular-nums">{p.count}</span>
                            <button type="button" onClick={p.onInc}
                              className="w-10 h-10 rounded-full border border-tiki-gold/30 text-tiki-gold hover:bg-tiki-gold/20 transition-colors font-bold text-lg flex items-center justify-center">
                              +
                            </button>
                          </div>
                          <div className={`text-xs mt-2 ${p.free ? "text-emerald-400" : "text-white/40"}`}>
                            {p.free ? "Gratuit" : `${p.price} / pers.`}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/30 text-xs mt-2 flex items-center gap-1.5">
                      <Info size={11} className="shrink-0" />
                      {total} / {excursion.maxPassengers} passagers
                      {remaining === 0
                        ? " — complet"
                        : ` — ${remaining} place${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Total */}
            {total > 0 && (
              <div className="bg-tiki-gold/10 border border-tiki-gold/25 rounded-xl p-4 space-y-1.5">
                <div className="flex justify-between text-white/70 text-sm">
                  <span>{data.adults} adulte{data.adults > 1 ? "s" : ""} × {formatPrice(excursion.priceAdult)}</span>
                  <span>{formatPrice(data.adults * excursion.priceAdult)}</span>
                </div>
                {data.children > 0 && (
                  <div className="flex justify-between text-white/70 text-sm">
                    <span>{data.children} enfant{data.children > 1 ? "s" : ""} × {formatPrice(excursion.priceChild)}</span>
                    <span>{formatPrice(data.children * excursion.priceChild)}</span>
                  </div>
                )}
                {data.infants > 0 && (
                  <div className="flex justify-between text-emerald-400/80 text-sm">
                    <span>{data.infants} bébé{data.infants > 1 ? "s" : ""} (−3 ans)</span>
                    <span>Gratuit</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-tiki-gold border-t border-tiki-gold/20 pt-2">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3 — Informations client ── */}
      {step === 3 && (
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-tiki-gold mb-5">Vos informations</h2>
          <div className="space-y-4">
            {[
              { label: "Nom complet *",         type: "text",  ph: "Jean Dupont",          key: "customerName"  },
              { label: "Email *",               type: "email", ph: "jean@email.com",         key: "customerEmail" },
              { label: "Téléphone (WhatsApp) *", type: "tel",   ph: "+590 690 00 00 00",    key: "customerPhone" },
            ].map(({ label, type, ph, key }) => (
              <div key={key}>
                <label className="block text-white/70 text-sm font-medium mb-1.5">{label}</label>
                <input type={type} placeholder={ph}
                  value={data[key as keyof BookingData] as string}
                  onChange={(e) => setData({ ...data, [key]: e.target.value })}
                  className={inputCls}
                />
              </div>
            ))}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-1.5">Remarques particulières</label>
              <textarea placeholder="Allergie alimentaire, besoin spécifique..."
                value={data.notes}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                rows={3} className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 4 — Paiement ── */}
      {step === 4 && excursion && (
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-tiki-gold mb-5">Récapitulatif & Paiement</h2>

          {/* Récap */}
          <div className="bg-tiki-ocean border border-white/10 rounded-xl p-4 mb-5 space-y-2 text-sm">
            {[
              ["Excursion", excursion.title],
              ["Date", data.date ? new Date(data.date).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : "—"],
              ["Passagers", [
                `${data.adults} adulte${data.adults > 1 ? "s" : ""}`,
                data.children ? `${data.children} enfant${data.children > 1 ? "s" : ""}` : "",
                data.infants  ? `${data.infants} bébé${data.infants > 1 ? "s" : ""} (gratuit)` : "",
              ].filter(Boolean).join(" + ")],
              ["Nom", data.customerName],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-2">
                <span className="text-white/40">{l}</span>
                <span className="text-white text-right">{v}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-tiki-gold border-t border-white/10 pt-2">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>

          {/* Mode de paiement */}
          <div className="space-y-3 mb-5">
            {[
              { val: "deposit" as const,
                title: `Acompte 30% — ${formatPrice(deposit)}`,
                sub: `Solde de ${formatPrice(total - deposit)} à régler le jour J` },
              { val: "full" as const,
                title: `Paiement total — ${formatPrice(total)}`,
                sub: "Tout réglé maintenant, rien à payer le jour J" },
            ].map(({ val, title, sub }) => (
              <label key={val}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[64px] ${
                  data.paymentType === val ? "border-tiki-gold bg-tiki-gold/10" : "border-white/10 hover:border-tiki-gold/30"
                }`}>
                <input type="radio" name="payment" value={val}
                  checked={data.paymentType === val}
                  onChange={() => setData({ ...data, paymentType: val })}
                  className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  data.paymentType === val ? "border-tiki-gold" : "border-white/30"
                }`}>
                  {data.paymentType === val && <div className="w-2.5 h-2.5 rounded-full bg-tiki-gold" />}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{title}</div>
                  <div className="text-white/40 text-xs mt-0.5">{sub}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center gap-2 text-white/35 text-xs mb-1">
            <CreditCard size={14} className="text-tiki-gold" />
            Paiement sécurisé — CB, Apple Pay, Google Pay
          </div>
          <div className="flex items-center gap-2 text-white/35 text-xs">
            <CheckCircle2 size={14} className="text-tiki-gold" />
            Confirmation immédiate par email
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-5 border-t border-white/10 gap-3">
        <button type="button"
          onClick={() => setStep((s) => (s - 1) as Step)}
          disabled={step === 1}
          className="flex items-center gap-1.5 text-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors font-medium text-sm py-3 px-4 min-h-[48px]">
          <ChevronLeft size={18} /> Retour
        </button>

        {step < 4 ? (
          <button type="button"
            onClick={() => setStep((s) => (s + 1) as Step)}
            disabled={!canGoNext()}
            className="flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] text-sm">
            Continuer <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 min-h-[48px] text-sm">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirection...
              </>
            ) : (
              <><CreditCard size={16} /> Procéder au paiement</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-tiki-ocean-mid" />}>
      <BookingFormInner />
    </Suspense>
  );
}
