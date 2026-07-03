"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayState {
  spotsLeft: number;
  isBlocked: boolean;
}

interface Props {
  excursionSlug: string;
  value: string;       // YYYY-MM-DD
  onChange: (date: string) => void;
  onSpotsChange?: (spotsLeft: number | null) => void;
}

function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function BookingCalendar({ excursionSlug, value, onChange, onSpotsChange }: Props) {
  const t = useTranslations("bookingCal");
  const locale = useLocale();
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";
  const DAYS = t("days").split(",");

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dates, setDates] = useState<Record<string, DayState>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    fetch(`/api/availability?slug=${excursionSlug}&month=${monthKey}`)
      .then((r) => {
        if (!r.ok) throw new Error("availability failed");
        return r.json();
      })
      .then((data) => setDates(data.dates || {}))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [excursionSlug, monthKey]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Construit la grille du mois
  const firstDay = new Date(year, month, 1).getDay(); // 0=dim
  const offset   = firstDay === 0 ? 6 : firstDay - 1; // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Complète pour avoir des lignes entières
  while (cells.length % 7 !== 0) cells.push(null);

  // Bloque aujourd'hui et le passé — demain est le minimum réservable
  // Utilise l'heure locale du navigateur (pas Guadeloupe) pour que "aujourd'hui"
  // soit toujours le bon jour depuis la perspective du client
  const isPast = (d: number) => {
    const local = new Date();
    const tomorrow = new Date(local.getFullYear(), local.getMonth(), local.getDate() + 1);
    return new Date(year, month, d) < tomorrow;
  };

  const isFull = (d: number) => {
    const ymd = toYMD(year, month, d);
    const info = dates[ymd];
    return info ? (info.isBlocked || info.spotsLeft === 0) : false;
  };

  const monthLabel = new Date(year, month).toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 select-none">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={year === today.getFullYear() && month <= today.getMonth()}
          className="w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-tiki-gold hover:text-tiki-gold transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-slate-800 font-bold text-sm capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-tiki-gold hover:text-tiki-gold transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-slate-400 text-xs font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Erreur de chargement des dispos */}
      {loadError && (
        <div className="mb-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
          {t("loadError")}
        </div>
      )}

      {/* Grille des jours — non cliquable tant que les dispos ne sont pas chargées */}
      <div className={`grid grid-cols-7 gap-y-1 transition-opacity ${loading || loadError ? "opacity-40 pointer-events-none" : ""}`}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;

          const ymd     = toYMD(year, month, d);
          const past    = isPast(d);
          const full    = isFull(d);
          const selected = value === ymd;
          const disabled = past || full;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => { onChange(ymd); onSpotsChange?.(dates[ymd]?.spotsLeft ?? null); }}
              className={[
                "relative mx-auto w-11 h-11 rounded-full flex flex-col items-center justify-center text-sm font-medium transition-colors",
                selected
                  ? "bg-tiki-gold text-tiki-ocean font-black"
                  : past
                  ? "text-slate-200 cursor-not-allowed"
                  : full
                  ? "bg-red-50 text-red-300 line-through cursor-not-allowed"
                  : "text-slate-700 hover:bg-tiki-gold/10 hover:text-tiki-gold cursor-pointer",
              ].join(" ")}
              title={full && !past ? t("full") : undefined}
            >
              {d}
              {full && !past && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full bg-tiki-gold" />
          {t("selected")}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <div className="w-3 h-3 rounded-full bg-red-200" />
          {t("full")}
        </div>
      </div>
    </div>
  );
}
