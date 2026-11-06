"use client";

import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Check,
  ChevronDown,
  PackageCheck,
  PackageX,
  RotateCcw,
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

  const filtersPanelId = useId();
  const shouldReduceMotion = useReducedMotion();

  const activeCategories = useMemo(
    () =>
      categories
        .filter((category) => category.isActive)
        .sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }

          return a.name.localeCompare(b.name);
        }),
    [categories],
  );

  const showStatusFilter = Boolean(onStatusChange);
  const showAvailabilityFilter = Boolean(onAvailabilityChange);
  const canExpandFilters = showStatusFilter || showAvailabilityFilter;

  const advancedFiltersCount =
    Number(showStatusFilter && selectedStatus !== "all") +
    Number(showAvailabilityFilter && selectedAvailability !== "all");

  const activeFiltersCount =
    Number(selectedCategory !== "Todos") + advancedFiltersCount;

  const hasActiveFilters = activeFiltersCount > 0;

  const clearFilters = () => {
    onSelectCategory("Todos");
    onStatusChange?.("all");
    onAvailabilityChange?.("all");
  };

  return (
    <div className="space-y-4 border-b border-border pb-4">
      {/* Búsqueda y controles */}
      <div className="flex gap-3 sm:items-center sm:justify-between">
        <div role="search" className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            size={19}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="text"
            role="searchbox"
            placeholder="Buscar productos por nombre o descripción..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            autoComplete="off"
            aria-label="Buscar productos por nombre o descripción"
            className="h-10 w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-9 text-xs text-foreground placeholder:text-muted-foreground transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
          />

          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2">
          {canExpandFilters && (
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls={filtersPanelId}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                filtersOpen || advancedFiltersCount > 0
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />

              <span>Filtros</span>

              {advancedFiltersCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {advancedFiltersCount}
                </span>
              )}

              <ChevronDown
                size={14}
                strokeWidth={1.8}
                aria-hidden="true"
                className={`transition-transform duration-200 ${
                  filtersOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {/* Categorías de acceso rápido */}
      <section aria-label="Categorías de productos" className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-foreground">
              Categorías
            </h3>

            <span className="text-[11px] text-muted-foreground">
              {activeCategories.length}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              <RotateCcw size={12} strokeWidth={1.8} />
              Restablecer
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="flex gap-2 overflow-x-auto pb-1"
        >
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
      </section>

      {/* Filtros avanzados */}
      {canExpandFilters && (
        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              id={filtersPanelId}
              key="advanced-menu-filters"
              initial={shouldReduceMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.18,
                ease: "easeOut",
              }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      Filtros avanzados
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      Refina los productos de tu menú.
                    </p>
                  </div>

                  {advancedFiltersCount > 0 && (
                    <span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold text-accent">
                      {advancedFiltersCount} activos
                    </span>
                  )}
                </div>

                <div
                  className={`grid gap-5 ${
                    showStatusFilter && showAvailabilityFilter
                      ? "sm:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {/* Estado */}
                  {showStatusFilter && (
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Estado del producto
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        <FilterChip
                          active={selectedStatus === "all"}
                          onClick={() => onStatusChange?.("all")}
                        >
                          Todos
                        </FilterChip>

                        <FilterChip
                          active={selectedStatus === "active"}
                          onClick={() => onStatusChange?.("active")}
                          icon={<Check size={14} />}
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
                  )}

                  {/* Disponibilidad */}
                  {showAvailabilityFilter && (
                    <div className="space-y-2.5">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Disponibilidad
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        <FilterChip
                          active={selectedAvailability === "all"}
                          onClick={() => onAvailabilityChange?.("all")}
                        >
                          Todas
                        </FilterChip>

                        <FilterChip
                          active={selectedAvailability === "available"}
                          onClick={() => onAvailabilityChange?.("available")}
                          icon={<PackageCheck size={14} />}
                        >
                          Disponibles
                        </FilterChip>

                        <FilterChip
                          active={selectedAvailability === "out_of_stock"}
                          onClick={() => onAvailabilityChange?.("out_of_stock")}
                          icon={<PackageX size={14} />}
                        >
                          Agotados
                        </FilterChip>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
}

function FilterChip({ active, onClick, children, icon }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active
          ? "border-accent bg-accent text-accent-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:border-accent/40 hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
