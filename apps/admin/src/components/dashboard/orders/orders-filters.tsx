"use client";

import React from "react";
import { Search, Activity, Archive } from "lucide-react";
import type { OrderStatus } from "@/types/order";
import { OrdersDatePicker } from "./date-picker";

export type OrdersView = "active" | "history";

interface OrdersFiltersProps {
  view: OrdersView;
  onViewChange: (view: OrdersView) => void;
  viewCounts: Record<OrdersView, number>;

  searchQuery: string;
  onSearchChange: (query: string) => void;

  selectedStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;

  startDate: string;
  endDate: string;
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;

  statusCounts: Partial<Record<OrderStatus, number>>;
}

const ACTIVE_TABS: { id: OrderStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "confirmed", label: "Confirmadas" },
  { id: "in_kitchen", label: "En preparación" },
  { id: "ready", label: "Listas" },
  { id: "served", label: "Entregadas" },
];

const HISTORY_TABS: { id: OrderStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "completed", label: "Completadas" },
  { id: "cancelled", label: "Canceladas" },
];

export function OrdersFilters({
  view,
  onViewChange,
  viewCounts,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  startDate,
  endDate,
  onDateRangeChange,
  statusCounts,
}: OrdersFiltersProps) {
  const tabs = view === "active" ? ACTIVE_TABS : HISTORY_TABS;

  return (
    <section className="space-y-4">
      {/* Vistas principales */}
      <div className="grid grid-cols-2 gap-2" aria-label="Tipo de órdenes">
        <button
          type="button"
          onClick={() => onViewChange("active")}
          aria-pressed={view === "active"}
          className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            view === "active"
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Activity aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-semibold">Activas</span>
          </span>

          <span className="rounded-md bg-background/80 px-2 py-1 font-mono text-xs font-semibold">
            {viewCounts.active}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange("history")}
          aria-pressed={view === "history"}
          className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
            view === "history"
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-border bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Archive aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span className="truncate text-sm font-semibold">Historial</span>
          </span>

          <span className="rounded-md bg-background/80 px-2 py-1 font-mono text-xs font-semibold">
            {viewCounts.history}
          </span>
        </button>
      </div>

      {/* Filtros por estado de la vista seleccionada */}
      <div className="-mx-1 overflow-x-auto px-1 pb-2">
        <div className="flex w-max min-w-full items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            const count = statusCounts[tab.id] ?? 0;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusChange(tab.id)}
                aria-pressed={isActive}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>

                <span
                  className={`min-w-5 rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Búsqueda y fechas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="search"
            placeholder="Buscar por referencia, cliente o producto..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
          />
        </label>

        {view === "history" && (
          <div className="w-full sm:w-auto">
            <OrdersDatePicker
              startDate={startDate}
              endDate={endDate}
              onChange={onDateRangeChange}
            />
          </div>
        )}
      </div>

      {view === "history" && (
        <p className="text-xs text-muted-foreground">
          Consulta órdenes cerradas o canceladas y filtra por fecha de creación.
        </p>
      )}
    </section>
  );
}
