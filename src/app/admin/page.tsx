import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck, Euro, Users, Clock,
  CheckCircle2, AlertCircle, TrendingUp
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysLater = new Date(Date.now() + 30 * 86_400_000).toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];

  const [monthResa, upcoming, pendingCount] = await Promise.all([
    prisma.reservation.findMany({
      where: { date: { gte: firstOfMonth }, status: { not: "cancelled" } },
    }),
    prisma.reservation.findMany({
      where: { date: { gte: today, lte: sevenDaysLater }, status: { not: "cancelled" } },
      orderBy: { date: "asc" },
      take: 50,
    }),
    prisma.reservation.count({ where: { status: "pending" } }),
  ]);

  const monthRevenue = monthResa.reduce((s, r) => s + r.totalPrice, 0);
  const monthPax     = monthResa.reduce((s, r) => s + r.adults + r.children, 0);

  const stats = [
    {
      label: "Réservations ce mois",
      value: monthResa.length,
      icon: CalendarCheck,
      color: "text-tiki-gold",
      bg: "bg-tiki-gold/10",
    },
    {
      label: "CA ce mois",
      value: `${monthRevenue.toLocaleString("fr-FR")} €`,
      icon: Euro,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Passagers ce mois",
      value: monthPax,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
    },
    {
      label: "En attente",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  const statusMap: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    confirmed: { label: "Confirmé",   icon: CheckCircle2, cls: "text-emerald-400" },
    pending:   { label: "En attente", icon: Clock,         cls: "text-amber-400"  },
    cancelled: { label: "Annulé",     icon: AlertCircle,  cls: "text-red-400"    },
  };

  return (
    <div className="p-7 lg:p-9 max-w-6xl">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl tracking-tight">Dashboard</h1>
        <p className="text-white/30 text-sm mt-0.5">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats — 4 grandes cartes comme EasyDrift */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <div className={`font-bold text-3xl ${color} tabular-nums leading-none mb-1`}>
              {value}
            </div>
            <div className="text-white/35 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Tableau réservations à venir */}
      <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-tiki-gold" />
            <h2 className="text-white font-semibold text-sm">Réservations à venir — 30 jours</h2>
          </div>
          <Link href="/admin/reservations" className="text-tiki-gold text-xs hover:text-tiki-gold-light transition-colors">
            Voir tout →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="px-6 py-10 text-center text-white/20 text-sm">
            Aucune réservation dans les 30 prochains jours
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Date", "Client", "Excursion", "Passagers", "Montant", "Statut"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-white/25 text-xs font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.map((r) => {
                  const s = statusMap[r.status] ?? statusMap.pending;
                  const Icon = s.icon;
                  return (
                    <tr key={r.id} className="border-b border-white/4 hover:bg-white/2 transition-colors last:border-0">
                      <td className="px-6 py-3.5 text-white text-sm font-medium whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-white text-sm">{r.customerName}</div>
                        <div className="text-white/30 text-xs">{r.customerPhone}</div>
                      </td>
                      <td className="px-6 py-3.5 text-white/50 text-sm whitespace-nowrap">{r.excursionTitle}</td>
                      <td className="px-6 py-3.5 text-white/50 text-sm">
                        {r.adults + r.children} pers.
                      </td>
                      <td className="px-6 py-3.5 text-sm">
                        <div className="text-tiki-gold font-bold">
                          {r.totalPrice.toLocaleString("fr-FR")} €
                        </div>
                        {r.paymentType === "deposit" && !r.isPaid ? (
                          <div className="text-amber-400 text-xs mt-0.5">
                            Acompte {r.depositAmount.toLocaleString("fr-FR")} € — reste{" "}
                            <span className="font-bold">{(r.totalPrice - r.depositAmount).toLocaleString("fr-FR")} €</span>
                          </div>
                        ) : r.isPaid ? (
                          <div className="text-emerald-400 text-xs mt-0.5">Soldé ✓</div>
                        ) : null}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${s.cls}`}>
                          <Icon size={12} />
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
