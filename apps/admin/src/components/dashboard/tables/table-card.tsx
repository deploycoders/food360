"use client";

import React from "react";
import { Pencil, QrCode, Trash2, Utensils } from "lucide-react";

import type { Table } from "@food360/types";

interface TableCardProps {
  table: Table;
  canManage: boolean;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
  onShowQr: (table: Table) => void;
}

export function TableCard({
  table,
  canManage,
  onEdit,
  onDelete,
  onShowQr,
}: TableCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-accent/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-105">
              <Utensils className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Mesa
              </p>

              <h3 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-foreground">
                #{table.tableNumber}
              </h3>
            </div>
          </div>

          {canManage && (
            <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-background/50 p-1">
              <button
                type="button"
                onClick={() => onShowQr(table)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                title={`Ver QR de mesa #${table.tableNumber}`}
                aria-label={`Ver QR de mesa #${table.tableNumber}`}
              >
                <QrCode className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onEdit(table)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title={`Editar mesa #${table.tableNumber}`}
                aria-label={`Editar mesa #${table.tableNumber}`}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(table)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title={`Eliminar mesa #${table.tableNumber}`}
                aria-label={`Eliminar mesa #${table.tableNumber}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
            </span>

            <span className="text-xs font-medium text-foreground">Libre</span>
          </div>

          <span className="text-[10px] font-medium text-muted-foreground">
            Disponible
          </span>
        </div>
      </div>
    </div>
  );
}
