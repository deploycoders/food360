"use client";

import { useState } from "react";
import type { Dish } from "@/types/menu";
import { useCategories } from "@/context/CategoriesContext";
import { MenuHeader } from "@/components/dashboard/menu/menu-header";
import { MenuFilters } from "@/components/dashboard/menu/menu-filters";
import { DishCard } from "@/components/dashboard/menu/dish-card";
import { DishModal } from "@/components/dashboard/menu/dish-modal";

const INITIAL_DISHES: Dish[] = [
  {
    id: "1",
    name: "Hamburguesa Trufada Angus",
    description:
      "200g de carne angus madurada, mayonesa de trufa negra, queso cheddar añejo y cebolla caramelizada.",
    price: 18.5,
    prepTimeMinutes: 15,
    categoryId: "mock-hamburguesas",
    is3d: false,
    isActive: true,
    isOutOfStock: false,
  },
  {
    id: "2",
    name: "Pizza Napolitana Burrata",
    description:
      "Masa fermentada 48h, salsa de tomate San Marzano, mozzarella fresca, burrata cremosa y albahaca fresca.",
    price: 22,
    prepTimeMinutes: 12,
    categoryId: "mock-pizzas",
    is3d: false,
    isActive: true,
    isOutOfStock: false,
  },
  {
    id: "3",
    name: "Costillas BBQ Ahumadas 500g",
    description:
      "Costillas de cerdo ahumadas con madera de manzano durante 6 horas, glaseadas con salsa barbacoa de la casa.",
    price: 28,
    prepTimeMinutes: 20,
    categoryId: "mock-carnes",
    is3d: false,
    isActive: true,
    isOutOfStock: false,
  },
  {
    id: "4",
    name: "Poke Bowl Salmón Fresco",
    description:
      "Base de arroz de sushi, salmón noruego marinado en soja y sésamo, aguacate, edamame, mango y alga nori.",
    price: 17.5,
    prepTimeMinutes: 10,
    categoryId: "mock-bowls",
    is3d: false,
    isActive: true,
    isOutOfStock: true,
  },
  {
    id: "5",
    name: "Cerveza Artesanal IPA Doble Lúpulo",
    description:
      "Cerveza artesanal de tirador con aroma cítrico y notas florales intensas (6.5% ABV).",
    price: 6.5,
    prepTimeMinutes: 3,
    categoryId: "mock-bebidas",
    is3d: false,
    isActive: true,
    isOutOfStock: false,
  },
];

export default function MenuPage() {
  const { categories, loading: categoriesLoading } = useCategories();

  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === "Todos" || dish.categoryId === selectedCategory;

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleToggleAvailability = (dishId: string) => {
    setDishes((prev) =>
      prev.map((dish) =>
        dish.id === dishId
          ? { ...dish, isOutOfStock: !dish.isOutOfStock }
          : dish,
      ),
    );
  };

  const handleDeleteDish = (dishId: string) => {
    if (confirm("¿Estás seguro de eliminar este platillo?")) {
      setDishes((prev) => prev.filter((dish) => dish.id !== dishId));
    }
  };

  const handleSaveDish = (dishData: Partial<Dish>) => {
    if (editingDish) {
      setDishes((prev) =>
        prev.map((dish) =>
          dish.id === editingDish.id ? { ...dish, ...dishData } : dish,
        ),
      );
    } else {
      const newDish: Dish = {
        id: Date.now().toString(),
        name: dishData.name || "Nuevo Platillo",
        description: dishData.description || "",
        price: dishData.price || 0,
        prepTimeMinutes: dishData.prepTimeMinutes || 10,
        categoryId: dishData.categoryId || categories[0]?.id || "",
        is3d: dishData.is3d ?? false,
        isActive: dishData.isActive ?? true,
        isOutOfStock: dishData.isOutOfStock ?? false,
        imageUrl: dishData.imageUrl,
        glbUrl: dishData.glbUrl,
        usdzUrl: dishData.usdzUrl,
      };

      setDishes((prev) => [newDish, ...prev]);
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
    setIsModalOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="mx-auto space-y-6">
      <MenuHeader onOpenNewDishModal={handleOpenNewDish} />

      <MenuFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {categoriesLoading ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="mt-3 text-sm text-muted-foreground">
            Cargando categorías...
          </p>
        </div>
      ) : filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={handleEditDish}
              onDelete={handleDeleteDish}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron platillos que coincidan con la búsqueda.
          </p>
        </div>
      )}

      <DishModal
        isOpen={isModalOpen}
        dishToEdit={editingDish}
        categories={categories}
        onClose={handleCloseModal}
        onSave={handleSaveDish}
      />
    </div>
  );
}
