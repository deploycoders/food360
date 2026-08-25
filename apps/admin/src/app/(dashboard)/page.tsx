"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { PopularCategories } from "@/components/dashboard/popular-categories";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Resumen Operativo
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Métricas clave y estado de la operación.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/orders/new"
            className="h-9 px-3.5 rounded-lg bg-accent hover:opacity-95 text-accent-foreground font-medium text-xs inline-flex items-center gap-1.5 transition-all shrink-0 shadow-md shadow-accent/15"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Comanda</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <MetricsCards />

      {/* Gráfico y Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div>
          <PopularCategories />
        </div>
      </div>

      {/* Tabla Reciente */}
      <RecentOrdersTable />
    </div>
  );
}
