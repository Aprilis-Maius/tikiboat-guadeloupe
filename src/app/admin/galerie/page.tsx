"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, PlayCircle, ImageIcon, GripVertical } from "lucide-react";
import AdminImageUpload from "@/components/admin/AdminImageUpload";

interface GalleryItem {
  id: string; type: string; url: string; caption?: string; sortOrder: number;
}

export default function GalleriePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ type: "photo", url: "", caption: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  const fetchItems = async () => {
    const res = await fetch("/api/admin/gallery");
    setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { if (session) fetchItems(); }, [session]);

  const addItem = async () => {
    if (!form.url) return;
    setSaving(true);
    await fetch("/api/admin/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: items.length }),
    });
    await fetchItems();
    setForm({ type: "photo", url: "", caption: "" });
    setAdding(false);
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  const getYouTubeId = (url: string) => {
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([^&\n?#]+)/);
    return m ? m[1] : null;
  };

  if (status === "loading" || !session) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-slate-800 text-2xl">Galerie</h1>
          <p className="text-slate-400 text-sm mt-0.5">{items.length} élément{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-slate-800 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Formulaire ajout */}
      {adding && (
        <div className="bg-white border border-tiki-lagon/30 shadow-sm rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-slate-800 mb-4 text-sm">Nouvel élément</h2>
          <div className="space-y-4">
            {/* Type */}
            <div className="flex gap-3">
              {[
                { val: "photo", icon: ImageIcon, label: "Photo (URL)" },
                { val: "video", icon: PlayCircle,   label: "Vidéo YouTube" },
              ].map(({ val, icon: Icon, label }) => (
                <label key={val}
                  className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${
                    form.type === val ? "border-tiki-lagon bg-tiki-lagon/10 text-tiki-lagon" : "border-slate-300 text-slate-500"
                  }`}>
                  <input type="radio" value={val} checked={form.type === val}
                    onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="sr-only" />
                  <Icon size={15} /> <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>

            {form.type === "photo" ? (
              <AdminImageUpload
                value={form.url}
                onChange={url => setForm(p => ({ ...p, url }))}
                label="Photo"
                hint="Glissez votre photo ou cliquez pour la choisir depuis votre ordinateur"
              />
            ) : (
              <div>
                <label className="block text-slate-500 text-xs mb-1.5">
                  Lien YouTube <span className="text-slate-300">(ex: https://youtu.be/xxx)</span>
                </label>
                <input type="url" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  placeholder="https://youtu.be/..."
                  className="w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none text-sm" />
                <p className="text-slate-300 text-xs mt-1">Copiez le lien de la vidéo YouTube et collez-le ici</p>
              </div>
            )}

            <div>
              <label className="block text-slate-500 text-xs mb-1.5">Légende (optionnel)</label>
              <input type="text" value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                placeholder="Description de la photo..."
                className="w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none text-sm" />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={addItem} disabled={saving || !form.url}
                className="bg-tiki-lagon hover:bg-tiki-lagon-light text-slate-800 font-bold py-2.5 px-6 rounded-xl text-sm transition-colors disabled:opacity-50">
                {saving ? "Ajout..." : "Ajouter"}
              </button>
              <button onClick={() => setAdding(false)}
                className="px-5 border border-slate-300 text-slate-500 hover:text-slate-800 rounded-xl text-sm transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grille galerie */}
      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
          <ImageIcon size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Aucun élément dans la galerie</p>
          <button onClick={() => setAdding(true)} className="text-tiki-lagon text-sm hover:underline mt-2">
            Ajouter le premier
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const ytId = item.type === "video" ? getYouTubeId(item.url) : null;
            const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : item.url;

            return (
              <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all">
                {/* Thumbnail */}
                <div className="relative aspect-video">
                  <Image src={thumbUrl} alt={item.caption || ""} fill className="object-cover" sizes="300px"
                    onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg/>"; }} />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="w-10 h-10 rounded-full bg-tiki-red/80 flex items-center justify-center">
                        <PlayCircle size={18} className="text-slate-800" />
                      </div>
                    </div>
                  )}
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => deleteItem(item.id)}
                      className="w-9 h-9 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors">
                      <Trash2 size={15} className="text-slate-800" />
                    </button>
                  </div>
                </div>
                {/* Info */}
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    <GripVertical size={12} className="text-slate-300 cursor-grab" />
                    {item.type === "video" ? (
                      <PlayCircle size={11} className="text-red-400" />
                    ) : (
                      <ImageIcon size={11} className="text-tiki-lagon-light" />
                    )}
                    <span className="text-slate-400 text-xs truncate">{item.caption || item.url.split("/").pop()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
