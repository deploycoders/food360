"use client";

import { useState } from "react";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

import type { AppRole } from "@food360/types";

interface DashboardShellProps {
  children: React.ReactNode;
  userRole: AppRole;
}

export function DashboardShell({ children, userRole }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        userRole={userRole}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((previous) => !previous)}
        />

        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
