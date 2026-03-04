// app/[locale]/(admin)/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import RouteGuard from "@/components/RouteGuard";
import AuthInitializer from "@/components/AuthInitializer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthInitializer />
      <RouteGuard allowedRoles={["exm_SuperAdmin"]}>
        <div className="flex h-screen bg-bg text-text">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </RouteGuard>
    </>
  );
}
