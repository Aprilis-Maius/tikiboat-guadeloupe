"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, Unlock, Users } from "lucide-react";

interface Availability {
  id: string; date: string; excursionId: string;
  maxSpots: number; bookedSpots: number;
  isBlocked: boolean; blockReason?: string;
}

interface Reservation {
  id: string; date: string; excursionTitle: string;
  customerName: string; adults: number; children: number; status: string;
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<{ date: string; maxSpots: number; bookedSpots: number; isBlocked: boolean; blockReason: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  const month = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const fetchData = useCallback(async () => {
    if (!session) return;
    const [availRes, resaRes] = await Promise.all([
      fetch(`/api/admin/availability?month=${month}`),
      fetch(`/api/admin/reservations`),
    ]);
    setAvailabilities(await availRes.json());
    const allResa = await resaRes.json();
    setReservations(allResa.filter((r: Reservation) => r.date.startsWith(month)));
  }, [session, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getDayData = (dateStr: string) => {
    const avail = availabilities.find(a => a.date === dateStr);
    const dayResas = reservations.filter(r => r.date === dateStr && r.status !== "cancelled");
    const booked = avail ? avail.bookedSpots : dayResas.reduce((s, r) => s + r.adults + (r as { children: number }).children, 0);
    const max = avail?.maxSpots ?? 12;
    return { avail, dayResas, booked, max, isBlocked: avail?.isBlocked ?? false };
  };

  const openEdit = (dateStr: string) => {
    const { avail, booked, max, isBlocked } = getDayData(dateStr);
    setEditingDay({ date: dateStr, maxSpots: max, bookedSpots: booked, isBlocked, blockReason: avail?.blockReason ?? "" });
  };

  const saveDay = async () => {
    if (!editingDay) return;
    setSaving(true);
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editingDay, excursionId: "1" }),
    });
    await fetchData();
    setSaving(false);
    setEditingDay(null);
  };

  // Build calendar grid
  const year = currentDate.getFullYear();
  const mon  = currentDate.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Mon=0
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

  const selectedDayResas = selectedDay ? getDayData(selectedDay).dayResas : [];

  if (status === "loading" || !session) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-white text-2xl">Calendrier</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gérez les disponibilités et créneaux</p>
        </div>
        {/* Légende */}
        <div className="flex gap-4 text-xs">
          {[
            { color: "bg-green-500/20 border-green-500/30", label: "Disponible" },
            { color: "bg-yellow-500/20 border-yellow-500/30", label: "Partiel" },
            { color: "bg-red-500/20 border-red-500/30", label: "Complet / Bloqué" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded border ${color}`} />
              <span className="text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Calendrier */}
        <div className="xl:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentDate(new Date(year, mon - 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-white hover:border-slate-300 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-white">{MONTHS_FR[mon]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, mon + 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-white hover:border-slate-300 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-slate-300 text-xs font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Grille */}
          <div className="grid grid-cols-7 gap-1">
            {Array(offset).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(mon + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const { booked, max, isBlocked, dayResas } = getDayData(dateStr);
              const isPast = dateStr < todayStr;
              const fillRate = max > 0 ? booked / max : 0;
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;

              let bg = "bg-white border-slate-200";
              if (isBlocked) bg = "bg-red-500/15 border-red-500/25";
              else if (booked >= max) bg = "bg-red-500/10 border-red-500/20";
              else if (fillRate >= 0.5) bg = "bg-yellow-500/10 border-yellow-500/20";
              else if (dayResas.length > 0) bg = "bg-green-500/10 border-green-500/20";

              return (
                <button key={dateStr}
                  onClick={() => {
                    if (!isPast) { openEdit(dateStr); }
                    setSelectedDay(dateStr === selectedDay ? null : dateStr);
                  }}
                  className={`relative aspect-square rounded-xl border text-sm font-medium transition-all ${bg} ${
                    isPast ? "opacity-30 cursor-default" : "hover:border-tiki-lagon/50 cursor-pointer"
                  } ${isToday ? "ring-2 ring-tiki-lagon/50" : ""} ${isSelected ? "ring-2 ring-white/40" : ""}`}>
                  <span className={isToday ? "text-tiki-lagon font-bold" : "text-slate-700"}>{day}</span>
                  {dayResas.length > 0 && (
                    <span className="absolute bottom-1 right-1 text-[9px] text-slate-500">{booked}/{max}</span>
                  )}
                  {isBlocked && (
                    <span className="absolute top-0.5 left-0.5">
                      <Lock size={8} className="text-red-400" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-slate-300 text-xs mt-3 text-center">Cliquez sur une date pour modifier ses disponibilités</p>
        </div>

        {/* Panneau droit */}
        <div className="space-y-4">
          {/* Édition d'une date */}
          {editingDay && (
            <div className="bg-white border border-tiki-lagon/30 shadow-sm rounded-2xl p-5">
              <h3 className="font-bold text-tiki-lagon mb-4 text-sm">
                Modifier — {new Date(editingDay.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 text-xs mb-1.5">Places maximum</label>
                  <input type="number" min={0} max={50} value={editingDay.maxSpots}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, maxSpots: +e.target.value } : null)}
                    className="w-full bg-tiki-ocean border border-slate-300 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-tiki-lagon" />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs mb-1.5">Places déjà prises (tél/perso)</label>
                  <input type="number" min={0} max={editingDay.maxSpots} value={editingDay.bookedSpots}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, bookedSpots: +e.target.value } : null)}
                    className="w-full bg-tiki-ocean border border-slate-300 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-tiki-lagon" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={editingDay.isBlocked}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, isBlocked: e.target.checked } : null)}
                    className="w-4 h-4 rounded accent-tiki-red" />
                  <span className="text-slate-600 text-sm">Bloquer cette date</span>
                </label>
                {editingDay.isBlocked && (
                  <div>
                    <label className="block text-slate-500 text-xs mb-1.5">Raison (optionnel)</label>
                    <input type="text" placeholder="Météo, maintenance..." value={editingDay.blockReason}
                      onChange={e => setEditingDay(prev => prev ? { ...prev, blockReason: e.target.value } : null)}
                      className="w-full bg-tiki-ocean border border-slate-300 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-tiki-lagon placeholder-slate-400" />
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button onClick={saveDay} disabled={saving}
                    className="flex-1 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                    {saving ? "..." : "Enregistrer"}
                  </button>
                  <button onClick={() => setEditingDay(null)}
                    className="px-4 border border-slate-300 text-slate-500 hover:text-white rounded-xl text-sm transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Détail jour sélectionné */}
          {selectedDay && !editingDay && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-sm">
                  {new Date(selectedDay).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
                </h3>
                <button onClick={() => openEdit(selectedDay)}
                  className="text-xs text-tiki-lagon hover:underline">Modifier</button>
              </div>

              {(() => {
                const { booked, max, isBlocked, dayResas } = getDayData(selectedDay);
                return (
                  <>
                    {isBlocked ? (
                      <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
                        <Lock size={14} /> Date bloquée
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="flex items-center gap-1"><Users size={11} /> Remplissage</span>
                          <span>{booked} / {max} places</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${
                            booked >= max ? "bg-red-500" : booked >= max * 0.7 ? "bg-yellow-500" : "bg-green-500"
                          }`} style={{ width: `${Math.min(100, (booked / max) * 100)}%` }} />
                        </div>
                      </div>
                    )}

                    {dayResas.length === 0 ? (
                      <p className="text-slate-300 text-xs">Aucune réservation</p>
                    ) : (
                      <div className="space-y-2">
                        {dayResas.map((r) => (
                          <div key={r.id} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                            <div className="text-slate-800 text-sm font-medium">{r.customerName}</div>
                            <div className="text-slate-400 text-xs">{r.adults + (r as { children: number }).children} pers. · {r.excursionTitle}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {!selectedDay && !editingDay && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-center">
              <p className="text-slate-300 text-sm">Cliquez sur une date pour voir le détail</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
