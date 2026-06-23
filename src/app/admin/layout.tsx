import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminSessionProvider from "@/components/admin/AdminSessionProvider";

export const metadata: Metadata = {
  title: { default: "Admin — Tiki Boat", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-auto pt-14 lg:pt-0">
          {children}
        </div>
      </div>
    </AdminSessionProvider>
  );
}
