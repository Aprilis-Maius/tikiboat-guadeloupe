"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export default function AdminImageUpload({ value, onChange, label = "Image", hint }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur upload");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Seules les images sont acceptées"); return; }
    upload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      {label && <p className="text-white/40 text-xs font-medium mb-1.5">{label}</p>}

      {value ? (
        /* Prévisualisation */
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#111111]">
          <div className="relative aspect-video w-full">
            <Image src={value} alt="Aperçu" fill className="object-cover" sizes="400px"
              onError={() => onChange("")} />
          </div>
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-tiki-gold text-tiki-ocean font-bold text-xs px-4 py-2 rounded-lg">
              <Upload size={13} /> Changer
            </button>
            <button type="button" onClick={() => onChange("")}
              className="flex items-center gap-1.5 bg-red-500/80 text-white font-bold text-xs px-4 py-2 rounded-lg">
              <X size={13} /> Supprimer
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <Loader2 size={24} className="text-tiki-gold animate-spin" />
            </div>
          )}
        </div>
      ) : (
        /* Zone de dépôt */
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? "border-tiki-gold bg-tiki-gold/10" : "border-white/15 hover:border-white/30 hover:bg-white/3"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={28} className="text-tiki-gold animate-spin" />
              <p className="text-white/50 text-sm">Upload en cours...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-1">
                <ImageIcon size={22} className="text-white/30" />
              </div>
              <p className="text-white/70 text-sm font-medium">
                Glissez une photo ici ou <span className="text-tiki-gold">cliquez pour choisir</span>
              </p>
              <p className="text-white/30 text-xs">JPG, PNG, WebP — max 5 Mo</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><X size={11} /> {error}</p>}
      {hint && !error && <p className="text-white/25 text-xs mt-1.5">{hint}</p>}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => handleFile(e.target.files?.[0])} />
    </div>
  );
}
