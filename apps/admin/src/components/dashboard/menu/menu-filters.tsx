"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  PackageCheck,
  PackageX,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type { Category } from "@/types/menu";
import { ViewModeToggle } from "./view-mode-toggle";

type ProductStatusFilter = "all" | "active" | "inactive";
type AvailabilityFilter = "all" | "available" | "out_of_stock";

interface MenuFiltersProps {
  categories: Category[];

  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;

  searchQuery: string;
  onSearchChange: (query: string) => void;

  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;

  selectedStatus?: ProductStatusFilter;
  onStatusChange?: (status: ProductStatusFilter) => void;

  selectedAvailability?: AvailabilityFilter;
  onAvailabilityChange?: (availability: AvailabilityFilter) => void;
}

export function MenuFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedStatus = "all",
  onStatusChange,
  selectedAvailability = "all",
  onAvailabilityChange,
}: MenuFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeCategories = useMemo(() => {
    return categories
      .filter((category) => category.isActive)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }

        return a.name.localeCompare(b.name);
      });
  }, [categories]);

  const activeFiltersCount =
    (selectedCategory !== "Todos" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (selectedAvailability !== "all" ? 1 : 0);

  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    onSelectCategory("Todos");
    onStatusChange?.("all");
    onAvailabilityChange?.("all");
  };

  const selectedCategoryName =
    selectedCategory === "Todos"
      ? "Todas"
      : (activeCategories.find((category) => category.id === selectedCategory)
          ?.name ?? "Categoría");

  return (
    <div className="space-y-3 border-b border-border pb-3">
      {/* Search + actions */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-9 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          {/* Filters button */}
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`relative inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition-all ${
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

          {/* View mode */}
          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {/* Advanced filters */}
      {filtersOpen && (
        <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm">
          <div className="space-y-5">
            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Categoría
                </div>

                <span className="text-[10px] text-muted-foreground">
                  {selectedCategoryName}
                </span>
              </div>

              <div className="scrollbar-none flex gap-1.5 overflow-x-auto pb-0.5">
                <FilterChip
                  active={selectedCategory === "Todos"}
                  onClick={() => onSelectCategory("Todos")}
                >
                  Todas
                </FilterChip>

                {activeCategories.map((category) => (
                  <FilterChip
                    key={category.id}
                    active={selectedCategory === category.id}
                    onClick={() => onSelectCategory(category.id)}
                  >
                    {category.name}
                  </FilterChip>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Status + Availability */}
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Product status */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Estado
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={selectedStatus === "all"}
                    onClick={() => onStatusChange?.("all")}
                  >
                    Todos
                  </FilterChip>

                  <FilterChip
                    active={selectedStatus === "active"}
                    onClick={() => onStatusChange?.("active")}
                    icon={<Check className="h-3.5 w-3.5" />}
                  >
                    Activos
                  </FilterChip>

                  <FilterChip
                    active={selectedStatus === "inactive"}
                    onClick={() => onStatusChange?.("inactive")}
                  >
                    Inactivos
                  </FilterChip>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Disponibilidad
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={selectedAvailability === "all"}
                    onClick={() => onAvailabilityChange?.("all")}
                  >
                    Todas
                  </FilterChip>

                  <FilterChip
                    active={selectedAvailability === "available"}
                    onClick={() => onAvailabilityChange?.("available")}
                    icon={<PackageCheck className="h-3.5 w-3.5" />}
                  >
                    Disponibles
                  </FilterChip>

                  <FilterChip
                    active={selectedAvailability === "out_of_stock"}
                    onClick={() => onAvailabilityChange?.("out_of_stock")}
                    icon={<PackageX className="h-3.5 w-3.5" />}
                  >
                    Agotados
                  </FilterChip>
                </div>
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
