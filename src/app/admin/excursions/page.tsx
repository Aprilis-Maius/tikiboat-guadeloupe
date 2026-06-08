"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp,
  GripVertical, Eye, EyeOff, Save, X
} from "lucide-react";

interface Excursion {
  id: string; slug: string; title: string; subtitle: string;
  description: string; duration: string; departureTime: string;
  returnTime: string; departurePoint: string; maxPassengers: number;
  priceAdult: number; priceChild: number; pricePrivate: number | null;
  included: string; notIncluded: string; highlights: string;
  images: string; youtubeId: string | null; badge: string | null;
  popular: boolean; isActive: boolean; sortOrder: number;
}

type FormData = Omit<Excursion, "id" | "slug"> & {
  includedArr: string[]; notIncludedArr: string[]; highlightsArr: string[]; imagesArr: string[];
};

const emptyForm = (): FormData => ({
  title: "", subtitle: "", description: "",
  duration: "Journée complète", departureTime: "08h00", returnTime: "17h00",
  departurePoint: "Marina de Pointe-à-Pitre / Le Gosier",
  maxPassengers: 12, priceAdult: 0, priceChild: 0, pricePrivate: null,
  included: "[]", notIncluded: "[]", highlights: "[]", images: "[]",
  youtubeId: "", badge: "", popular: false, isActive: true, sortOrder: 0,
  includedArr: [""], notIncludedArr: [""], highlightsArr: [""], imagesArr: [""],
});

const parseArr = (json: string): string[] => {
  try { return JSON.parse(json); } catch { return []; }
};

const inputCls = "w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors text-sm";
const labelCls = "block text-slate-500 text-xs font-semibold mb-1.5";

export default function ExcursionsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [excursions, setExcursions] = useState<Excursion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  const fetchExcursions = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/excursions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setExcursions(await res.json());
    } catch (err) {
      console.error("[fetchExcursions]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (session) fetchExcursions(); }, [session, fetchExcursions]);

  const openEdit = (exc: Excursion) => {
    setForm({
      ...exc,
      includedArr:    parseArr(exc.included),
      notIncludedArr: parseArr(exc.notIncluded),
      highlightsArr:  parseArr(exc.highlights),
      imagesArr:      parseArr(exc.images),
    });
    setEditId(exc.id);
  };

  const openNew = () => {
    setForm(emptyForm());
    setEditId("new");
  };

  const closeEdit = () => { setEditId(null); setForm(emptyForm()); };

  const save = async () => {
    setSaving(true);
    const payload = {
      ...form,
      included:    JSON.stringify(form.includedArr.filter(Boolean)),
      notIncluded: JSON.stringify(form.notIncludedArr.filter(Boolean)),
      highlights:  JSON.stringify(form.highlightsArr.filter(Boolean)),
      images:      JSON.stringify(form.imagesArr.filter(Boolean)),
      youtubeId:   form.youtubeId || null,
      badge:       form.badge || null,
    };

    if (editId === "new") {
      await fetch("/api/admin/excursions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/excursions", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...payload }),
      });
    }
    await fetchExcursions();
    closeEdit();
    setSaving(false);
  };

  const toggleActive = async (exc: Excursion) => {
    await fetch("/api/admin/excursions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: exc.id, isActive: !exc.isActive }),
    });
    fetchExcursions();
  };

  const deleteExc = async (exc: Excursion) => {
    if (!confirm(`Supprimer "${exc.title}" ? Cette action est irréversible.`)) return;
    await fetch("/api/admin/excursions", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: exc.id }),
    });
    fetchExcursions();
  };

  /* Helper pour les listes (inclus, points forts, etc.) */
  const ArrayField = ({
    label, arr, onChange,
  }: { label: string; arr: string[]; onChange: (a: string[]) => void }) => (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className={labelCls}>{label}</label>
        <button type="button" onClick={() => onChange([...arr, ""])}
          className="text-xs text-tiki-lagon hover:underline">+ Ajouter</button>
      </div>
      <div className="space-y-1.5">
        {arr.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input value={v} onChange={e => { const n = [...arr]; n[i] = e.target.value; onChange(n); }}
              className={inputCls} placeholder={`Ligne ${i + 1}`} />
            <button type="button" onClick={() => onChange(arr.filter((_, j) => j !== i))}
              className="text-slate-300 hover:text-red-400 transition-colors shrink-0 px-1">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (status === "loading" || !session) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="p-7 lg:p-9">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-800 font-bold text-2xl tracking-tight">Excursions</h1>
          <p className="text-slate-400 text-sm mt-0.5">{excursions.length} excursion{excursions.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Nouvelle excursion
        </button>
      </div>

      {/* Formulaire (nouveau ou édition) */}
      {editId !== null && (
        <div className="bg-white border border-tiki-lagon/30 shadow-sm rounded-2xl mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-white text-sm">
              {editId === "new" ? "Nouvelle excursion" : `Modifier : ${form.title}`}
            </h2>
            <button onClick={closeEdit} className="text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Col 1 — Infos principales */}
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Titre *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className={inputCls} placeholder="Ex : Croisière journée" />
              </div>
              <div>
                <label className={labelCls}>Sous-titre</label>
                <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
                  className={inputCls} placeholder="Ex : Journée complète inoubliable" />
              </div>
              <div>
                <label className={labelCls}>Description *</label>
                <textarea value={form.description} rows={4}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={`${inputCls} resize-none`} placeholder="Description complète..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Durée</label>
                  <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className={inputCls} placeholder="Journée complète" />
                </div>
                <div>
                  <label className={labelCls}>Max passagers</label>
                  <input type="number" value={form.maxPassengers}
                    onChange={e => setForm(p => ({ ...p, maxPassengers: +e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Départ</label>
                  <input value={form.departureTime} onChange={e => setForm(p => ({ ...p, departureTime: e.target.value }))}
                    className={inputCls} placeholder="08h00" />
                </div>
                <div>
                  <label className={labelCls}>Retour</label>
                  <input value={form.returnTime} onChange={e => setForm(p => ({ ...p, returnTime: e.target.value }))}
                    className={inputCls} placeholder="17h00" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Point de départ</label>
                <input value={form.departurePoint} onChange={e => setForm(p => ({ ...p, departurePoint: e.target.value }))}
                  className={inputCls} placeholder="Marina de Pointe-à-Pitre / Le Gosier" />
              </div>

              {/* Tarifs */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Prix adulte (€)</label>
                  <input type="number" value={form.priceAdult}
                    onChange={e => setForm(p => ({ ...p, priceAdult: +e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Prix enfant (€)</label>
                  <input type="number" value={form.priceChild}
                    onChange={e => setForm(p => ({ ...p, priceChild: +e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Privatisation (€)</label>
                  <input type="number" value={form.pricePrivate ?? ""}
                    onChange={e => setForm(p => ({ ...p, pricePrivate: e.target.value ? +e.target.value : null }))}
                    className={inputCls} placeholder="Vide = non" />
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Badge</label>
                  <input value={form.badge ?? ""} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))}
                    className={inputCls} placeholder="Coup de cœur" />
                </div>
                <div>
                  <label className={labelCls}>ID YouTube</label>
                  <input value={form.youtubeId ?? ""} onChange={e => setForm(p => ({ ...p, youtubeId: e.target.value }))}
                    className={inputCls} placeholder="gNaCNE7808o" />
                </div>
              </div>
              <div className="flex gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.popular}
                    onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))}
                    className="w-4 h-4 rounded accent-tiki-lagon" />
                  <span className="text-slate-500 text-sm">Populaire</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-tiki-lagon" />
                  <span className="text-slate-500 text-sm">Visible sur le site</span>
                </label>
              </div>
            </div>

            {/* Col 2 — Listes */}
            <div className="space-y-4">
              <ArrayField label="Images (URLs)" arr={form.imagesArr}
                onChange={arr => setForm(p => ({ ...p, imagesArr: arr }))} />
              <ArrayField label="Points forts / Au programme" arr={form.highlightsArr}
                onChange={arr => setForm(p => ({ ...p, highlightsArr: arr }))} />
              <ArrayField label="Inclus dans le tarif" arr={form.includedArr}
                onChange={arr => setForm(p => ({ ...p, includedArr: arr }))} />
              <ArrayField label="Non inclus" arr={form.notIncludedArr}
                onChange={arr => setForm(p => ({ ...p, notIncludedArr: arr }))} />
            </div>
          </div>

          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
            <button onClick={closeEdit}
              className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:text-white rounded-xl text-sm transition-colors">
              Annuler
            </button>
            <button onClick={save} disabled={saving || !form.title}
              className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:opacity-50">
              <Save size={15} /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {/* Liste excursions */}
      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : excursions.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
          <p className="text-slate-300 text-sm mb-3">Aucune excursion</p>
          <button onClick={openNew} className="text-tiki-lagon text-sm hover:underline">Créer la première</button>
        </div>
      ) : (
        <div className="space-y-3">
          {excursions.map((exc) => (
            <div key={exc.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              {/* En-tête de la carte */}
              <div className="flex items-center gap-4 px-5 py-4">
                <GripVertical size={16} className="text-slate-300 cursor-grab shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{exc.title}</span>
                    {exc.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-tiki-lagon/10 text-tiki-lagon border border-tiki-lagon/20">
                        {exc.badge}
                      </span>
                    )}
                    {exc.popular && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-tiki-red/20 text-tiki-red-light border border-tiki-red/20">
                        Populaire
                      </span>
                    )}
                    {!exc.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">
                        Masqué
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    {exc.duration} · {exc.pricePrivate ? `Privatisation dès ${exc.pricePrivate} €` : `${exc.priceAdult} € adulte · ${exc.priceChild} € enfant`}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActive(exc)}
                    title={exc.isActive ? "Masquer" : "Afficher"}
                    className={`p-2 rounded-lg transition-colors ${exc.isActive ? "text-emerald-400 hover:bg-emerald-400/10" : "text-slate-300 hover:bg-slate-50"}`}>
                    {exc.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => openEdit(exc)}
                    className="p-2 rounded-lg text-slate-400 hover:text-tiki-lagon hover:bg-tiki-lagon/10 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => deleteExc(exc)}
                    className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  <button onClick={() => setExpandedId(expandedId === exc.id ? null : exc.id)}
                    className="p-2 rounded-lg text-slate-300 hover:text-slate-500 transition-colors">
                    {expandedId === exc.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>
              </div>

              {/* Détail expandable */}
              {expandedId === exc.id && (
                <div className="border-t border-slate-200 px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-slate-300 mb-1">Au programme</div>
                    <ul className="space-y-0.5">
                      {parseArr(exc.highlights).slice(0, 4).map((h, i) => (
                        <li key={i} className="text-slate-500 flex gap-1.5"><span className="text-tiki-lagon">·</span>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-slate-300 mb-1">Inclus</div>
                    <ul className="space-y-0.5">
                      {parseArr(exc.included).slice(0, 4).map((h, i) => (
                        <li key={i} className="text-slate-500 flex gap-1.5"><span className="text-emerald-400">✓</span>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-slate-300 mb-1">Images</div>
                    <div className="text-slate-400">{parseArr(exc.images).length} image{parseArr(exc.images).length !== 1 ? "s" : ""}</div>
                    {exc.youtubeId && <div className="text-slate-400 mt-1">YouTube : {exc.youtubeId}</div>}
                  </div>
                  <div>
                    <div className="text-slate-300 mb-1">Infos départ</div>
                    <div className="text-slate-500">{exc.departureTime} → {exc.returnTime}</div>
                    <div className="text-slate-400 mt-1">{exc.departurePoint}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
