"use client";

import React from "react";
import { Search } from "lucide-react";

interface MenuFiltersProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function MenuFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: MenuFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-1.5 border-b border-border">
      {/* Buscador de Platillos */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar por nombre o descripción..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-card border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
        />
      </div>

      {/* Tabs de Categorías */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`px-3.5 py-2 cursor-pointer rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-foreground text-background font-semibold shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
