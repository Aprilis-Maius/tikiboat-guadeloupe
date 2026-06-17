"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Phone, Mail, Filter, Download, Plus, X, Save, Pencil, Trash2, MessageCircle, Copy, Check, Euro } from "lucide-react";
import { excursions } from "@/data/excursions";

interface Reservation {
  id: string; excursionId: string; excursionTitle: string; date: string;
  adults: number; children: number; infants: number;
  totalPrice: number; depositAmount: number; paymentType: string; status: string;
  isPaid: boolean; customerName: string; customerEmail: string;
  customerPhone: string; notes?: string; createdAt: string; source?: string;
}

const toDay = (d: string) => d.split("T")[0];

const emptyCreate = () => ({
  excursionSlug: excursions[0]?.slug ?? "",
  date: new Date().toISOString().split("T")[0],
  adults: 2, children: 0, infants: 0,
  customerName: "", customerEmail: "", customerPhone: "",
  paymentType: "none" as "full" | "deposit" | "none",
  isPaid: false, status: "confirmed", notes: "",
  customPrice: 0,
});

const inputCls = "w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors text-sm";
const labelCls = "block text-slate-500 text-xs font-semibold mb-1.5";

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  confirmed: { label: "Confirmé",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500" },
  pending:   { label: "En attente", cls: "bg-amber-50 text-amber-700 border-amber-200",        dot: "bg-amber-500"   },
  cancelled: { label: "Annulé",     cls: "bg-red-50 text-red-600 border-red-200",              dot: "bg-red-500"     },
};

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate());
  const [creating, setCreating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<{
    date: string; adults: number; children: number; infants: number;
    customerName: string; customerEmail: string; customerPhone: string;
    notes: string; status: string; isPaid: boolean; paymentType: string;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [dayConfirming, setDayConfirming] = useState<string | null>(null);

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const selectedExc = excursions.find(e => e.slug === createForm.excursionSlug);
  const isPrivatisation = !!selectedExc?.pricePrivate;
  const calcTotal = () => isPrivatisation
    ? createForm.customPrice
    : selectedExc
      ? createForm.adults * selectedExc.priceAdult + createForm.children * selectedExc.priceChild
      : 0;

  const MAX_PASSENGERS = 12;

  const privatisationSlugs = useMemo(() => new Set(excursions.filter(e => e.pricePrivate).map(e => e.slug)), []);

  const capacityCheck = useMemo(() => {
    if (!createForm.date || !createForm.excursionSlug) return null;
    // Normalise dates : DB renvoie "2026-06-17T00:00:00.000Z", le form envoie "2026-06-17"
    const dateResas = reservations.filter(r => toDay(r.date) === toDay(createForm.date) && r.status !== "cancelled");

    const hasPrivatisationBooked = dateResas.some(r => privatisationSlugs.has(r.excursionId));

    // Privatisation sélectionnée → bloquer si d'autres réservations existent ce jour
    if (isPrivatisation) {
      // Bloquer si n'importe quelle réservation existe ce jour (y compris une autre privatisation)
      return {
        bookedSpots: 0, remaining: MAX_PASSENGERS, wouldExceed: false, newSpots: 0,
        conflictExc: null,
        privatisationConflict: dateResas.length > 0 ? `${dateResas.length} réservation${dateResas.length > 1 ? "s" : ""}` : null,
        hasPrivatisationBooked: false,
      };
    }

    // Excursion normale → bloquer si privatisation déjà réservée ce jour
    if (hasPrivatisationBooked) {
      return {
        bookedSpots: MAX_PASSENGERS, remaining: 0, wouldExceed: true, newSpots: 0,
        conflictExc: "Privatisation du Bateau",
        privatisationConflict: null, hasPrivatisationBooked: true,
      };
    }

    const sameTitle = selectedExc?.title ?? "";
    const sameExcResas = dateResas.filter(r => r.excursionTitle === sameTitle);
    const bookedSpots = sameExcResas.reduce((s, r) => s + r.adults + r.children, 0);
    const newSpots = createForm.adults + createForm.children;
    const remaining = MAX_PASSENGERS - bookedSpots;
    const wouldExceed = bookedSpots + newSpots > MAX_PASSENGERS;
    const otherResa = dateResas.find(r => r.excursionTitle !== sameTitle);
    return {
      bookedSpots, remaining, wouldExceed, newSpots,
      conflictExc: otherResa?.excursionTitle ?? null,
      privatisationConflict: null, hasPrivatisationBooked: false,
    };
  }, [createForm.date, createForm.excursionSlug, createForm.adults, createForm.children, reservations, selectedExc, isPrivatisation, privatisationSlugs]);

  const submitCreate = async () => {
    setCreating(true);
    const total = calcTotal();
    await fetch("/api/admin/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...createForm,
        excursionId:    selectedExc?.slug ?? "",
        excursionTitle: selectedExc?.title ?? "",
        totalPrice:     total,
        depositAmount:  Math.round(total * 0.3 * 100) / 100,
        blocksDay:      isPrivatisation,
      }),
    });
    await fetchReservations();
    setShowCreate(false);
    setCreateForm(emptyCreate());
    setCreating(false);
  };

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    const url = filter === "all" ? "/api/admin/reservations" : `/api/admin/reservations?status=${filter}`;
    const res = await fetch(url);
    setReservations(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => { if (session) fetchReservations(); }, [session, fetchReservations]);

  const updateStatus = async (id: string, newStatus: string) => {
    setSaving(true);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await fetchReservations();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    setSaving(false);
  };

  const openEdit = () => {
    if (!selected) return;
    setEditForm({
      date: selected.date, adults: selected.adults, children: selected.children,
      infants: selected.infants ?? 0, customerName: selected.customerName,
      customerEmail: selected.customerEmail, customerPhone: selected.customerPhone,
      notes: selected.notes ?? "", status: selected.status,
      isPaid: selected.isPaid, paymentType: selected.paymentType,
    });
    setEditMode(true);
  };

  const deleteReservation = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/admin/reservations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id }),
    });
    setSelected(null);
    setConfirmDelete(false);
    await fetchReservations();
    setSaving(false);
  };

  const submitEdit = async () => {
    if (!selected || !editForm) return;
    setSaving(true);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, ...editForm }),
    });
    await fetchReservations();
    if (selected) setSelected(prev => prev ? { ...prev, ...editForm } : null);
    setEditMode(false);
    setEditForm(null);
    setSaving(false);
  };

  const markPayment = async (id: string, paymentType: string, isPaid: boolean) => {
    setSaving(true);
    await fetch("/api/admin/reservations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, paymentType, isPaid }),
    });
    await fetchReservations();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, paymentType, isPaid } : null);
    setSaving(false);
  };

  const exportCSV = () => {
    const headers = ["Nom","Email","Téléphone","Excursion","Date","Adultes","Enfants","Total","Statut","Payé"];
    const rows = reservations.map(r => [
      r.customerName, r.customerEmail, r.customerPhone, r.excursionTitle,
      r.date, r.adults, r.children, r.totalPrice,
      r.status, r.isPaid ? "Oui" : "Non",
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "reservations.csv"; a.click();
  };

  const confirmDay = async (pendingItems: Reservation[]) => {
    if (pendingItems.length === 0) return;
    const date = pendingItems[0].date;
    const names = pendingItems.map(r => r.customerName).join(", ");
    if (!window.confirm(`Confirmer ${pendingItems.length} réservation${pendingItems.length > 1 ? "s" : ""} du ${new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} ?\n\n${names}\n\nUn email de confirmation sera envoyé à chaque client.`)) return;
    setDayConfirming(date);
    await Promise.all(pendingItems.map(r =>
      fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, status: "confirmed", action: "confirm" }),
      })
    ));
    await fetchReservations();
    setDayConfirming(null);
  };

  const closeModal = () => { setSelected(null); setEditMode(false); setEditForm(null); setConfirmDelete(false); };

  if (status === "loading" || !session) return (
    <div className="p-8 text-slate-400 text-sm">Chargement...</div>
  );

  const today = new Date(new Date().toDateString());

  const applyPaymentFilter = (r: Reservation) => {
    if (paymentFilter === "paid")    return r.isPaid && r.paymentType === "full";
    if (paymentFilter === "deposit") return r.paymentType === "deposit";
    if (paymentFilter === "unpaid")  return !r.isPaid && r.paymentType === "none";
    return true;
  };

  const filteredReservations = reservations.filter(applyPaymentFilter);

  const groupByDate = (resas: Reservation[]) => {
    const sorted = [...resas].sort((a, b) => a.date.localeCompare(b.date));
    const map = new Map<string, Reservation[]>();
    for (const r of sorted) { const g = map.get(r.date) ?? []; g.push(r); map.set(r.date, g); }
    return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
  };

  const upcoming = groupByDate(filteredReservations.filter(r => new Date(r.date) >= today));
  const past     = groupByDate(filteredReservations.filter(r => new Date(r.date) <  today));

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-2xl">Réservations</h1>
          <p className="text-slate-400 text-sm mt-0.5">{filteredReservations.length} résultat{filteredReservations.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setShowCreate(v => !v); setCreateForm(emptyCreate()); }}
            className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
            <Plus size={15} /> Nouvelle réservation
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Filter size={14} className="text-slate-400" />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="bg-transparent text-slate-700 text-sm outline-none cursor-pointer">
              <option value="all">Tous statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmés</option>
              <option value="cancelled">Annulés</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
            <Euro size={14} className="text-slate-400" />
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
              className="bg-transparent text-slate-700 text-sm outline-none cursor-pointer">
              <option value="all">Tous paiements</option>
              <option value="paid">Soldés</option>
              <option value="deposit">Acompte reçu</option>
              <option value="unpaid">Non payés</option>
            </select>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:border-tiki-lagon/40 rounded-xl px-4 py-2 text-slate-500 hover:text-tiki-lagon text-sm transition-colors">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Formulaire création */}
      {showCreate && (
        <div className="bg-white border border-tiki-lagon/30 shadow-sm rounded-2xl mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-sm">Nouvelle réservation (téléphone / physique)</h2>
            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Excursion *</label>
              <select value={createForm.excursionSlug}
                onChange={e => setCreateForm(p => ({ ...p, excursionSlug: e.target.value }))}
                className={inputCls}>
                {excursions.map(e => (
                  <option key={e.slug} value={e.slug}>{e.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Date *</label>
              <input type="date" value={createForm.date}
                onChange={e => setCreateForm(p => ({ ...p, date: e.target.value }))}
                className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([["Adultes", "adults"], ["Enfants", "children"], ["Bébés", "infants"]] as [string, keyof typeof createForm][]).map(([label, key]) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input type="number" min={key === "adults" ? 1 : 0} value={createForm[key] as number}
                    onChange={e => setCreateForm(p => ({ ...p, [key]: +e.target.value }))}
                    className={inputCls} />
                </div>
              ))}
            </div>
            <div>
              <label className={labelCls}>Nom complet *</label>
              <input value={createForm.customerName} placeholder="Jean Dupont"
                onChange={e => setCreateForm(p => ({ ...p, customerName: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={createForm.customerEmail} placeholder="jean@email.com"
                onChange={e => setCreateForm(p => ({ ...p, customerEmail: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Téléphone *</label>
              <input type="tel" value={createForm.customerPhone} placeholder="+590 690 00 00 00"
                onChange={e => setCreateForm(p => ({ ...p, customerPhone: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Paiement</label>
              <select value={createForm.paymentType}
                onChange={e => {
                  const val = e.target.value as "full" | "deposit" | "none";
                  setCreateForm(p => ({ ...p, paymentType: val, isPaid: val === "full" }));
                }}
                className={inputCls}>
                <option value="none">Aucun paiement encaissé</option>
                <option value="deposit">Acompte 30% reçu</option>
                <option value="full">Tout réglé</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{isPrivatisation ? "Prix privatisation (€) *" : "Total estimé"}</label>
              {isPrivatisation ? (
                <input type="number" min={0} value={createForm.customPrice}
                  onChange={e => setCreateForm(p => ({ ...p, customPrice: +e.target.value }))}
                  className={inputCls} placeholder="ex: 800" />
              ) : (
                <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-tiki-lagon font-bold text-sm">{calcTotal()} €</div>
              )}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelCls}>Notes internes</label>
              <textarea rows={2} value={createForm.notes} placeholder="Remarques, demandes spécifiques..."
                onChange={e => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                className={`${inputCls} resize-none`} />
            </div>
            {capacityCheck && (
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                {/* Privatisation : info ou conflit */}
                {isPrivatisation && !capacityCheck.privatisationConflict && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-tiki-lagon/10 border border-tiki-lagon/20 text-tiki-lagon text-sm">
                    <span>🚢</span>
                    <span><strong>Privatisation</strong> — le jour sera marqué complet sur le calendrier.</span>
                  </div>
                )}
                {isPrivatisation && capacityCheck.privatisationConflict && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <span>🚫</span>
                    <span><strong>Impossible :</strong> {capacityCheck.privatisationConflict} déjà prévue{Number(capacityCheck.privatisationConflict?.split(" ")[0]) > 1 ? "s" : ""} ce jour. Choisissez une autre date.</span>
                  </div>
                )}
                {/* Excursion normale : conflit privatisation */}
                {!isPrivatisation && capacityCheck.hasPrivatisationBooked && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <span>🚫</span>
                    <span><strong>Jour privatisé :</strong> le bateau est réservé en exclusivité ce jour-là.</span>
                  </div>
                )}
                {/* Conflit autre excursion */}
                {!isPrivatisation && capacityCheck.conflictExc && !capacityCheck.hasPrivatisationBooked && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    <span>⚠️</span>
                    <span><strong>Attention :</strong> une réservation <strong>{capacityCheck.conflictExc}</strong> est déjà prévue ce jour.</span>
                  </div>
                )}
                {/* Capacité dépassée */}
                {!isPrivatisation && capacityCheck.wouldExceed && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <span>🚫</span>
                    <span><strong>Capacité dépassée :</strong> {capacityCheck.bookedSpots} + {capacityCheck.newSpots} = {capacityCheck.bookedSpots + capacityCheck.newSpots} / {MAX_PASSENGERS} max.</span>
                  </div>
                )}
                {/* Places restantes */}
                {!isPrivatisation && !capacityCheck.wouldExceed && !capacityCheck.hasPrivatisationBooked && capacityCheck.bookedSpots > 0 && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                    <span>📊</span>
                    <span>{capacityCheck.bookedSpots} place{capacityCheck.bookedSpots > 1 ? "s" : ""} prises — <strong>{capacityCheck.remaining}</strong> restante{capacityCheck.remaining > 1 ? "s" : ""}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
            <button onClick={() => setShowCreate(false)}
              className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-sm transition-colors">
              Annuler
            </button>
            <button onClick={submitCreate} disabled={
              creating ||
              !createForm.customerName || !createForm.date || !createForm.customerEmail ||
              (isPrivatisation && !createForm.customPrice) ||
              (isPrivatisation && !!capacityCheck?.privatisationConflict) ||
              (!isPrivatisation && (!!capacityCheck?.wouldExceed || !!capacityCheck?.hasPrivatisationBooked))
            }
              className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:opacity-50">
              <Save size={15} /> {creating ? "Enregistrement..." : "Créer la réservation"}
            </button>
          </div>
        </div>
      )}

      {/* Liste réservations */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm shadow-sm">Chargement...</div>
      ) : reservations.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm shadow-sm">Aucune réservation trouvée</div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">À venir</span>
                <span className="text-xs bg-tiki-lagon/10 text-tiki-lagon border border-tiki-lagon/20 px-2 py-0.5 rounded-full font-bold">
                  {reservations.filter(r => new Date(r.date) >= today).length}
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {upcoming.map(({ date, items }, gi) => {
                  const active = items.filter(r => r.status !== "cancelled");
                  const pending = items.filter(r => r.status === "pending");
                  const total = active.reduce((s, r) => s + r.adults + r.children, 0);
                  const fillRate = total / MAX_PASSENGERS;
                  const fillColor = fillRate >= 1 ? "bg-red-400" : fillRate >= 0.7 ? "bg-amber-400" : "bg-emerald-400";
                  const countColor = fillRate >= 1 ? "text-red-500" : fillRate >= 0.7 ? "text-amber-500" : "text-slate-500";
                  const dateLabel = new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
                  const isConfirming = dayConfirming === date;
                  return (
                    <div key={date} className={gi > 0 ? "border-t border-slate-100" : ""}>
                      {/* Ligne date */}
                      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 gap-3">
                        <span className="font-bold text-slate-700 text-sm capitalize">{dateLabel}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          {pending.length > 0 ? (
                            <button
                              onClick={() => confirmDay(pending)}
                              disabled={isConfirming}
                              className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60">
                              <CheckCircle2 size={11} />
                              {isConfirming ? "Envoi..." : `${pending.length} en attente — Confirmer`}
                            </button>
                          ) : active.length > 0 && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <CheckCircle2 size={11} /> Confirmée
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${fillColor}`} style={{ width: `${Math.min(100, fillRate * 100)}%` }} />
                            </div>
                            <span className={`text-xs font-semibold tabular-nums ${countColor}`}>{total}/{MAX_PASSENGERS}</span>
                          </div>
                        </div>
                      </div>
                      {/* Réservations du jour */}
                      {items.map(r => {
                        const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
                        const pax = r.adults + r.children + (r.infants ?? 0);
                        return (
                          <button key={r.id} onClick={() => { setSelected(r); setEditMode(false); setConfirmDelete(false); }}
                            className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 border-b border-slate-100 last:border-0 transition-colors group">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-slate-800 text-sm">{r.customerName}</span>
                                <span className="text-slate-400 text-xs">{pax} pers.</span>
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5 truncate">{r.excursionTitle}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${s.cls}`}>{s.label}</span>
                              {r.isPaid
                                ? <span className="text-xs text-emerald-600 font-semibold w-16 text-right">Soldé</span>
                                : r.paymentType === "deposit"
                                ? <span className="text-xs text-amber-500 font-semibold w-16 text-right">Acompte</span>
                                : <span className="text-xs text-red-500 font-semibold w-16 text-right">À régler</span>}
                              <span className="text-slate-800 font-bold text-sm tabular-nums w-16 text-right">{r.totalPrice} €</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Passées</span>
                <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                  {reservations.filter(r => new Date(r.date) < today).length}
                </span>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm opacity-60">
                {past.map(({ date, items }, gi) => {
                  const dateLabel = new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
                  return (
                    <div key={date} className={gi > 0 ? "border-t border-slate-100" : ""}>
                      <div className="flex items-center px-5 py-2.5 bg-slate-50/80 border-b border-slate-100">
                        <span className="font-bold text-slate-500 text-xs uppercase tracking-wide capitalize">{dateLabel}</span>
                      </div>
                      {items.map(r => {
                        const s = STATUS_MAP[r.status] ?? STATUS_MAP.pending;
                        const pax = r.adults + r.children + (r.infants ?? 0);
                        return (
                          <button key={r.id} onClick={() => { setSelected(r); setEditMode(false); setConfirmDelete(false); }}
                            className="w-full text-left flex items-center gap-3 px-5 py-3 hover:bg-slate-50/80 border-b border-slate-100 last:border-0 transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="font-medium text-slate-600 text-sm">{r.customerName}</span>
                                <span className="text-slate-400 text-xs">{pax} pers.</span>
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5 truncate">{r.excursionTitle}</div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${s.cls}`}>{s.label}</span>
                              <span className="text-slate-500 font-semibold text-sm tabular-nums w-16 text-right">{r.totalPrice} €</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL DÉTAIL ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800 text-base">{selected.customerName}</h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {new Date(selected.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {editMode && editForm ? (
                /* ── ÉDITION ── */
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Nom complet *</label>
                    <input value={editForm.customerName} onChange={e => setEditForm(p => p ? { ...p, customerName: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input type="email" value={editForm.customerEmail} onChange={e => setEditForm(p => p ? { ...p, customerEmail: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Téléphone *</label>
                    <input type="tel" value={editForm.customerPhone} onChange={e => setEditForm(p => p ? { ...p, customerPhone: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date</label>
                    <input type="date" value={editForm.date} onChange={e => setEditForm(p => p ? { ...p, date: e.target.value } : p)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {([["Adultes", "adults"], ["Enfants", "children"], ["Bébés", "infants"]] as [string, keyof typeof editForm][]).map(([label, key]) => (
                      <div key={key}>
                        <label className={labelCls}>{label}</label>
                        <input type="number" min={0} value={editForm[key] as number}
                          onChange={e => setEditForm(p => p ? { ...p, [key]: +e.target.value } : p)} className={inputCls} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={labelCls}>Statut</label>
                    <select value={editForm.status} onChange={e => setEditForm(p => p ? { ...p, status: e.target.value } : p)} className={inputCls}>
                      <option value="confirmed">Confirmé</option>
                      <option value="pending">En attente</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Paiement</label>
                    <select value={editForm.paymentType} onChange={e => setEditForm(p => p ? { ...p, paymentType: e.target.value } : p)} className={inputCls}>
                      <option value="full">Total réglé</option>
                      <option value="deposit">Acompte 30%</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="editIsPaid" checked={editForm.isPaid}
                      onChange={e => setEditForm(p => p ? { ...p, isPaid: e.target.checked } : p)}
                      className="w-4 h-4 accent-tiki-lagon" />
                    <label htmlFor="editIsPaid" className="text-slate-600 text-sm cursor-pointer">Déjà encaissé</label>
                  </div>
                  <div>
                    <label className={labelCls}>Notes internes</label>
                    <textarea rows={2} value={editForm.notes} onChange={e => setEditForm(p => p ? { ...p, notes: e.target.value } : p)}
                      className={`${inputCls} resize-none`} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={submitEdit} disabled={saving || !editForm.customerName || !editForm.customerEmail}
                      className="flex-1 flex items-center justify-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50 transition-colors">
                      <Save size={14} /> {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button onClick={() => { setEditMode(false); setEditForm(null); }}
                      className="px-4 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-sm transition-colors">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                /* ── LECTURE ── */
                <div>
                  {/* Contact */}
                  <div className="flex gap-3 mb-5">
                    <a href={`tel:${selected.customerPhone}`}
                      className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm hover:border-tiki-lagon/40 transition-colors">
                      <Phone size={14} className="text-tiki-lagon" /> {selected.customerPhone}
                    </a>
                    <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 text-sm min-w-0">
                      <Mail size={14} className="text-tiki-lagon shrink-0" />
                      <span className="truncate flex-1">{selected.customerEmail}</span>
                      <button onClick={() => copyEmail(selected.customerEmail)}
                        className="shrink-0 text-slate-400 hover:text-tiki-lagon transition-colors"
                        title="Copier l'email">
                        {copiedEmail ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200 mb-5">
                    {([
                      ["Excursion", selected.excursionTitle],
                      ["Date", new Date(selected.date).toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long" })],
                      ["Adultes", selected.adults],
                      ["Enfants", selected.children],
                      ["Total", `${selected.totalPrice} €`],
                      ["Acompte versé", `${selected.depositAmount} €`],
                      ["Paiement", selected.paymentType === "deposit" ? "Acompte 30%" : "Total réglé"],
                      ["Réservé le", new Date(selected.createdAt).toLocaleDateString("fr-FR")],
                    ] as [string, string | number][]).map(([l, v]) => (
                      <div key={l} className="flex justify-between items-center px-4 py-2.5">
                        <span className="text-slate-500 text-sm">{l}</span>
                        <span className="text-slate-800 font-medium text-sm text-right">{String(v)}</span>
                      </div>
                    ))}
                    {selected.paymentType === "deposit" && !selected.isPaid && (
                      <div className="flex justify-between items-center px-4 py-2.5 bg-amber-50">
                        <span className="text-amber-700 font-medium text-sm">Solde à encaisser</span>
                        <span className="text-amber-700 font-black text-sm">{(selected.totalPrice - selected.depositAmount).toFixed(2)} €</span>
                      </div>
                    )}
                  </div>

                  {selected.notes && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-xs mb-5">
                      <div className="text-slate-400 text-xs mb-1 font-semibold uppercase tracking-wide">Notes</div>
                      {selected.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: "confirmed", label: "Confirmer",   cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
                        { val: "pending",   label: "En attente",  cls: "bg-amber-500 hover:bg-amber-600 text-white" },
                        { val: "cancelled", label: "Annuler",     cls: "bg-red-600 hover:bg-red-700 text-white" },
                      ].map(({ val, label, cls }) => (
                        <button key={val} disabled={saving || selected.status === val}
                          onClick={() => updateStatus(selected.id, val)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-40 ${selected.status === val ? "opacity-40 cursor-default " : ""}${cls}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {/* Statut paiement */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[
                        { label: "Aucun paiement", type: "none",    paid: false },
                        { label: "Acompte reçu",   type: "deposit", paid: false },
                        { label: "Soldé total",     type: "full",    paid: true  },
                      ].map(({ label, type, paid }) => {
                        const active = selected.paymentType === type && selected.isPaid === paid;
                        return (
                          <button key={type} disabled={saving || active}
                            onClick={() => markPayment(selected.id, type, paid)}
                            className={`py-2.5 rounded-xl text-xs font-medium border transition-colors disabled:cursor-default ${
                              active
                                ? type === "full"    ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-bold"
                                : type === "deposit" ? "bg-amber-50 border-amber-300 text-amber-700 font-bold"
                                :                     "bg-slate-100 border-slate-300 text-slate-600 font-bold"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={openEdit}
                        className="py-2.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors">
                        <Pencil size={12} /> Modifier
                      </button>
                      <a href={`https://wa.me/${selected.customerPhone.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="py-2.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors">
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    </div>

                    {!confirmDelete ? (
                      <button onClick={() => setConfirmDelete(true)}
                        className="w-full py-2.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-600 hover:bg-red-50 border border-red-100 hover:border-red-200 transition-all flex items-center justify-center gap-1.5">
                        <Trash2 size={12} /> Supprimer la réservation
                      </button>
                    ) : (
                      <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                        <p className="text-red-700 text-sm font-medium">Supprimer la réservation de <strong>{selected.customerName}</strong> ?</p>
                        <p className="text-red-400 text-xs">Cette action est irréversible.</p>
                        <div className="flex gap-2">
                          <button onClick={deleteReservation} disabled={saving}
                            className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-50">
                            {saving ? "..." : "Oui, supprimer"}
                          </button>
                          <button onClick={() => setConfirmDelete(false)}
                            className="flex-1 py-2 border border-slate-200 text-slate-600 hover:text-slate-800 rounded-lg text-sm transition-colors">
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
