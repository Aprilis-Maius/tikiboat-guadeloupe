"use client";

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

  return (
    <aside className="w-14 lg:w-56 shrink-0 flex flex-col bg-white border-r border-slate-200 h-screen transition-all">
      {/* Logo */}
      <div className="px-2 lg:px-5 pt-5 pb-4 lg:pt-6 lg:pb-5 border-b border-slate-100 flex items-center justify-center lg:block">
        <Image
          src="/logo.png" alt="Tiki Boat"
          width={150} height={50}
          className="h-8 lg:h-12 w-auto object-contain"
        />
        <p className="hidden lg:block text-slate-400 text-[10px] font-semibold tracking-[0.15em] uppercase mt-2">
          Administration
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1.5 lg:px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-tiki-lagon/10 text-tiki-lagon"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={18} className={`shrink-0 ${active ? "text-tiki-lagon" : "text-slate-400"}`} />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bas de sidebar */}
      <div className="px-1.5 lg:px-3 pb-4 pt-3 border-t border-slate-100 space-y-0.5">
        <a
          href="/" target="_blank" rel="noopener noreferrer"
          title="Voir le site"
          className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all"
        >
          <ExternalLink size={16} className="shrink-0" />
          <span className="hidden lg:block">Voir le site</span>
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title="Déconnexion"
          className="w-full flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={16} className="shrink-0" />
          <span className="hidden lg:block">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
