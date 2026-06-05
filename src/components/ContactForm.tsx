"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, ChevronDown } from "lucide-react";

const SUBJECTS = [
  { value: "info",          label: "Demande d'informations" },
  { value: "reservation",   label: "Aide à la réservation" },
  { value: "privatisation", label: "Privatisation du bateau" },
  { value: "groupe",        label: "Réservation de groupe" },
  { value: "autre",         label: "Autre" },
];

const inputCls =
  "w-full bg-white border border-slate-200 focus:border-tiki-gold rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-colors text-sm";

function ContactFormInner() {
  const searchParams = useSearchParams();
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:    "",
    email:   "",
    phone:   "",
    subject: searchParams.get("type") || "info",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      setSent(true);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
          <CheckCircle2 className="text-green-400" size={32} />
        </div>
        <h3 className="font-display text-xl font-bold text-tiki-gold mb-2">Message envoyé !</h3>
        <p className="text-slate-500 text-sm">Nous vous répondrons sous 24h.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">Nom *</label>
          <input
            type="text" required placeholder="Jean Dupont"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-slate-700 text-sm font-medium mb-1.5">Email *</label>
          <input
            type="email" required placeholder="jean@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1.5">Téléphone</label>
        <input
          type="tel" placeholder="+590 690 00 00 00"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1.5">Sujet *</label>
        <div className="relative">
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className={`${inputCls} appearance-none cursor-pointer pr-10`}
            style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
          >
            {SUBJECTS.map((s) => (
              <option
                key={s.value}
                value={s.value}
                style={{ backgroundColor: "#ffffff", color: "#0f172a" }}
              >
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-700 text-sm font-medium mb-1.5">Message *</label>
        <textarea
          required placeholder="Votre message..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={5}
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-tiki-gold hover:bg-tiki-gold-dark text-tiki-ocean font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Envoi en cours...
          </>
        ) : (
          <>
            Envoyer le message
            <Send size={16} />
          </>
        )}
      </button>
    </form>
  );
}

export default function ContactForm() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 rounded-xl bg-tiki-ocean" />}>
      <ContactFormInner />
    </Suspense>
  );
}
