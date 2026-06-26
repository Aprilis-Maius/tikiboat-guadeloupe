"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, ChevronLeft, Users, CalendarDays, CreditCard, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import BookingCalendar from "@/components/BookingCalendar";
import { excursions } from "@/data/excursions";
import { formatPrice, calculateTotal, calculateDeposit, getSeasonalPrices } from "@/lib/utils";

type Step = 1 | 2 | 3 | 4;

interface PassengerName {
  name: string;
  type: "adult" | "child" | "infant";
}

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
  passengerNames: PassengerName[];
  certificationAccepted: boolean;
}

const inputCls =
  "w-full bg-white border border-slate-200 focus:border-tiki-gold rounded-xl px-4 py-4 text-slate-800 placeholder-slate-400 outline-none transition-colors";

function buildPassengerNames(adults: number, children: number, infants: number, existing: PassengerName[]): PassengerName[] {
  const result: PassengerName[] = [];
  for (let i = 0; i < adults;   i++) result.push({ name: existing.find((p, idx) => p.type === "adult"   && idx === i)?.name   ?? "", type: "adult"   });
  for (let i = 0; i < children; i++) result.push({ name: existing.find((p, idx) => p.type === "child"   && idx === adults + i)?.name ?? "", type: "child"   });
  for (let i = 0; i < infants;  i++) result.push({ name: existing.find((p, idx) => p.type === "infant"  && idx === adults + children + i)?.name ?? "", type: "infant"  });
  return result;
}

function BookingFormInner() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
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
    passengerNames: [{ name: "", type: "adult" }, { name: "", type: "adult" }],
    certificationAccepted: false,
  });

  const excursion = excursions.find((e) => e.slug === data.excursionSlug);
  const { priceAdult: pAdult, priceChild: pChild, isHigh } = excursion && data.date
    ? getSeasonalPrices(data.date, excursion.priceAdult, excursion.priceChild, excursion.priceAdultHighSeason, excursion.priceChildHighSeason)
    : { priceAdult: excursion?.priceAdult ?? 0, priceChild: excursion?.priceChild ?? 0, isHigh: false };
  const total      = excursion ? calculateTotal(data.adults, data.children, pAdult, pChild) : 0;
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
    if (step === 3) {
      const hasInfo = !!data.customerName && !!data.customerEmail && !!data.customerPhone;
      const requiredNames = data.adults + data.children + data.infants;
      const filledNames = data.passengerNames.filter((p) => p.name.trim().length > 0).length;
      return hasInfo && filledNames >= requiredNames;
    }
    return false;
  };

  const goToStep3 = () => {
    // Synchronise les noms avec le nombre de passagers actuel
    setData((d) => ({
      ...d,
      passengerNames: buildPassengerNames(d.adults, d.children, d.infants, d.passengerNames),
    }));
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!excursion) return;
    if (!data.certificationAccepted) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          totalPrice: total,
          depositAmount: deposit,
          amountToPay,
          passengerNames: JSON.stringify(data.passengerNames),
        }),
      });
      if (res.status === 409) {
        const json = await res.json();
        setError(json.error ?? "Plus de places disponibles pour cette date.");
        if (json.spotsLeft !== undefined) setSpotsLeft(json.spotsLeft);
        setLoading(false);
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">

      {/* Barre de progression */}
      <div className="flex items-center mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0 ${
                step > s.num  ? "bg-tiki-gold text-tiki-ocean" :
                step === s.num ? "bg-tiki-red text-white" :
                "bg-slate-100 border border-slate-200 text-slate-400"
              }`}>
                {step > s.num ? <CheckCircle2 size={16} /> : s.num}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium leading-none ${step >= s.num ? "text-tiki-gold" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-1 mx-1.5 sm:mx-2 mb-4 transition-all ${step > s.num ? "bg-tiki-gold" : "bg-slate-200"}`} />
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
                    : "border-slate-200 hover:border-tiki-gold/40"
                }`}>
                <input type="radio" name="excursion" value={exc.slug}
                  checked={data.excursionSlug === exc.slug}
                  onChange={() => setData({ ...data, excursionSlug: exc.slug })}
                  className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  data.excursionSlug === exc.slug ? "border-tiki-gold" : "border-slate-300"
                }`}>
                  {data.excursionSlug === exc.slug && <div className="w-2.5 h-2.5 rounded-full bg-tiki-gold" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div>
                      <div className="font-bold text-slate-800 text-sm leading-tight">{exc.title}</div>
                      <div className="text-slate-400 text-xs mt-0.5">{exc.duration}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-tiki-gold font-bold text-sm">{formatPrice(exc.priceAdult)}</div>
                      <div className="text-slate-400 text-xs">/ adulte</div>
                    </div>
                  </div>
                </div>
              </label>
            ))}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-50 border border-slate-200">
              <Info size={16} className="text-tiki-gold shrink-0 mt-0.5" />
              <p className="text-slate-500 text-sm">
                Pour une <strong className="text-slate-800">privatisation</strong>,{" "}
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
              <label className="block text-slate-600 text-sm font-medium mb-3">
                <CalendarDays size={14} className="inline mr-1.5 text-tiki-gold" />
                Date de l&apos;excursion *
              </label>
              <BookingCalendar
                excursionSlug={data.excursionSlug}
                value={data.date}
                onChange={(date) => { setData({ ...data, date }); setError(null); }}
                onSpotsChange={(spots) => {
                  setSpotsLeft(spots);
                  if (spots !== null) {
                    setData(d => {
                      const tot = d.adults + d.children + d.infants;
                      if (tot <= spots) return d;
                      const newAdults = Math.max(1, Math.min(d.adults, spots));
                      const rem = spots - newAdults;
                      return { ...d, adults: newAdults, children: Math.min(d.children, rem), infants: Math.min(d.infants, Math.max(0, rem - Math.min(d.children, rem))) };
                    });
                  }
                }}
              />
              {data.date && (
                <p className="text-slate-500 text-xs mt-2">
                  {new Date(data.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {" · "}Départ {excursion.departureTime} · Retour {excursion.returnTime}
                </p>
              )}
            </div>

            {/* Passagers */}
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-3">
                <Users size={14} className="inline mr-1.5 text-tiki-gold" />
                Nombre de passagers
              </label>
              {(() => {
                const selected = data.adults + data.children + data.infants;
                const maxAvail = spotsLeft !== null ? Math.min(excursion.maxPassengers, spotsLeft) : excursion.maxPassengers;
                const remaining = maxAvail - selected;
                const canAdd = (d: BookingData) => d.adults + d.children + d.infants < maxAvail;
                const counters = [
                  { label: "Adultes",  sub: "13 ans et +",    count: data.adults,   min: 1, free: false,
                    onDec: () => setData((d) => ({ ...d, adults:   Math.max(1, d.adults - 1) })),
                    onInc: () => setData((d) => canAdd(d) ? { ...d, adults:   d.adults + 1 } : d),
                    price: formatPrice(pAdult) },
                  { label: "Enfants",  sub: "3–12 ans",        count: data.children, min: 0, free: false,
                    onDec: () => setData((d) => ({ ...d, children: Math.max(0, d.children - 1) })),
                    onInc: () => setData((d) => canAdd(d) ? { ...d, children: d.children + 1 } : d),
                    price: formatPrice(pChild) },
                  { label: "Bébés",    sub: "Moins de 3 ans",  count: data.infants,  min: 0, free: true,
                    onDec: () => setData((d) => ({ ...d, infants:  Math.max(0, d.infants - 1) })),
                    onInc: () => setData((d) => canAdd(d) ? { ...d, infants:  d.infants + 1 } : d),
                    price: "Gratuit" },
                ];
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      {counters.map((p) => (
                        <div key={p.label} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                          <div className="text-slate-800 font-medium text-sm mb-0.5">{p.label}</div>
                          <div className="text-slate-400 text-xs mb-3 leading-tight">{p.sub}</div>
                          <div className="flex items-center justify-center gap-2">
                            <button type="button" onClick={p.onDec}
                              className="w-10 h-10 rounded-full border border-slate-200 text-slate-700 hover:bg-tiki-red/10 hover:border-tiki-red/30 transition-colors font-bold text-lg flex items-center justify-center">
                              −
                            </button>
                            <span className="text-tiki-gold font-black text-2xl w-7 text-center tabular-nums">{p.count}</span>
                            <button type="button" onClick={p.onInc}
                              className="w-10 h-10 rounded-full border border-tiki-gold/40 text-tiki-gold hover:bg-tiki-gold/10 transition-colors font-bold text-lg flex items-center justify-center">
                              +
                            </button>
                          </div>
                          <div className={`text-xs mt-2 ${p.free ? "text-emerald-400" : "text-slate-400"}`}>
                            {p.free ? "Gratuit" : `${p.price} / pers.`}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-slate-400 text-xs mt-2 flex items-center gap-1.5">
                      <Info size={11} className="shrink-0" />
                      {spotsLeft !== null
                        ? `${excursion.maxPassengers - spotsLeft} / ${excursion.maxPassengers} passagers déjà — ${remaining} place${remaining !== 1 ? "s" : ""} restante${remaining !== 1 ? "s" : ""}`
                        : `${selected} passager${selected !== 1 ? "s" : ""} sélectionné${selected !== 1 ? "s" : ""}`}
                    </p>
                  </>
                );
              })()}
            </div>

            {/* Total */}
            {total > 0 && (
              <div className="bg-tiki-gold/10 border border-tiki-gold/25 rounded-xl p-4 space-y-1.5">
                {isHigh && (
                  <div className="text-amber-600 text-xs font-semibold mb-1">🌟 Haute saison (31 oct → 30 avr)</div>
                )}
                <div className="flex justify-between text-slate-600 text-sm">
                  <span>{data.adults} adulte{data.adults > 1 ? "s" : ""} × {formatPrice(pAdult)}</span>
                  <span>{formatPrice(data.adults * pAdult)}</span>
                </div>
                {data.children > 0 && (
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span>{data.children} enfant{data.children > 1 ? "s" : ""} × {formatPrice(pChild)}</span>
                    <span>{formatPrice(data.children * pChild)}</span>
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

            {/* Infos contact */}
            {[
              { label: "Nom complet *",          type: "text",  ph: "Jean Dupont",       key: "customerName"  },
              { label: "Email *",                type: "email", ph: "jean@email.com",     key: "customerEmail" },
              { label: "Téléphone (WhatsApp) *", type: "tel",   ph: "+590 690 00 00 00", key: "customerPhone" },
            ].map(({ label, type, ph, key }) => (
              <div key={key}>
                <label className="block text-slate-600 text-sm font-medium mb-1.5">{label}</label>
                <input type={type} placeholder={ph}
                  value={data[key as keyof BookingData] as string}
                  onChange={(e) => {
                    if (key === "customerName") {
                      const names = [...data.passengerNames];
                      if (names[0]) names[0] = { ...names[0], name: e.target.value };
                      setData({ ...data, customerName: e.target.value, passengerNames: names });
                    } else {
                      setData({ ...data, [key]: e.target.value });
                    }
                  }}
                  className={inputCls}
                />
              </div>
            ))}

            {/* Noms des passagers */}
            <div className="pt-2">
              <label className="block text-slate-600 text-sm font-medium mb-1">
                <Users size={14} className="inline mr-1.5 text-tiki-gold" />
                Noms de tous les passagers *
              </label>
              <p className="text-slate-400 text-xs mb-3">
                Requis par l&apos;équipage — liste des personnes à bord.
              </p>
              <div className="space-y-2">
                {data.passengerNames.map((p, i) => {
                  const typeLabel = p.type === "adult" ? "Adulte" : p.type === "child" ? "Enfant" : "Bébé";
                  const typeIdx = data.passengerNames.slice(0, i).filter(x => x.type === p.type).length + 1;
                  const isFirst = i === 0;
                  return (
                    <div key={i}>
                      <label className="block text-slate-400 text-xs mb-1">{typeLabel} {typeIdx}</label>
                      <input
                        type="text"
                        placeholder={`Prénom et nom — ${typeLabel.toLowerCase()} ${typeIdx}`}
                        value={p.name}
                        readOnly={isFirst}
                        onChange={(e) => {
                          if (isFirst) return;
                          const names = [...data.passengerNames];
                          names[i] = { ...names[i], name: e.target.value };
                          setData({ ...data, passengerNames: names });
                        }}
                        className={`${inputCls} ${isFirst ? "bg-slate-50 text-slate-400 cursor-default" : ""}`}
                      />
                      {isFirst && <p className="text-slate-400 text-[10px] mt-1">Rempli automatiquement depuis votre nom</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remarques */}
            <div>
              <label className="block text-slate-600 text-sm font-medium mb-1.5">Remarques particulières</label>
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
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5 space-y-2 text-sm">
            {[
              ["Excursion", excursion.title],
              ["Date", data.date ? new Date(data.date).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : "—"],
              ["Passagers", [
                `${data.adults} adulte${data.adults > 1 ? "s" : ""}`,
                data.children ? `${data.children} enfant${data.children > 1 ? "s" : ""}` : "",
                data.infants  ? `${data.infants} bébé${data.infants > 1 ? "s" : ""} (gratuit)` : "",
              ].filter(Boolean).join(" + ")],
              ["Nom réservation", data.customerName],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-2">
                <span className="text-slate-400">{l}</span>
                <span className="text-slate-800 text-right">{v}</span>
              </div>
            ))}
            {/* Passagers à bord */}
            {data.passengerNames.length > 0 && (
              <div className="border-t border-slate-100 pt-2 space-y-1">
                <div className="text-slate-400 text-xs font-medium uppercase tracking-wide">Passagers à bord</div>
                {data.passengerNames.map((p, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-slate-400 text-xs">{p.type === "adult" ? "Adulte" : p.type === "child" ? "Enfant" : "Bébé"}</span>
                    <span className="text-slate-700 text-xs font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between font-bold text-tiki-gold border-t border-slate-200 pt-2">
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
                  data.paymentType === val ? "border-tiki-gold bg-tiki-gold/10" : "border-slate-200 hover:border-tiki-gold/30"
                }`}>
                <input type="radio" name="payment" value={val}
                  checked={data.paymentType === val}
                  onChange={() => setData({ ...data, paymentType: val })}
                  className="sr-only" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  data.paymentType === val ? "border-tiki-gold" : "border-slate-300"
                }`}>
                  {data.paymentType === val && <div className="w-2.5 h-2.5 rounded-full bg-tiki-gold" />}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{title}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Certification santé — obligatoire */}
          <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all mb-5 ${
            data.certificationAccepted
              ? "border-tiki-gold bg-tiki-gold/8"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}>
            <input
              type="checkbox"
              checked={data.certificationAccepted}
              onChange={(e) => setData({ ...data, certificationAccepted: e.target.checked })}
              className="mt-0.5 w-5 h-5 accent-amber-500 shrink-0 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ShieldCheck size={14} className="text-tiki-gold shrink-0" />
                <span className="text-slate-700 text-sm font-semibold">Certification santé & sécurité <span className="text-red-500">*</span></span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Je certifie que tous les passagers sont en <strong className="text-slate-700">bonne santé</strong>{" "}et ne présentent aucune contre-indication médicale à la pratique d&apos;activités nautiques (problèmes cardiaques, épilepsie, grossesse avancée…). En cas d&apos;allergie alimentaire ou d&apos;intolérance, je m&apos;engage à en informer l&apos;équipage avant l&apos;embarquement.
              </p>
            </div>
          </label>

          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <CreditCard size={14} className="text-tiki-gold" />
            Paiement sécurisé · CB, Apple Pay, Google Pay
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <CheckCircle2 size={14} className="text-tiki-gold" />
            Confirmation immédiate par email
          </div>
        </div>
      )}

      {/* Erreur capacité */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <Info size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-5 border-t border-slate-200 gap-3">
        <button type="button"
          onClick={() => setStep((s) => (s - 1) as Step)}
          disabled={step === 1}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-colors font-medium text-sm py-3 px-4 min-h-[48px]">
          <ChevronLeft size={18} /> Retour
        </button>

        {step < 4 ? (
          <button type="button"
            onClick={() => step === 2 ? goToStep3() : setStep((s) => (s + 1) as Step)}
            disabled={!canGoNext()}
            className="flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px] text-sm">
            Continuer <ChevronRight size={18} />
          </button>
        ) : (
          <button type="button" onClick={handleSubmit}
            disabled={loading || !data.certificationAccepted}
            className="flex items-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-sm">
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
