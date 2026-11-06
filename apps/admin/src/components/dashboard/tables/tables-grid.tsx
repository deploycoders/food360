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
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center sm:p-10">
        <p className="text-sm font-semibold text-foreground">
          No hay mesas configuradas
        </p>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
          Crea la primera mesa para comenzar a gestionar el salón.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        grid w-full
        grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))]
        items-stretch
        gap-4
        sm:gap-5
      "
    >
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
