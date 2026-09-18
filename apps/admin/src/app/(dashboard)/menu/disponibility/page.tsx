"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { StockFilters } from "@/components/dashboard/menu/disponibility/disponibility-filters";
import { StockCard } from "@/components/dashboard/menu/disponibility/disponibility-card";
import { StockHeader } from "@/components/dashboard/menu/disponibility/disponibility-header.tsx";

import {
  DisponibilityFilterType,
  DisponibilityItem,
} from "@/types/disponibility";

import { useRestaurant } from "@/context/RestaurantContext";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";

import {
  updateProductAvailability,
  setAllProductsAvailability,
} from "@/services/availability.service";

export default function DisponibilityControlPage() {
  const { restaurantId, loading: restaurantLoading } = useRestaurant();

  const { categories, loading: categoriesLoading } = useCategories();

  const {
    products,
    loading: productsLoading,
    saving,
    changeProductAvailability,
    refreshProducts,
  } = useProducts();

  const [searchQuery, setSearchQuery] = useState("");

  const [activeFilter, setActiveFilter] =
    useState<DisponibilityFilterType>("all");

  const [selectedCategory, setSelectedCategory] = useState("all");

  // ============================================================
  // MAPA DE CATEGORÍAS
  // ============================================================

  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  // ============================================================
  // CONVERTIR PRODUCTOS A ITEMS DE DISPONIBILIDAD
  // ============================================================

  const items = useMemo<DisponibilityItem[]>(() => {
    return products.map((product) => {
      const category = product.categoryId
        ? categoryMap.get(product.categoryId)
        : undefined;

      return {
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        category: category?.name ?? "Sin categoría",
        price: product.price,

        isAvailable: !product.isOutOfStock,

        preparationTime:
          product.preparationTimeMinutes != null
            ? `${product.preparationTimeMinutes} min`
            : undefined,
      };
    });
  }, [products, categoryMap]);

  // ============================================================
  // SOLO CATEGORÍAS ACTIVAS
  // ============================================================

  const activeCategories = useMemo(() => {
    return [...categories]
      .filter((category) => category.isActive)
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }

        return a.name.localeCompare(b.name, "es", {
          sensitivity: "base",
        });
      });
  }, [categories]);

  // ============================================================
  // VALIDAR CATEGORÍA SELECCIONADA
  // ============================================================

  useEffect(() => {
    if (selectedCategory === "all") {
      return;
    }

    const exists = activeCategories.some(
      (category) => category.id === selectedCategory,
    );

    if (!exists) {
      setSelectedCategory("all");
    }
  }, [activeCategories, selectedCategory]);

  // ============================================================
  // OPCIONES DEL FILTRO
  // ============================================================

  const categoryOptions = useMemo(() => {
    return activeCategories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  }, [activeCategories]);

  // ============================================================
  // CONTADORES
  // ============================================================

  const counts = useMemo(() => {
    const total = items.length;

    const available = items.filter((item) => item.isAvailable).length;

    const outOfStock = total - available;

    return {
      total,
      available,
      outOfStock,
    };
  }, [items]);

  // ============================================================
  // FILTRADO
  // ============================================================

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        activeFilter === "all" ||
        (activeFilter === "available" && item.isAvailable) ||
        (activeFilter === "out_of_stock" && !item.isAvailable);

      const matchesCategory =
        selectedCategory === "all" || item.categoryId === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchQuery, activeFilter, selectedCategory]);

  // ============================================================
  // CAMBIAR DISPONIBILIDAD
  // ============================================================

  const handleToggle = async (id: string) => {
    const product = products.find((current) => current.id === id);

    if (!product || saving) {
      return;
    }

    const nextIsOutOfStock = !product.isOutOfStock;

    const result = await changeProductAvailability(id, nextIsOutOfStock);

    if (!result) {
      toast.error("No se pudo cambiar la disponibilidad.", {
        duration: 3000,
      });

      return;
    }

    toast.success(
      nextIsOutOfStock
        ? `"${product.name}" marcado como agotado.`
        : `"${product.name}" vuelve a estar disponible.`,
      {
        duration: 3000,
      },
    );
  };

  // ============================================================
  // ACTIVAR TODOS
  // ============================================================

  const handleEnableAll = async () => {
    if (!restaurantId || saving || products.length === 0) {
      return;
    }

    try {
      await setAllProductsAvailability(restaurantId, false);

      // Actualizamos la fuente compartida
      await refreshProducts();

      toast.success("Todos los productos han sido activados.", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error activando disponibilidad global:", error);

      toast.error("No se pudieron activar todos los productos.", {
        duration: 3000,
      });
    }
  };

  // ============================================================
  // AGOTAR TODOS
  // ============================================================

  const handleDisableAll = async () => {
    if (!restaurantId || saving || products.length === 0) {
      return;
    }

    try {
      await setAllProductsAvailability(restaurantId, true);

      // Actualizamos la fuente compartida
      await refreshProducts();

      toast.success("Todos los productos han sido marcados como agotados.", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error desactivando disponibilidad global:", error);

      toast.error("No se pudieron agotar todos los productos.", {
        duration: 3000,
      });
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  const isLoading = restaurantLoading || categoriesLoading || productsLoading;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="mx-auto space-y-6">
      <StockHeader outOfStockCount={counts.outOfStock} />

      <StockFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categoryOptions}
        counts={counts}
        onEnableAll={handleEnableAll}
        onDisableAll={handleDisableAll}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-48 animate-pulse rounded-2xl border border-border bg-card/50"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => (
            <StockCard key={item.id} item={item} onToggle={handleToggle} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron productos coincidentes con los filtros
            seleccionados.
          </p>
        </div>
      )}
    </div>
  );
}
