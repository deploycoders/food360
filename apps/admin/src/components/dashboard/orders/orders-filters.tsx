"use client";

import React from "react";
import { Search, Calendar } from "lucide-react";
import { OrderStatus } from "@/types/order";

interface OrdersFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: OrderStatus;
  onStatusChange: (status: OrderStatus) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  statusCounts: Record<OrderStatus, number>;
}

const TABS: { id: OrderStatus; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendientes" },
  { id: "in_kitchen", label: "En Cocina" },
  { id: "ready", label: "Listos" },
  { id: "delivered", label: "Entregados" },
  { id: "paid", label: "Pagados" },
  { id: "cancelled", label: "Cancelados" },
];

export function OrdersFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedDate,
  onDateChange,
  statusCounts,
}: OrdersFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Pestañas de Estado */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border scrollbar-none">
        {TABS.map((tab) => {
          const count = statusCounts[tab.id] || 0;
          const isActive = selectedStatus === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-accent/15 text-accent border border-accent/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
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

      {/* Buscador y Filtro por Fecha */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por # comanda, cliente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-foreground w-full sm:w-auto justify-between sm:justify-start">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-transparent text-foreground focus:outline-none text-xs"
          />
        </div>
      </div>
    </div>
  );
}
