"use client";

import React, { useState } from "react";
import { Dish } from "@/types/menu";
import { MenuHeader } from "@/components/dashboard/menu/menu-header";
import { MenuFilters } from "@/components/dashboard/menu/menu-filters";
import { DishCard } from "@/components/dashboard/menu/dish-card";
import { DishModal } from "@/components/dashboard/menu/dish-modal";

const CATEGORIES = [
  "Todos",
  "Hamburguesas",
  "Pizzas",
  "Carnes & Brasas",
  "Bowls & Saludable",
  "Bebidas",
];

const INITIAL_DISHES: Dish[] = [
  {
    id: "1",
    name: "Hamburguesa Trufada Angus",
    description:
      "200g de carne angus madurada, mayonesa de trufa negra, queso cheddar añejo y cebolla caramelizada.",
    price: 18.5,
    prepTimeMinutes: 15,
    category: "Hamburguesas",
    isAvailable: true,
  },
  {
    id: "2",
    name: "Pizza Napolitana Burrata",
    description:
      "Masa fermentada 48h, salsa de tomate San Marzano, mozzarella fresca, burrata cremosa y albahaca fresca.",
    price: 22.0,
    prepTimeMinutes: 12,
    category: "Pizzas",
    isAvailable: true,
  },
  {
    id: "3",
    name: "Costillas BBQ Ahumadas 500g",
    description:
      "Costillas de cerdo ahumadas con madera de manzano durante 6 horas, glaseadas con salsa barbacoa de la casa.",
    price: 28.0,
    prepTimeMinutes: 20,
    category: "Carnes & Brasas",
    isAvailable: true,
  },
  {
    id: "4",
    name: "Poke Bowl Salmón Fresco",
    description:
      "Base de arroz de sushi, salmón noruego marinado en soja y sésamo, aguacate, edamame, mango y alga nori.",
    price: 17.5,
    prepTimeMinutes: 10,
    category: "Bowls & Saludable",
    isAvailable: false,
  },
  {
    id: "5",
    name: "Cerveza Artesanal IPA Doble Lúpulo",
    description:
      "Cerveza artesanal de tirador con aroma cítrico y notas florales intensas (6.5% ABV).",
    price: 6.5,
    prepTimeMinutes: 3,
    category: "Bebidas",
    isAvailable: true,
  },
];

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>(INITIAL_DISHES);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  // Filtrado reactivo
  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === "Todos" || dish.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      dish.name.toLowerCase().includes(query) ||
      dish.description.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleToggleAvailability = (dishId: string) => {
    setDishes((prev) =>
      prev.map((d) =>
        d.id === dishId ? { ...d, isAvailable: !d.isAvailable } : d,
      ),
    );
  };

  const handleDeleteDish = (dishId: string) => {
    if (confirm("¿Estás seguro de eliminar este platillo?")) {
      setDishes((prev) => prev.filter((d) => d.id !== dishId));
    }
  };

  const handleSaveDish = (dishData: Partial<Dish>) => {
    if (editingDish) {
      setDishes((prev) =>
        prev.map((d) =>
          d.id === editingDish.id ? ({ ...d, ...dishData } as Dish) : d,
        ),
      );
    } else {
      const newDish: Dish = {
        id: Date.now().toString(),
        name: dishData.name || "Nuevo Platillo",
        description: dishData.description || "",
        price: dishData.price || 0,
        prepTimeMinutes: dishData.prepTimeMinutes || 10,
        category: dishData.category || "Hamburguesas",
        isAvailable: dishData.isAvailable ?? true,
        imageUrl: dishData.imageUrl,
        model3dUrl: dishData.model3dUrl,
      };
      setDishes((prev) => [newDish, ...prev]);
    }
    setIsModalOpen(false);
    setEditingDish(null);
  };

  return (
    <div className="space-y-6 mx-auto">
      <MenuHeader
        onOpenNewDishModal={() => {
          setEditingDish(null);
          setIsModalOpen(true);
        }}
      />

      <MenuFilters
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Grid Responsive de Platillos */}
      {filteredDishes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={(d) => {
                setEditingDish(d);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteDish}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No se encontraron platillos que coincidan con la búsqueda.
          </p>
        </div>
      )}

      <DishModal
        isOpen={isModalOpen}
        dishToEdit={editingDish}
        categories={CATEGORIES}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDish(null);
        }}
        onSave={handleSaveDish}
      />
    </div>
  );
}
