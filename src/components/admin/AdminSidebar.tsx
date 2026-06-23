"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, CalendarDays, ListOrdered,
  FileText, Anchor, LogOut, ExternalLink, Menu, X,
} from "lucide-react";

const navItems = [
  { href: "/admin",              icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/admin/reservations", icon: ListOrdered,     label: "Réservations" },
  { href: "/admin/calendar",     icon: CalendarDays,    label: "Calendrier"   },
  { href: "/admin/excursions",   icon: Anchor,          label: "Excursions"   },
  { href: "/admin/contenu",      icon: FileText,        label: "Contenu"      },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/admin/login");
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <>
      {/* ── MOBILE : top bar ─────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-slate-200 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="flex-1 flex justify-center">
          <Image src="/logo.png" alt="Tiki Boat" width={120} height={40} className="h-8 w-auto object-contain" />
        </div>
        <div className="w-9 shrink-0" />
      </div>

      {/* ── MOBILE : overlay menu ────────────────────────── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-slate-100">
              <div>
                <Image src="/logo.png" alt="Tiki Boat" width={140} height={50} className="h-10 w-auto object-contain" />
                <p className="text-slate-400 text-[10px] font-semibold tracking-[0.15em] uppercase mt-2">Administration</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(href)
                      ? "bg-tiki-lagon/10 text-tiki-lagon"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={18} className={isActive(href) ? "text-tiki-lagon" : "text-slate-400"} />
                  {label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-6 pt-3 border-t border-slate-100 space-y-0.5">
              <a
                href="/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink size={16} />
                Voir le site
              </a>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DESKTOP : sidebar classique ──────────────────── */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-slate-200 h-screen">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-slate-100">
          <Image src="/logo.png" alt="Tiki Boat" width={150} height={50} className="h-12 w-auto object-contain" />
          <p className="text-slate-400 text-[10px] font-semibold tracking-[0.15em] uppercase mt-2">Administration</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive(href)
                  ? "bg-tiki-lagon/10 text-tiki-lagon"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} className={isActive(href) ? "text-tiki-lagon" : "text-slate-400"} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-0.5">
          <a
            href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
          >
            <ExternalLink size={14} />
            Voir le site
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
