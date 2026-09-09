"use client";

import React, { useState, useMemo } from "react";
import { StockItem, StockFilterType } from "@/types/disponibility";
import { StockHeader } from "@/components/dashboard/menu/disponibility/StockHeader";
import { StockFilters } from "@/components/dashboard/menu/disponibility/StockFilters";
import { StockCard } from "@/components/dashboard/menu/disponibility/StockCard";

const INITIAL_ITEMS: StockItem[] = [
  {
    id: "1",
    name: "Hamburguesa Trufada Angus",
    category: "Hamburguesas",
    price: 18.5,
    isAvailable: true,
    preparationTime: "15 min",
  },
  {
    id: "2",
    name: "Pizza Napolitana Burrata",
    category: "Pizzas",
    price: 22.0,
    isAvailable: true,
    preparationTime: "12 min",
  },
  {
    id: "3",
    name: "Costillas BBQ Ahumadas 500g",
    category: "Carnes & Brasas",
    price: 28.0,
    isAvailable: true,
    preparationTime: "20 min",
  },
  {
    id: "4",
    name: "Poke Bowl Salmón Fresco",
    category: "Bowls & Saludable",
    price: 17.5,
    isAvailable: false,
    preparationTime: "10 min",
  },
  {
    id: "5",
    name: "Cerveza Artesanal IPA Doble Lúpulo",
    category: "Bebidas",
    price: 6.5,
    isAvailable: true,
    preparationTime: "3 min",
  },
  {
    id: "6",
    name: "Smash Cheeseburger Doble",
    category: "Hamburguesas",
    price: 14.0,
    isAvailable: true,
    preparationTime: "10 min",
  },
  {
    id: "7",
    name: "Vino Tinto Ribera del Duero (Copa)",
    category: "Bebidas",
    price: 5.5,
    isAvailable: false,
    preparationTime: "2 min",
  },
];

export default function DisponibilityControlPage() {
  const [items, setItems] = useState<StockItem[]>(INITIAL_ITEMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<StockFilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Obtener lista única de categorías
  const categories = useMemo(() => {
    return Array.from(new Set(INITIAL_ITEMS.map((item) => item.category)));
  }, []);

  // Handlers de cambio de estado
  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item,
      ),
    );
  };

  const handleEnableAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isAvailable: true })));
  };

  const handleDisableAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, isAvailable: false })));
  };

  // Contadores
  const counts = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.isAvailable).length;
    const outOfStock = total - available;
    return { total, available, outOfStock };
  }, [items]);

  // Filtrado reactivo
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        activeFilter === "all" ||
        (activeFilter === "available" && item.isAvailable) ||
        (activeFilter === "out_of_stock" && !item.isAvailable);

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, activeFilter, selectedCategory]);

  return (
    <div className="space-y-6 mx-auto">
      <StockHeader outOfStockCount={counts.outOfStock} />

      <StockFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        counts={counts}
        onEnableAll={handleEnableAll}
        onDisableAll={handleDisableAll}
      />

      {/* Grid de Productos */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <StockCard key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card/50">
          <p className="text-sm text-muted-foreground">
            No se encontraron productos coincidentes con los filtros
            seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
