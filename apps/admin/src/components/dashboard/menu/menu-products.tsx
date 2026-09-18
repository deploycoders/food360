"use client";

import { AnimatePresence, motion } from "motion/react";

import type { Dish } from "@/types/menu";

import { DishCard } from "@/components/dashboard/menu/dish-card";
import { DishListItem } from "@/components/dashboard/menu/dish-item";

interface MenuProductsProps {
  dishes: Dish[];
  viewMode: "grid" | "list";

  onEdit: (dish: Dish) => void;
  onDelete: (dishId: string) => void;
  onToggleAvailability: (dishId: string) => void;
}

export function MenuProducts({
  dishes,
  viewMode,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuProductsProps) {
  if (dishes.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No se encontraron platillos que coincidan con la búsqueda.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      {viewMode === "grid" ? (
        <motion.div
          layout
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {dishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAvailability={onToggleAvailability}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div layout className="flex flex-col gap-3">
          {dishes.map((dish) => (
            <DishListItem
              key={dish.id}
              dish={dish}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAvailability={onToggleAvailability}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
