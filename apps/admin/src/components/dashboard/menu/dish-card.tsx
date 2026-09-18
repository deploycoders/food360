"use client";

import { motion } from "motion/react";
import { Clock, Edit3, Trash2, Box, Utensils } from "lucide-react";
import type { Dish } from "@/types/menu";

interface DishCardProps {
  dish: Dish;
  onEdit: (dish: Dish) => void;
  onDelete: (dishId: string) => void;
  onToggleAvailability: (dishId: string) => void;
}

export function DishCard({
  dish,
  onEdit,
  onDelete,
  onToggleAvailability,
}: DishCardProps) {
  const status = !dish.isActive
    ? "Desactivado"
    : dish.isOutOfStock
      ? "Agotado"
      : "En Carta";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg border border-border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              {dish.category}
            </span>

            {dish.is3d && (
              <span className="flex items-center gap-1 rounded-lg border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-semibold text-accent">
                <Box className="h-3 w-3" />
                3D
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleAvailability(dish.id)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all ${
              !dish.isActive
                ? "border-muted-foreground/20 bg-muted text-muted-foreground"
                : dish.isOutOfStock
                  ? "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "border-success/20 bg-success/10 text-success hover:bg-success/20"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                !dish.isActive
                  ? "bg-muted-foreground"
                  : dish.isOutOfStock
                    ? "bg-destructive"
                    : "animate-pulse bg-success"
              }`}
            />

            {status}
          </button>
        </div>

        {/* Imagen */}
        <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted/30">
          {dish.imageUrl ? (
            <motion.img
              src={dish.imageUrl}
              alt={dish.name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Utensils className="h-8 w-8 stroke-1" />
              <span className="text-[10px]">Sin imagen asignada</span>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="space-y-1">
          <h3 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-accent">
            {dish.name}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 opacity-60" />
            <span>{dish.prepTimeMinutes} min de cocina</span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {dish.description || "Sin descripción"}
          </p>

          {!dish.isActive && dish.deactivationReason && (
            <div className="mt-3 rounded-lg border border-border bg-muted/50 px-2.5 py-2 text-[10px] text-muted-foreground">
              <span className="font-semibold">Motivo:</span>{" "}
              {dish.deactivationReason}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="font-mono text-base font-extrabold text-foreground">
          ${dish.price.toFixed(2)}
        </span>

        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onEdit(dish)}
            className="cursor-pointer rounded-lg bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
            title="Editar platillo"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </motion.button>

          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onDelete(dish.id)}
            className="cursor-pointer rounded-lg bg-muted p-1.5 text-muted-foreground transition-colors hover:bg-destructive/20 hover:text-destructive"
            title="Eliminar platillo"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
