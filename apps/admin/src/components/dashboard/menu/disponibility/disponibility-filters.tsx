"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCheck,
  ChevronDown,
  PackageCheck,
  PackageX,
  PauseCircle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type { DisponibilityFilterType } from "@/types/disponibility";

interface CategoryOption {
  id: string;
  name: string;
}

interface StockFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;

  activeFilter: DisponibilityFilterType;
  onFilterChange: (filter: DisponibilityFilterType) => void;

  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  categories: CategoryOption[];

  counts: {
    total: number;
    available: number;
    outOfStock: number;
  };

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
  const [filtersOpen, setFiltersOpen] = useState(false);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const activeFiltersCount =
    (activeFilter !== "all" ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const selectedCategoryName =
    selectedCategory === "all"
      ? "Todas"
      : (sortedCategories.find((category) => category.id === selectedCategory)
          ?.name ?? "Categoría");

  const clearFilters = () => {
    onFilterChange("all");
    onCategoryChange("all");
  };

  return (
    <div className="space-y-3 border-b border-border pb-4">
      {/* ─────────────────────────────────────────────
          Search + actions
      ───────────────────────────────────────────── */}
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar producto o categoría..."
            className="h-10 w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-9 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
          {/* Enable all */}
          <button
            type="button"
            onClick={onEnableAll}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground transition-all duration-200 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-foreground active:scale-[0.98]"
          >
            <CheckCheck className="h-4 w-4 text-emerald-500" />
            <span>Activar todos</span>
          </button>

          {/* Disable all */}
          <button
            type="button"
            onClick={onDisableAll}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-foreground transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-foreground active:scale-[0.98]"
          >
            <PauseCircle className="h-4 w-4 text-muted-foreground" />
            <span>Agotar todos</span>
          </button>

          {/* Filters */}
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`relative col-span-2 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition-all lg:col-span-1 ${
              filtersOpen || hasActiveFilters
                ? "border-accent/40 bg-accent/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />

            <span>Filtros</span>

            {activeFiltersCount > 0 && (
              <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                {activeFiltersCount}
              </span>
            )}

            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                filtersOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Advanced filters
      ───────────────────────────────────────────── */}
      {filtersOpen && (
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <div className="space-y-5">
            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Categoría
                </div>

                <span className="truncate text-[10px] text-muted-foreground">
                  {selectedCategoryName}
                </span>
              </div>

              <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5">
                <FilterChip
                  active={selectedCategory === "all"}
                  onClick={() => onCategoryChange("all")}
                >
                  Todas
                </FilterChip>

                {sortedCategories.map((category) => (
                  <FilterChip
                    key={category.id}
                    active={selectedCategory === category.id}
                    onClick={() => onCategoryChange(category.id)}
                  >
                    {category.name}
                  </FilterChip>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Availability */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Disponibilidad
              </div>

              <div className="flex flex-wrap gap-1.5">
                <FilterChip
                  active={activeFilter === "all"}
                  onClick={() => onFilterChange("all")}
                >
                  Todos
                  <span className="ml-0.5 opacity-60">{counts.total}</span>
                </FilterChip>

                <FilterChip
                  active={activeFilter === "available"}
                  onClick={() => onFilterChange("available")}
                  icon={<PackageCheck className="h-3.5 w-3.5" />}
                >
                  Disponibles
                  <span className="ml-0.5 opacity-60">{counts.available}</span>
                </FilterChip>

                <FilterChip
                  active={activeFilter === "out_of_stock"}
                  onClick={() => onFilterChange("out_of_stock")}
                  icon={<PackageX className="h-3.5 w-3.5" />}
                >
                  Agotados
                  <span className="ml-0.5 opacity-60">{counts.outOfStock}</span>
                </FilterChip>
              </div>
            </div>

            {/* Footer */}
            {hasActiveFilters && (
              <>
                <div className="h-px bg-border" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground">
                    {activeFiltersCount}{" "}
                    {activeFiltersCount === 1
                      ? "filtro aplicado"
                      : "filtros aplicados"}
                  </span>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpiar filtros
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

function FilterChip({ active, onClick, children, icon }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium transition-all ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
