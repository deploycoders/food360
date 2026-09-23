"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import type { Dish } from "@/types/menu";

import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";

import { MenuHeader } from "@/components/dashboard/menu/menu-header";
import { MenuFilters } from "@/components/dashboard/menu/menu-filters";
import { MenuProducts } from "@/components/dashboard/menu/menu-products";
import { DishModal } from "@/components/dashboard/menu/dish-modal/dish-modal";

import { confirmDesactivateProduct } from "@/app/lib/swal";
import { useMenuViewMode } from "@/lib/hooks/use-menu-view-mode";
import { mapProductsToDishes } from "@/components/dashboard/menu/menu-mapper";

export default function MenuPage() {
  const { categories, loading: categoriesLoading } = useCategories();

  const {
    products,
    loading: productsLoading,
    saving,
    editProduct,
    removeProduct,
    changeProductAvailability,
    addProduct,
  } = useProducts();

  const { viewMode, setViewMode, viewModeReady } = useMenuViewMode();

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  /*
   * ProductsContext es la fuente de verdad.
   *
   * Si otro dispositivo/pestaña modifica un producto,
   * ProductsContext recibe el evento de Supabase Realtime
   * y actualiza "products".
   *
   * Este componente simplemente reacciona a ese cambio.
   */
  const dishes = useMemo(
    () => mapProductsToDishes(products, categories),
    [products, categories],
  );

  const productFormCategories = useMemo(() => {
    const activeCategories = categories.filter((category) => category.isActive);

    if (!editingDish?.categoryId) {
      return activeCategories;
    }

    const currentCategory = categories.find(
      (category) => category.id === editingDish.categoryId,
    );

    if (
      currentCategory &&
      !currentCategory.isActive &&
      !activeCategories.some((category) => category.id === currentCategory.id)
    ) {
      return [...activeCategories, currentCategory];
    }

    return activeCategories;
  }, [categories, editingDish]);

  const filteredDishes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return dishes.filter((dish) => {
      const matchesCategory =
        selectedCategory === "Todos" || dish.categoryId === selectedCategory;

      const matchesSearch =
        !query ||
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [dishes, selectedCategory, searchQuery]);

  const handleToggleAvailability = async (dishId: string) => {
    const dish = products.find((product) => product.id === dishId);

    if (!dish) return;

    const newOutOfStock = !dish.isOutOfStock;

    const result = await changeProductAvailability(dishId, newOutOfStock);

    if (!result) {
      toast.error("No se pudo actualizar la disponibilidad.");
      return;
    }

    console.log("[Menu] Producto actualizado:", result);

    toast.success(
      newOutOfStock
        ? `"${dish.name}" marcado como agotado.`
        : `"${dish.name}" vuelve a estar disponible.`,
    );
  };

  const handleDeleteDish = async (dishId: string) => {
    const dish = products.find((product) => product.id === dishId);

    if (!dish) return;

    const confirmed = await confirmDesactivateProduct(dish.name);

    if (!confirmed) return;

    const result = await removeProduct(dishId);

    if (!result) {
      toast.error("No se pudo desactivar el producto.");
      return;
    }

    toast.success(`"${dish.name}" desactivado correctamente.`);
  };

  const handleSaveDish = async (dishData: Partial<Dish>) => {
    if (editingDish) {
      const result = await editProduct(editingDish.id, {
        name: dishData.name,
        description: dishData.description,
        price: dishData.price,
        categoryId: dishData.categoryId,
        preparationTimeMinutes: dishData.prepTimeMinutes,
        imageUrl: dishData.imageUrl ?? null,
        is3d: dishData.is3d,
        glbUrl: dishData.glbUrl ?? null,
        usdzUrl: dishData.usdzUrl ?? null,
        isActive: dishData.isActive,
        isOutOfStock: dishData.isOutOfStock,
      });

      if (!result) {
        toast.error("No se pudo actualizar el producto.");
        return;
      }

      toast.success(`"${result.name}" actualizado correctamente.`);
    } else {
      const result = await addProduct({
        name: dishData.name ?? "Nuevo Platillo",
        description: dishData.description ?? null,
        price: dishData.price ?? 0,
        categoryId: dishData.categoryId ?? null,
        preparationTimeMinutes: dishData.prepTimeMinutes ?? null,
        imageUrl: dishData.imageUrl ?? null,
        is3d: dishData.is3d ?? false,
        glbUrl: dishData.glbUrl ?? null,
        usdzUrl: dishData.usdzUrl ?? null,
      });

      if (!result) {
        toast.error("No se pudo crear el producto.");
        return;
      }

      toast.success("Producto creado correctamente.");
    }

    setIsModalOpen(false);
    setEditingDish(null);
  };

  const handleOpenNewDish = () => {
    setEditingDish(null);
    setIsModalOpen(true);
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingDish(null);
  };

  /*
   * IMPORTANTE:
   *
   * productsLoading solamente representa la carga inicial.
   * saving representa operaciones como editar, crear,
   * desactivar o cambiar disponibilidad.
   *
   * Realtime NO modifica productsLoading.
   */
  const isInitialLoading =
    categoriesLoading || productsLoading || !viewModeReady;

  return (
    <div className="mx-auto space-y-6">
      <MenuHeader onOpenNewDishModal={handleOpenNewDish} />

      <MenuFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isInitialLoading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />

          <p className="mt-3 text-sm text-muted-foreground">Cargando menú...</p>
        </div>
      ) : (
        <MenuProducts
          dishes={filteredDishes}
          viewMode={viewMode}
          onEdit={handleEditDish}
          onDelete={handleDeleteDish}
          onToggleAvailability={handleToggleAvailability}
        />
      )}

      <DishModal
        isOpen={isModalOpen}
        dishToEdit={editingDish}
        categories={productFormCategories}
        onClose={handleCloseModal}
        onSave={handleSaveDish}
      />
    </div>
  );
}
