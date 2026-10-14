"use client";

import React from "react";
import type { Table } from "@food360/types";

import { TableCard } from "./table-card";

interface TablesGridProps {
  tables: Table[];
  canManage: boolean;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onShowQr: (table: Table) => void;
}

export function TablesGrid({
  tables,
  canManage,
  onEdit,
  onDelete,
  onShowQr,
}: TablesGridProps) {
  if (tables.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <p className="text-sm font-semibold text-foreground">
          No hay mesas configuradas
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Crea la primera mesa para comenzar a gestionar el salón.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          canManage={canManage}
          onEdit={onEdit}
          onDelete={onDelete}
          onShowQr={onShowQr}
        />
      ))}
    </div>
  );
}
