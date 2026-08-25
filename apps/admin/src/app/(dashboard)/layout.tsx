// src/app/(dashboard)/layout.tsx
import React from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar a la izquierda */}
      <Sidebar />

      {/* Panel Contenido a la derecha */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
