"use client";

import React from "react";
import { Search, CheckCheck, PauseCircle } from "lucide-react";
import { StockFilterType } from "@/types/stock";

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: StockFilterType;
  onFilterChange: (filter: StockFilterType) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  counts: { total: number; available: number; outOfStock: number };
  onEnableAll: () => void;
  onDisableAll: () => void;
}

export function StockFilters({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  categories,
  counts,
  onEnableAll,
  onDisableAll,
}: StockFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Fila superior: Buscador y Acciones globales */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEnableAll}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Habilitar
            Todos
          </button>
          <button
            onClick={onDisableAll}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
          >
            <PauseCircle className="w-3.5 h-3.5 text-destructive" /> Pausar
            Todos
          </button>
        </div>
      </div>

      {/* Fila inferior: Pestañas de estado y Pills de categorías */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        {/* Pestañas de estado */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeFilter === "all"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({counts.total})
          </button>
          <button
            onClick={() => onFilterChange("available")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeFilter === "available"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            En Stock ({counts.available})
          </button>
          <button
            onClick={() => onFilterChange("out_of_stock")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeFilter === "out_of_stock"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agotados ({counts.outOfStock})
          </button>
        </div>

        {/* Filtro por Categoría (Pills) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => onCategoryChange("all")}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedCategory === "all"
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
