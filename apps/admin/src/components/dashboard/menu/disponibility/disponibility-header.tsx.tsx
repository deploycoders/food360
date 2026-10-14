"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface StockHeaderProps {
  outOfStockCount: number;
}

export function StockHeader({ outOfStockCount }: StockHeaderProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Disponibilidad de productos
            </h1>
            <p className="text-sm text-muted-foreground">
              Habilita o pausa platillos al instante según el inventario en
              cocina o barra.
            </p>
          </div>
        </div>

        {outOfStockCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold self-start sm:self-auto">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{outOfStockCount} productos agotados actualmente</span>
          </div>
        )}
      </div>
    </div>
  );
}
