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
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-slate-200 h-screen">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-slate-100">
        <Image
          src="/logo.png" alt="Tiki Boat"
          width={150} height={50}
          className="h-12 w-auto object-contain"
        />
        <p className="text-slate-400 text-[10px] font-semibold tracking-[0.15em] uppercase mt-2">
          Administration
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-tiki-lagon/10 text-tiki-lagon"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} className={active ? "text-tiki-lagon" : "text-slate-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bas de sidebar */}
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
  );
}
