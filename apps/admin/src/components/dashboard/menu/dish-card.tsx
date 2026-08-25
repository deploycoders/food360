"use client";

import React from "react";
import { Dish } from "@/types/menu";
import { Clock, Edit3, Trash2, Box, Utensils } from "lucide-react";

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
  return (
    <div className="group relative bg-card hover:bg-card/90 border border-border rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between hover:shadow-lg shadow-sm hover:-translate-y-0.5">
      {/* Header Card: Badges y Switch */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-muted text-muted-foreground text-[10px] font-medium border border-border">
              {dish.category}
            </span>

            {dish.model3dUrl && (
              <span
                className="px-2 py-1 rounded-lg bg-accent/10 text-accent text-[10px] font-semibold border border-accent/20 flex items-center gap-1"
                title="Incluye Vista 3D / AR"
              >
                <Box className="w-3 h-3" />
                <span>3D</span>
              </span>
            )}
          </div>

          {/* Switch de Disponibilidad */}
          <button
            type="button"
            onClick={() => onToggleAvailability(dish.id)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all duration-200 flex items-center gap-1.5 ${
              dish.isAvailable
                ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                dish.isAvailable ? "bg-success animate-pulse" : "bg-destructive"
              }`}
            />
            <span>{dish.isAvailable ? "En Carta" : "Agotado"}</span>
          </button>
        </div>

        {/* Imagen / Placeholder Icon */}
        <div className="relative w-full h-32 mb-3.5 bg-muted/40 rounded-xl border border-border overflow-hidden flex items-center justify-center transition-colors">
          {dish.imageUrl ? (
            <img
              src={dish.imageUrl}
              alt={dish.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground transition-colors">
              <Utensils className="w-7 h-7 stroke-1" />
              <span className="text-[10px]">Sin imagen asignada</span>
            </div>
          )}
        </div>

        {/* Título & Tiempo */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {dish.name}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span>{dish.prepTimeMinutes} min de cocina</span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {dish.description}
          </p>
        </div>
      </div>

      {/* Footer Card: Precio y Acciones */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-base font-extrabold font-mono text-foreground">
          ${dish.price.toFixed(2)}
        </span>

        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(dish)}
            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Editar platillo"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(dish.id)}
            className="p-1.5 rounded-lg bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
            title="Eliminar platillo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
