"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2 } from "lucide-react";

const CONTENT_FIELDS = {
  "Textes du site": [
    { id: "hero.headline",   label: "Titre principal hero",    type: "text",     ph: "L'excursion en bateau qui change tout." },
    { id: "hero.subtitle",   label: "Sous-titre hero",         type: "text",     ph: "Snorkeling · Îlets · Repas créole..." },
    { id: "hero.pretitle",   label: "Pré-titre hero (petite caps)", type: "text", ph: "Guadeloupe · Grand Cul de Sac Marin" },
    { id: "cta.final.title", label: "Titre section CTA final", type: "text",     ph: "Prêt pour le grand large ?" },
    { id: "cta.final.sub",   label: "Sous-titre CTA final",    type: "text",     ph: "Réservez maintenant et vivez..." },
  ],
  "Excursion principale": [
    { id: "excursion.1.title",       label: "Titre",         type: "text",     ph: "Croisière Grand Cul de Sac Marin" },
    { id: "excursion.1.description", label: "Description",   type: "textarea", ph: "Embarquez pour une journée..." },
    { id: "excursion.1.price.adult", label: "Prix adulte (€)",    type: "number", ph: "95" },
    { id: "excursion.1.price.child", label: "Prix enfant (€)",    type: "number", ph: "55" },
    { id: "excursion.1.departure",   label: "Heure de départ",    type: "text",   ph: "08h00" },
    { id: "excursion.1.return",      label: "Heure de retour",    type: "text",   ph: "17h00" },
  ],
  "Contact & Infos pratiques": [
    { id: "contact.phone",     label: "Téléphone",              type: "text", ph: "+590 690 49 58 48" },
    { id: "contact.email",     label: "Email",                  type: "text", ph: "tikiboatguadeloupe@gmail.com" },
    { id: "contact.departure", label: "Point de départ",        type: "text", ph: "Marina de Pointe-à-Pitre / Le Gosier" },
    { id: "contact.zone",      label: "Zone géographique",      type: "text", ph: "Guadeloupe" },
    { id: "deposit.percent",   label: "Acompte (%)",            type: "number", ph: "30" },
  ],
};

export default function ContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/admin/content")
      .then(r => r.json())
      .then(data => { setValues(data); setLoading(false); });
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (status === "loading" || !session) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-white text-2xl">Contenu du site</h1>
          <p className="text-slate-400 text-sm mt-0.5">Modifiez les textes, prix et informations</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 text-sm">
          {saved ? <><CheckCircle2 size={16} /> Enregistré !</> : <><Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}</>}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : (
        <div className="space-y-6 max-w-3xl">
          {Object.entries(CONTENT_FIELDS).map(([section, fields]) => (
            <div key={section} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
              <h2 className="font-bold text-white mb-5 pb-3 border-b border-slate-200">{section}</h2>
              <div className="space-y-4">
                {fields.map(({ id, label, type, ph }) => (
                  <div key={id}>
                    <label className="block text-slate-500 text-xs font-medium mb-1.5">{label}</label>
                    {type === "textarea" ? (
                      <textarea
                        value={values[id] ?? ""}
                        onChange={e => setValues(prev => ({ ...prev, [id]: e.target.value }))}
                        placeholder={ph} rows={3}
                        className="w-full bg-tiki-ocean border border-slate-200 focus:border-tiki-lagon rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none transition-colors text-sm resize-none"
                      />
                    ) : (
                      <input
                        type={type} value={values[id] ?? ""}
                        onChange={e => setValues(prev => ({ ...prev, [id]: e.target.value }))}
                        placeholder={ph}
                        className="w-full bg-tiki-ocean border border-slate-200 focus:border-tiki-lagon rounded-xl px-4 py-3 text-white placeholder-slate-400 outline-none transition-colors text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50">
              {saved ? <><CheckCircle2 size={16} /> Enregistré !</> : <><Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer tout"}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
