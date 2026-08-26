"use client";

import React from "react";
import { Plus, SlidersHorizontal, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

interface MenuHeaderProps {
  onOpenNewDishModal: () => void;
}

export function MenuHeader({ onOpenNewDishModal }: MenuHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Gestión de Carta y Menú
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Administra los platillos, precios, descripciones y disponibilidad de
          tu restaurante.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Link
          href="/menu/stock"
          className="px-3.5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground text-xs font-medium flex items-center gap-2 transition-all duration-200 active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>Control Rápido de Stock</span>
        </Link>

        <button
          type="button"
          onClick={onOpenNewDishModal}
          className="px-4 py-2.5 rounded-xl cursor-pointer bg-accent hover:opacity-95 text-accent-foreground text-xs font-semibold flex items-center gap-2 transition-all duration-200 shadow-md shadow-accent/20 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nuevo Platillo</span>
        </button>
      </div>
    </div>
  );
}
