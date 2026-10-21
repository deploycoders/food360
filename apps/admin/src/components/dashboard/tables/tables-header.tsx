"use client";

import React from "react";
import { Plus } from "lucide-react";

interface TablesHeaderProps {
  totalTables: number;
  onCreateTable: () => void;
  canManage: boolean;
}

export function TablesHeader({
  totalTables,
  onCreateTable,
  canManage,
}: TablesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Mesas
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Gestiona las mesas del restaurante y consulta su estado operativo.
        </p>

        <p className="text-[11px] text-muted-foreground mt-2">
          {totalTables === 0
            ? "No hay mesas configuradas"
            : `${totalTables} ${
                totalTables === 1 ? "mesa configurada" : "mesas configuradas"
              }`}
        </p>
      </div>

      {canManage && (
        <button
          type="button"
          onClick={onCreateTable}
          className="inline-flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Mesa</span>
        </button>
      )}
    </div>
  );
}
