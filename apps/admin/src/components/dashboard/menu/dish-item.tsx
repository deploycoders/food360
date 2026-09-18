"use client";

import { motion } from "motion/react";
import { Clock, Edit3, Trash2, Box, Utensils } from "lucide-react";
import type { Dish } from "@/types/menu";

interface DishListItemProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (dishId: string) => void;
  onToggleAvailability: (dishId: string) => void;
}

export function DishListItem({
  dish,
  onEdit,
  onDelete,
  onToggleAvailability,
}: DishListItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      {/* Imagen */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/30">
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Utensils className="h-6 w-6 stroke-1" />
          </div>
        )}
      </div>

      {/* Información */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-bold text-foreground">
            {dish.name}
          </h3>

          {dish.is3d && (
            <span className="hidden items-center gap-1 rounded-md bg-accent/10 px-1.5 py-0.5 text-[9px] font-semibold text-accent sm:flex">
              <Box className="h-3 w-3" />
              3D
            </span>
          )}
        </div>

        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {dish.description || "Sin descripción"}
        </p>

        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{dish.category}</span>

          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {dish.prepTimeMinutes} min
          </span>
        </div>
      </div>

      {/* Precio */}
      <div className="hidden text-right sm:block">
        <span className="font-mono text-sm font-bold">
          ${dish.price.toFixed(2)}
        </span>
      </div>

      {/* Estado */}
      <button
        type="button"
        onClick={() => onToggleAvailability(dish.id)}
        className={`hidden cursor-pointer rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:block ${
          !dish.isActive
            ? "border-border bg-muted text-muted-foreground"
            : dish.isOutOfStock
              ? "border-destructive/20 bg-destructive/10 text-destructive"
              : "border-success/20 bg-success/10 text-success"
        }`}
      >
        {!dish.isActive
          ? "Desactivado"
          : dish.isOutOfStock
            ? "Agotado"
            : "En Carta"}
      </button>

      {/* Acciones */}
      <div className="flex items-center gap-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onEdit(dish)}
          className="cursor-pointer rounded-lg bg-muted p-2 text-muted-foreground hover:text-foreground"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onDelete(dish.id)}
          className="cursor-pointer rounded-lg bg-muted p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
