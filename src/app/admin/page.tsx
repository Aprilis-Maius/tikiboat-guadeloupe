import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
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
  const thirtyDaysLater = new Date(Date.now() + 30 * 86_400_000).toISOString().split("T")[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split("T")[0];

  const getDashboardData = unstable_cache(
    async (todayKey: string, thirtyKey: string, firstKey: string) =>
      Promise.all([
        prisma.reservation.findMany({
          where: { date: { gte: firstKey }, status: { not: "cancelled" } },
          select: { totalPrice: true, adults: true, children: true },
        }),
        prisma.reservation.findMany({
          where: { date: { gte: todayKey, lte: thirtyKey }, status: { not: "cancelled" } },
          orderBy: { date: "asc" },
          take: 50,
        }),
        prisma.reservation.count({ where: { status: "pending" } }),
      ]),
    ["admin-dashboard"],
    { revalidate: 45 }
  );

  const [monthResa, upcoming, pendingCount] = await getDashboardData(today, thirtyDaysLater, firstOfMonth);

  const monthRevenue = (monthResa as { totalPrice: number }[]).reduce((s, r) => s + r.totalPrice, 0);
  const monthPax     = (monthResa as { adults: number; children: number }[]).reduce((s, r) => s + r.adults + r.children, 0);

  const stats = [
    {
      label: "Réservations ce mois",
      value: monthResa.length,
      icon: CalendarCheck,
      color: "text-tiki-lagon",
      bg: "bg-tiki-lagon/10",
    },
    {
      label: "CA ce mois",
      value: `${monthRevenue.toLocaleString("fr-FR")} €`,
      icon: Euro,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Passagers ce mois",
      value: monthPax,
      icon: Users,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: "En attente",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const statusMap: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    confirmed: { label: "Confirmé",   icon: CheckCircle2, cls: "text-emerald-600" },
    pending:   { label: "En attente", icon: Clock,         cls: "text-amber-600"  },
    cancelled: { label: "Annulé",     icon: AlertCircle,  cls: "text-red-500"    },
  };

  return (
    <div className="p-7 lg:p-9 max-w-6xl">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-slate-800 font-bold text-2xl tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <div className={`font-bold text-3xl ${color} tabular-nums leading-none mb-1`}>
              {value}
            </div>
            <div className="text-slate-400 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Tableau réservations à venir */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-tiki-lagon" />
            <h2 className="text-slate-700 font-semibold text-sm">Réservations à venir — 30 jours</h2>
          </div>
          <Link href="/admin/reservations" className="text-tiki-lagon text-xs hover:underline transition-colors">
            Voir tout →
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-400 text-sm">
            Aucune réservation dans les 30 prochains jours
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Date", "Client", "Excursion", "Passagers", "Montant", "Statut"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-slate-400 text-xs font-semibold uppercase tracking-wider">
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
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0">
                      <td className="px-6 py-3.5 text-slate-800 text-sm font-medium whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="text-slate-800 text-sm">{r.customerName}</div>
                        <div className="text-slate-400 text-xs">{r.customerPhone}</div>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm whitespace-nowrap">{r.excursionTitle}</td>
                      <td className="px-6 py-3.5 text-slate-500 text-sm">
                        {r.adults + r.children} pers.
                      </td>
                      <td className="px-6 py-3.5 text-sm">
                        <div className="text-tiki-lagon font-bold">
                          {r.totalPrice.toLocaleString("fr-FR")} €
                        </div>
                        {r.paymentType === "deposit" && !r.isPaid ? (
                          <div className="text-amber-600 text-xs mt-0.5">
                            Acompte {r.depositAmount.toLocaleString("fr-FR")} € — reste{" "}
                            <span className="font-bold">{(r.totalPrice - r.depositAmount).toLocaleString("fr-FR")} €</span>
                          </div>
                        ) : r.isPaid ? (
                          <div className="text-emerald-600 text-xs mt-0.5">Soldé ✓</div>
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
