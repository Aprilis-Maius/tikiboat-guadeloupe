"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email, password, redirect: false,
    });
    if (res?.ok) {
      router.push("/admin");
    } else {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Tiki Boat" width={180} height={60}
            className="h-14 w-auto object-contain" />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-tiki-lagon/10 flex items-center justify-center">
              <Lock size={18} className="text-tiki-lagon" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-none">Espace Admin</h1>
              <p className="text-slate-400 text-xs mt-0.5">Tiki Boat — Accès restreint</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-600 text-sm mb-1.5">Email</label>
              <input type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tikiboat.fr"
                className="w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-slate-600 text-sm mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 focus:border-tiki-lagon focus:ring-2 focus:ring-tiki-lagon/10 rounded-xl px-4 py-3 pr-11 text-slate-800 placeholder-slate-400 outline-none transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-tiki-lagon hover:bg-tiki-lagon-light text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm mt-2">
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
