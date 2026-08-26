"use client";

import React from "react";
import { StockItem } from "@/types/stock";
import { Clock } from "lucide-react";

interface StockCardProps {
  item: StockItem;
  onToggle: (id: string) => void;
}

export function StockCard({ item, onToggle }: StockCardProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 bg-card ${
        item.isAvailable
          ? "border-border shadow-sm hover:border-accent/40 hover:shadow-md"
          : "border-border/80 opacity-100"
      }`}
    >
      <div>
        {/* Cabecera: Categoría y Estado */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-ring text-white px-2.5 py-1 rounded-md">
            {item.category}
          </span>

          {/* Badge de Estado: Esmeralda cuando está activo, Gris Neutro cuando está agotado */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
              item.isAvailable
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                item.isAvailable ? "bg-emerald-500" : "bg-muted-foreground/60"
              }`}
            />
            {item.isAvailable ? "Disponible" : "Agotado"}
          </span>
        </div>

        {/* Nombre del Producto */}
        <h3
          className={`font-bold text-base mb-1 line-clamp-1 transition-colors ${
            item.isAvailable ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {item.name}
        </h3>

        {/* Tiempo de Preparación */}
        {item.preparationTime && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <Clock className="w-3.5 h-3.5 opacity-70" />
            <span>{item.preparationTime}</span>
          </div>
        )}
      </div>

      {/* Pie de Tarjeta: Precio y Switch de Estado */}
      <div className="flex items-center justify-between pt-3.5 border-t border-border/50 mt-auto">
        <span
          className={`text-lg font-extrabold ${
            item.isAvailable ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          ${item.price.toFixed(2)}
        </span>

        {/* Switch Toggle (Naranja cuando activa, Gris cuando apaga) */}
        <button
          type="button"
          role="switch"
          aria-checked={item.isAvailable}
          onClick={() => onToggle(item.id)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none  focus:ring-offset-2 ${
            item.isAvailable ? "bg-accent" : "bg-muted-foreground"
          }`}
        >
          <span className="sr-only">Cambiar disponibilidad</span>
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              item.isAvailable ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
