"use client";

import React from "react";
import { Clock } from "lucide-react";

import { DisponibilityItem } from "@/types/disponibility";

interface StockCardProps {
  item: DisponibilityItem;
  onToggle: (id: string) => void;
  canManage: boolean;
}

export function StockCard({ item, onToggle, canManage }: StockCardProps) {
  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border bg-card p-5 transition-all duration-200 ${
        item.isAvailable
          ? "border-border shadow-sm hover:border-accent/40 hover:shadow-md"
          : "border-border/80 opacity-100"
      }`}
    >
      <div>
        {/* Cabecera: Categoría y Estado */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="rounded-md bg-ring px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {item.category}
          </span>

          {/* Estado */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
              item.isAvailable
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                item.isAvailable ? "bg-emerald-500" : "bg-muted-foreground/60"
              }`}
            />

            {item.isAvailable ? "Disponible" : "Agotado"}
          </span>
        </div>

        {/* Nombre del Producto */}
        <h3
          className={`mb-1 line-clamp-1 text-base font-bold transition-colors ${
            item.isAvailable ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {item.name}
        </h3>

        {/* Tiempo de Preparación */}
        {item.preparationTime && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 opacity-70" />

            <span>{item.preparationTime}</span>
          </div>
        )}
      </div>

      {/* Pie de Tarjeta */}
      <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3.5">
        <span
          className={`text-lg font-extrabold ${
            item.isAvailable ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          ${item.price.toFixed(2)}
        </span>

        {canManage ? (
          /* Switch Toggle */
          <button
            type="button"
            role="switch"
            aria-checked={item.isAvailable}
            aria-label={
              item.isAvailable
                ? `Marcar ${item.name} como agotado`
                : `Marcar ${item.name} como disponible`
            }
            onClick={() => onToggle(item.id)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 ${
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
        ) : (
          /* Solo lectura */
          <span
            className={`text-[10px] font-medium uppercase tracking-wider ${
              item.isAvailable
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground"
            }`}
          >
            Solo lectura
          </span>
        )}
      </div>
    </div>
  );
}
