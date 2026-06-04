"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayState {
  spotsLeft: number;
  isBlocked: boolean;
}

interface Props {
  excursionSlug: string;
  value: string;       // YYYY-MM-DD
  onChange: (date: string) => void;
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function BookingCalendar({ excursionSlug, value, onChange }: Props) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [dates, setDates] = useState<Record<string, DayState>>({});
  const [loading, setLoading] = useState(false);

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/availability?slug=${excursionSlug}&month=${monthKey}`)
      .then((r) => r.json())
      .then((data) => setDates(data.dates || {}))
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

  const isPast = (d: number) => {
    const date = new Date(year, month, d);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < todayStart;
  };

  const isFull = (d: number) => {
    const ymd = toYMD(year, month, d);
    const info = dates[ymd];
    return info ? (info.isBlocked || info.spotsLeft === 0) : false;
  };

  const monthLabel = new Date(year, month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="bg-tiki-ocean border border-white/15 rounded-2xl p-4 select-none">
      {/* Header navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={year === today.getFullYear() && month <= today.getMonth()}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-tiki-gold hover:text-tiki-gold transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-white font-bold text-sm capitalize">{monthLabel}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-tiki-gold hover:text-tiki-gold transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-white/30 text-xs font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className={`grid grid-cols-7 gap-y-1 transition-opacity ${loading ? "opacity-40" : ""}`}>
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
              onClick={() => onChange(ymd)}
              className={[
                "relative mx-auto w-9 h-9 rounded-full flex flex-col items-center justify-center text-sm font-medium transition-all",
                selected
                  ? "bg-tiki-gold text-tiki-ocean font-black"
                  : full
                  ? "bg-red-900/40 text-red-400/60 cursor-not-allowed"
                  : past
                  ? "text-white/20 cursor-not-allowed"
                  : "text-white hover:bg-white/10 hover:text-tiki-gold cursor-pointer",
              ].join(" ")}
              title={full ? "Complet" : undefined}
            >
              {d}
              {full && !past && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-400/70" />
              )}
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/8">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <div className="w-3 h-3 rounded-full bg-tiki-gold" />
          Sélectionné
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <div className="w-3 h-3 rounded-full bg-red-900/60" />
          Complet
        </div>
      </div>
    </div>
  );
}
