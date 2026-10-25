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
      {/* Selector compacto: Activas / Historial */}
      <div className="flex justify-end">
        <div
          role="tablist"
          aria-label="Tipo de órdenes"
          className="inline-flex w-fit max-w-full items-center gap-1 rounded-xl border border-border bg-muted/40 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={view === "active"}
            onClick={() => onViewChange("active")}
            className={`inline-flex h-10 flex-none items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition-all ${
              view === "active"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 ${
                view === "active" ? "text-accent" : ""
              }`}
            />

            <span>Activas</span>

            <span
              className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                view === "active"
                  ? "bg-accent/10 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {viewCounts.active}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={view === "history"}
            onClick={() => onViewChange("history")}
            className={`inline-flex h-10 flex-none items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold transition-all ${
              view === "history"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Archive
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 ${
                view === "history" ? "text-accent" : ""
              }`}
            />

            <span>Historial</span>

            <span
              className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] tabular-nums ${
                view === "history"
                  ? "bg-accent/10 text-accent"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {viewCounts.history}
            </span>
          </button>
        </div>
      </div>

      {/* Filtros por estado */}
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
