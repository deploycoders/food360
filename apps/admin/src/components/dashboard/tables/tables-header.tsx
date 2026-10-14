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
          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground shadow-md shadow-accent/20 transition-all duration-200 hover:opacity-95 active:scale-[0.98] min-[700px]:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Mesa</span>
        </button>
      )}
    </div>
  );
}
