import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  title: { default: "Admin — Tiki Boat", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <AdminSessionProvider>
      {session ? (
        // Layout plein écran avec sidebar — aucun élément du site public
        <div className="flex h-screen bg-slate-50 overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-auto pt-14 lg:pt-0">
            {children}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-slate-100">
          <AdminGuard>{children}</AdminGuard>
        </div>
      )}
    </AdminSessionProvider>
  );
}
