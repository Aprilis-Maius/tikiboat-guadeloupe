"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  Images,
  FileText,
  Anchor,
  BookOpen,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin",              icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/admin/reservations", icon: ListOrdered,     label: "Réservations" },
  { href: "/admin/calendar",     icon: CalendarDays,    label: "Calendrier"   },
  { href: "/admin/excursions",   icon: Anchor,          label: "Excursions"   },
  { href: "/admin/blog",         icon: BookOpen,        label: "Blog"         },
  { href: "/admin/contenu",      icon: FileText,        label: "Contenu"      },
  { href: "/admin/galerie",      icon: Images,          label: "Galerie"      },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <Image src="/logo.png" alt="Tiki Boat" width={150} height={50} className="h-10 w-auto object-contain" />
          <p className="text-slate-400 text-[10px] font-semibold tracking-[0.15em] uppercase mt-2">Administration</p>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active ? "bg-tiki-lagon/10 text-tiki-lagon" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}>
              <Icon size={16} className={active ? "text-tiki-lagon" : "text-slate-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-3 pb-4 pt-3 border-t border-slate-100 space-y-0.5">
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all">
          <ExternalLink size={14} />
          Voir le site
        </a>
        <button onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={14} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Burger button — mobile uniquement */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Backdrop mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar desktop — toujours visible */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col bg-white border-r border-slate-200 h-screen">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile — drawer depuis la gauche */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-slate-200 h-screen shadow-2xl transition-transform duration-300 ease-in-out ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>
    </>
  );
}
