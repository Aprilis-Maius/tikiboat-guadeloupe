"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, Users, Settings2, X, Phone, CheckCircle2 } from "lucide-react";

interface Availability {
  id: string; date: string; excursionId: string;
  maxSpots: number; bookedSpots: number;
  isBlocked: boolean; blockReason?: string;
}

interface Reservation {
  id: string; date: string; excursionTitle: string;
  customerName: string; customerEmail: string; customerPhone: string;
  adults: number; children: number; status: string;
  totalPrice: number; depositAmount: number; isPaid: boolean; paymentType: string;
}

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const inputCls = "w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors text-sm";

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingDay, setEditingDay] = useState<{ date: string; maxSpots: number; bookedSpots: number; isBlocked: boolean; blockReason: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  const year = currentDate.getFullYear();
  const mon  = currentDate.getMonth();
  const month = `${year}-${String(mon + 1).padStart(2, "0")}`;

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
    const booked = avail ? avail.bookedSpots : dayResas.reduce((s, r) => s + r.adults + r.children, 0);
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

  const confirmReservation = async (id: string) => {
    setConfirming(id);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "confirmed", action: "confirm" }),
    });
    await fetchData();
    setConfirming(null);
  };

  const firstDay = new Date(year, mon, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const todayStr = new Date().toISOString().split("T")[0];

  // Jours du mois qui ont des réservations, triés
  const daysWithResas = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(mon + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    return dateStr;
  })
    .filter(d => d >= todayStr)
    .map(d => ({ dateStr: d, ...getDayData(d) }))
    .filter(d => d.dayResas.length > 0 || d.isBlocked);

  if (status === "loading" || !session) return <div className="p-8 text-slate-400 text-sm">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-2xl">Calendrier</h1>
          <p className="text-slate-400 text-sm mt-0.5">Gérez les disponibilités et créneaux</p>
        </div>
        <div className="flex gap-4 text-xs">
          {[
            { color: "bg-emerald-500/20 border-emerald-500/30", label: "Disponible" },
            { color: "bg-amber-400/20 border-amber-400/30", label: "Partiel" },
            { color: "bg-red-400/20 border-red-400/30", label: "Complet / Bloqué" },
            { color: "bg-orange-300/20 border-orange-300/30", label: "En attente" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded border ${color}`} />
              <span className="text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">

        {/* ── CALENDRIER (2/3) ── */}
        <div className="xl:col-span-2 bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          {/* Navigation mois */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setCurrentDate(new Date(year, mon - 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-tiki-lagon hover:text-tiki-lagon transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-slate-800 text-base">{MONTHS_FR[mon]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, mon + 1, 1))}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-tiki-lagon hover:text-tiki-lagon transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-slate-400 text-xs font-semibold py-1">{d}</div>
            ))}
          </div>

          {/* Grille */}
          <div className="grid grid-cols-7 gap-1.5">
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
              if (isBlocked) bg = "bg-red-50 border-red-200";
              else if (booked >= max && booked > 0) bg = "bg-red-50 border-red-200";
              else if (fillRate >= 0.5) bg = "bg-amber-50 border-amber-200";
              else if (dayResas.length > 0) bg = "bg-emerald-50 border-emerald-200";

              return (
                <button key={dateStr}
                  onClick={() => {
                    if (!isPast) openEdit(dateStr);
                    setSelectedDay(dateStr === selectedDay ? null : dateStr);
                    setEditingDay(null);
                  }}
                  className={`relative aspect-square rounded-xl border text-sm font-medium transition-all flex flex-col items-center justify-center gap-0.5 ${bg} ${
                    isPast ? "opacity-25 cursor-default" : "hover:border-tiki-lagon/60 cursor-pointer"
                  } ${isSelected ? "ring-2 ring-tiki-lagon ring-offset-1" : ""} ${isToday && !isSelected ? "ring-2 ring-tiki-lagon/40" : ""}`}>
                  <span className={isToday ? "text-tiki-lagon font-bold" : "text-slate-700"}>{day}</span>
                  {dayResas.length > 0 && (
                    <span className={`text-[9px] font-bold ${
                      booked >= max ? "text-red-500" : fillRate >= 0.5 ? "text-amber-600" : "text-emerald-600"
                    }`}>{booked}/{max}</span>
                  )}
                  {isBlocked && <Lock size={8} className="text-red-400" />}
                </button>
              );
            })}
          </div>
          <p className="text-slate-300 text-[11px] mt-3 text-center">Cliquez sur une date pour voir ou modifier les disponibilités</p>
        </div>

        {/* ── PANNEAU DROIT (1/3) ── */}
        <div className="space-y-4">

          {/* Formulaire édition */}
          {editingDay && (
            <div className="bg-white border border-tiki-lagon/30 shadow-sm rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm">
                  {new Date(editingDay.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
                </h3>
                <button onClick={() => setEditingDay(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <label className="block text-slate-500 text-xs font-semibold mb-1.5">Places maximum</label>
                  <input type="number" min={0} max={50} value={editingDay.maxSpots}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, maxSpots: +e.target.value } : null)}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-slate-500 text-xs font-semibold mb-1.5">Places prises (tél/physique)</label>
                  <input type="number" min={0} max={editingDay.maxSpots} value={editingDay.bookedSpots}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, bookedSpots: +e.target.value } : null)}
                    className={inputCls} />
                </div>
                <label className="flex items-center gap-3 cursor-pointer py-1">
                  <input type="checkbox" checked={editingDay.isBlocked}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, isBlocked: e.target.checked } : null)}
                    className="w-4 h-4 rounded accent-red-500" />
                  <span className="text-slate-600 text-sm">Bloquer cette date</span>
                </label>
                {editingDay.isBlocked && (
                  <input type="text" placeholder="Raison (météo, maintenance…)" value={editingDay.blockReason}
                    onChange={e => setEditingDay(prev => prev ? { ...prev, blockReason: e.target.value } : null)}
                    className={inputCls} />
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={saveDay} disabled={saving}
                    className="flex-1 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                    {saving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button onClick={() => setEditingDay(null)}
                    className="px-4 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-sm transition-colors">
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Détail jour sélectionné */}
          {selectedDay && !editingDay && (() => {
            const { booked, max, isBlocked, dayResas } = getDayData(selectedDay);
            const fillRate = max > 0 ? booked / max : 0;

            return (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-sm capitalize">
                    {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })}
                  </h3>
                  <button onClick={() => openEdit(selectedDay)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-tiki-lagon border border-slate-200 hover:border-tiki-lagon/40 px-2.5 py-1 rounded-lg transition-colors">
                    <Settings2 size={12} /> Modifier
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Barre capacité */}
                  {!isBlocked ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Users size={12} /> Remplissage
                        </span>
                        <span className={`text-xs font-bold ${
                          booked >= max ? "text-red-500" : fillRate >= 0.7 ? "text-amber-600" : "text-emerald-600"
                        }`}>{booked} / {max} places</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${
                          booked >= max ? "bg-red-500" : fillRate >= 0.7 ? "bg-amber-500" : "bg-emerald-500"
                        }`} style={{ width: `${Math.min(100, fillRate * 100)}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <Lock size={14} /> Date bloquée
                    </div>
                  )}

                  {/* Cartes réservations */}
                  {dayResas.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-3">Aucune réservation ce jour</p>
                  ) : (
                    <div className="space-y-2.5">
                      {dayResas.map((r) => {
                        const pax = r.adults + r.children;
                        const paxDetail = [
                          r.adults > 0 ? `${r.adults} adulte${r.adults > 1 ? "s" : ""}` : null,
                          r.children > 0 ? `${r.children} enfant${r.children > 1 ? "s" : ""}` : null,
                        ].filter(Boolean).join(" + ");
                        const isPaid = r.isPaid;
                        const isDeposit = r.paymentType === "deposit" && !isPaid;
                        const remaining = r.totalPrice - r.depositAmount;

                        return (
                          <div key={r.id} className={`border rounded-xl overflow-hidden ${r.status === "pending" ? "border-orange-300" : "border-slate-200"}`}>
                            {/* Nom + excursion */}
                            <div className={`px-4 py-3 border-b ${r.status === "pending" ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"}`}>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-bold text-slate-800 text-sm">{r.customerName}</p>
                                  <p className="text-slate-400 text-xs mt-0.5">{r.excursionTitle}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="text-xs font-bold text-tiki-lagon bg-tiki-lagon/10 px-2 py-0.5 rounded-full">
                                    {pax} pers.
                                  </span>
                                  {r.status === "pending" && (
                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-100 border border-orange-300 px-1.5 py-0.5 rounded-full">
                                      ⏳ En attente
                                    </span>
                                  )}
                                  {r.status === "confirmed" && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                      ✓ Confirmée
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Détails */}
                            <div className="px-4 py-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 text-xs">Passagers</span>
                                <span className="text-slate-700 text-xs font-medium">{paxDetail}</span>
                              </div>

                              {r.customerPhone && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-400 text-xs">Téléphone</span>
                                  <a href={`tel:${r.customerPhone}`}
                                    className="flex items-center gap-1 text-tiki-lagon text-xs font-medium hover:underline">
                                    <Phone size={10} />
                                    {r.customerPhone}
                                  </a>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-1 border-t border-slate-100 mt-1">
                                <span className="text-slate-400 text-xs">Montant</span>
                                <div className="text-right">
                                  <span className="text-slate-800 text-xs font-bold">{r.totalPrice.toLocaleString("fr-FR")} €</span>
                                  {isPaid && (
                                    <span className="ml-2 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">Soldé</span>
                                  )}
                                  {isDeposit && (
                                    <span className="ml-2 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                                      Reste {remaining.toLocaleString("fr-FR")} €
                                    </span>
                                  )}
                                  {!isPaid && !isDeposit && (
                                    <span className="ml-2 text-[10px] font-semibold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">Non payé</span>
                                  )}
                                </div>
                              </div>

                              {/* Bouton confirmer si en attente */}
                              {r.status === "pending" && (
                                <button
                                  onClick={() => confirmReservation(r.id)}
                                  disabled={confirming === r.id}
                                  className="w-full mt-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                                >
                                  <CheckCircle2 size={13} />
                                  {confirming === r.id ? "Confirmation…" : "Confirmer la réservation"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Panel par défaut : prochaines sorties */}
          {!selectedDay && !editingDay && (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-700 text-sm">Sorties du mois</h3>
                <p className="text-slate-400 text-xs mt-0.5">{MONTHS_FR[mon]} {year}</p>
              </div>

              {daysWithResas.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-slate-400 text-sm">Aucune sortie prévue</p>
                  <p className="text-slate-300 text-xs mt-1">Cliquez sur une date pour ajouter</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {daysWithResas.map(({ dateStr, booked, max, isBlocked, dayResas: resas }) => {
                    const fillRate = max > 0 ? booked / max : 0;
                    const dotColor = isBlocked ? "bg-red-400" : booked >= max ? "bg-red-500" : fillRate >= 0.5 ? "bg-amber-500" : "bg-emerald-500";
                    const label = new Date(dateStr + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
                    // Excursion(s) du jour
                    const excTitles = [...new Set(resas.map(r => r.excursionTitle))].join(", ");

                    return (
                      <button key={dateStr} onClick={() => { setSelectedDay(dateStr); setEditingDay(null); }}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-700 text-sm capitalize">{label}</span>
                          {excTitles && !isBlocked && (
                            <p className="text-slate-400 text-xs mt-0.5 truncate">{excTitles}</p>
                          )}
                          {isBlocked && <p className="text-red-400 text-xs mt-0.5">Date bloquée</p>}
                        </div>
                        <span className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded-full ${
                          isBlocked ? "bg-red-50 text-red-500 border border-red-200" :
                          booked >= max ? "bg-red-50 text-red-500 border border-red-200" :
                          fillRate >= 0.5 ? "bg-amber-50 text-amber-600 border border-amber-200" :
                          "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        }`}>
                          {isBlocked ? "Bloqué" : `${booked}/${max}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
