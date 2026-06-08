"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X } from "lucide-react";
import AdminImageUpload from "@/components/admin/AdminImageUpload";
import BlogEditor from "@/components/admin/BlogEditor";

interface BlogPost {
  id: string; slug: string; title: string; excerpt: string;
  category: string; date: string; readTime: number;
  coverImage: string; coverLabel: string; keywords: string;
  content: string; isPublished: boolean; sortOrder: number;
}

const CATEGORIES = ["Guide", "Destination", "Activité", "Famille", "Événement"];

const empty = (): Omit<BlogPost, "id" | "slug"> => ({
  title: "", excerpt: "", category: "Guide",
  date: new Date().toISOString().split("T")[0],
  readTime: 5, coverImage: "/photos/blog.jpg", coverLabel: "",
  keywords: "", content: "", isPublished: true, sortOrder: 0,
});

const inputCls = "w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-3 py-2.5 text-slate-800 placeholder-slate-400 outline-none transition-colors text-sm";
const labelCls = "block text-slate-500 text-xs font-semibold mb-1.5";

export default function BlogAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.push("/admin/login"); }, [status, router]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error();
      setPosts(await res.json());
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (session) fetchPosts(); }, [session, fetchPosts]);

  const openNew = () => { setForm(empty()); setEditId("new"); };
  const openEdit = (p: BlogPost) => {
    setForm({ title: p.title, excerpt: p.excerpt, category: p.category, date: p.date,
      readTime: p.readTime, coverImage: p.coverImage, coverLabel: p.coverLabel,
      keywords: p.keywords, content: p.content, isPublished: p.isPublished, sortOrder: p.sortOrder });
    setEditId(p.id);
  };
  const closeEdit = () => { setEditId(null); setForm(empty()); };

  const save = async () => {
    setSaving(true);
    if (editId === "new") {
      await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    } else {
      await fetch("/api/admin/blog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...form }) });
    }
    await fetchPosts(); closeEdit(); setSaving(false);
  };

  const togglePublished = async (p: BlogPost) => {
    await fetch("/api/admin/blog", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, isPublished: !p.isPublished }) });
    fetchPosts();
  };

  const deletePost = async (p: BlogPost) => {
    if (!confirm(`Supprimer "${p.title}" ?`)) return;
    await fetch("/api/admin/blog", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) });
    fetchPosts();
  };

  if (status === "loading" || !session) return <div className="p-8 text-slate-400">Chargement...</div>;

  return (
    <div className="p-7 lg:p-9">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-slate-800 font-bold text-2xl tracking-tight">Blog</h1>
          <p className="text-slate-400 text-sm mt-0.5">{posts.length} article{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {/* Formulaire */}
      {editId !== null && (
        <div className="bg-white border border-tiki-lagon/30 shadow-sm rounded-2xl mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm">
              {editId === "new" ? "Nouvel article" : `Modifier : ${form.title}`}
            </h2>
            <button onClick={closeEdit} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
          </div>

          <div className="p-6 space-y-5">
            {/* Ligne 1 — Infos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Titre de l&apos;article *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className={inputCls} placeholder="Ex : Les meilleures excursions en Guadeloupe" />
                  <p className="text-slate-300 text-xs mt-1">Le titre qui apparaîtra sur le site</p>
                </div>
                <div>
                  <label className={labelCls}>Résumé <span className="text-slate-300 font-normal">(affiché dans la liste d&apos;articles)</span></label>
                  <textarea value={form.excerpt} rows={3}
                    onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                    className={`${inputCls} resize-none`} placeholder="En 2-3 phrases, décrivez le sujet de l'article..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Catégorie</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                      className={inputCls}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Date de publication</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Mots-clés pour Google <span className="text-slate-300 font-normal">(séparés par des virgules)</span></label>
                  <input value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                    className={inputCls} placeholder="excursion Guadeloupe, snorkeling, Grand Cul de Sac" />
                  <p className="text-slate-300 text-xs mt-1">Ces mots aident Google à trouver votre article</p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-slate-200">
                  <input type="checkbox" id="published" checked={form.isPublished}
                    onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                    className="w-4 h-4 rounded accent-tiki-lagon" />
                  <div>
                    <label htmlFor="published" className="text-slate-600 text-sm cursor-pointer font-medium">Publier sur le site</label>
                    <p className="text-slate-400 text-xs">Si décoché, l&apos;article est en brouillon et invisible</p>
                  </div>
                </div>
              </div>

              {/* Image de couverture */}
              <AdminImageUpload
                value={form.coverImage}
                onChange={url => setForm(p => ({ ...p, coverImage: url }))}
                label="Photo de couverture"
                hint="Cette photo apparaît en haut de l'article et dans la liste"
              />
            </div>

            {/* Contenu de l'article */}
            <BlogEditor
              value={form.content}
              onChange={content => setForm(p => ({ ...p, content }))}
            />
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

      {/* Liste */}
      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
          <p className="text-slate-300 text-sm mb-3">Aucun article</p>
          <button onClick={openNew} className="text-tiki-lagon text-sm hover:underline">Créer le premier</button>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 shadow-sm rounded-xl flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">{p.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tiki-lagon/10 text-tiki-lagon/70 border border-tiki-gold/15">
                    {p.category}
                  </span>
                  {!p.isPublished && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200">Brouillon</span>
                  )}
                </div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {new Date(p.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  {" · "}{p.readTime} min
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => togglePublished(p)} title={p.isPublished ? "Dépublier" : "Publier"}
                  className={`p-2 rounded-lg transition-colors ${p.isPublished ? "text-emerald-400 hover:bg-emerald-400/10" : "text-slate-300 hover:bg-slate-50"}`}>
                  {p.isPublished ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-slate-400 hover:text-tiki-lagon hover:bg-tiki-lagon/10 transition-colors">
                  <Pencil size={15} />
                </button>
                <button onClick={() => deletePost(p)}
                  className="p-2 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
