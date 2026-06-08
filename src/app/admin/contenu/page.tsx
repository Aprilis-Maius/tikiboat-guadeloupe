"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle2, Type, Phone, MapPin, Euro } from "lucide-react";

const inputCls = "w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors text-sm";
const labelCls = "block text-slate-500 text-xs font-semibold mb-1.5";

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

  const set = (id: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues(prev => ({ ...prev, [id]: e.target.value }));

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

  if (status === "loading" || !session) return <div className="p-8 text-slate-400 text-sm">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-bold text-slate-800 text-2xl">Contenu du site</h1>
          <p className="text-slate-400 text-sm mt-0.5">Modifiez les textes, prix et informations</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-6 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-sm">
          {saved
            ? <><CheckCircle2 size={15} /> Enregistré !</>
            : <><Save size={15} /> {saving ? "Enregistrement…" : "Enregistrer"}</>}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Chargement…</div>
      ) : (
        <div className="space-y-5">

          {/* ── Section Textes ── */}
          <Section icon={<Type size={15} className="text-violet-500" />} iconBg="bg-violet-50 border-violet-200" title="Textes du site" subtitle="Hero, CTA — textes visibles sur le site public">
            <Field label="Titre principal (hero)" id="hero.headline" placeholder="Une journée en mer inoubliable en Guadeloupe." values={values} onChange={set} />
            <Field label="Sous-titre hero" id="hero.subtitle" placeholder="Snorkeling, îlets sauvages et repas créole les pieds dans l'eau." values={values} onChange={set} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Pré-titre (petite caps)" id="hero.pretitle" placeholder="Guadeloupe · Grand Cul de Sac Marin" values={values} onChange={set} />
              <Field label="Titre section CTA final" id="cta.final.title" placeholder="Prêt pour le grand large ?" values={values} onChange={set} />
            </div>
            <Field label="Sous-titre CTA final" id="cta.final.sub" placeholder="Réservez maintenant et vivez une expérience unique." values={values} onChange={set} />
          </Section>

          {/* ── Section Contact ── */}
          <Section icon={<Phone size={15} className="text-emerald-600" />} iconBg="bg-emerald-50 border-emerald-200" title="Contact & Infos pratiques" subtitle="Coordonnées affichées sur le site et paramètres de réservation">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Téléphone / WhatsApp" id="contact.phone" placeholder="+590 690 49 58 48" values={values} onChange={set}
                icon={<Phone size={13} className="text-slate-400" />} />
              <Field label="Email de contact" id="contact.email" placeholder="tikiboatguadeloupe@gmail.com" values={values} onChange={set} />
            </div>
            <Field label="Point de départ" id="contact.departure" placeholder="Marina de Pointe-à-Pitre / Le Gosier" values={values} onChange={set}
              icon={<MapPin size={13} className="text-slate-400" />} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Zone géographique" id="contact.zone" placeholder="Guadeloupe" values={values} onChange={set}
                icon={<MapPin size={13} className="text-slate-400" />} />
              <Field label="Acompte requis (%)" id="deposit.percent" placeholder="30" type="number" values={values} onChange={set}
                icon={<Euro size={13} className="text-slate-400" />} />
            </div>
          </Section>

        </div>
      )}
    </div>
  );
}

/* ── Composants helper ── */

function Section({ icon, iconBg, title, subtitle, children }: {
  icon: React.ReactNode; iconBg: string;
  title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, id, placeholder, type = "text", textarea, icon, values, onChange }: {
  label: string; id: string; placeholder: string;
  type?: string; textarea?: boolean; icon?: React.ReactNode;
  values: Record<string, string>;
  onChange: (id: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea value={values[id] ?? ""} onChange={onChange(id)} placeholder={placeholder} rows={3}
          className={`${inputCls} resize-none`} />
      ) : icon ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
          <input type={type} value={values[id] ?? ""} onChange={onChange(id)} placeholder={placeholder}
            className={`${inputCls} pl-8`} />
        </div>
      ) : (
        <input type={type} value={values[id] ?? ""} onChange={onChange(id)} placeholder={placeholder}
          className={inputCls} />
      )}
    </div>
  );
}
