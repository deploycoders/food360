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
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md">
      {/* Acento superior */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-accent/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Número e identificación */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-105">
            <Utensils className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Mesa
            </p>

            <h3 className="mt-0.5 whitespace-nowrap text-3xl font-bold leading-none tracking-tight text-foreground tabular-nums">
              #{table.tableNumber}
            </h3>
          </div>

          <span className="shrink-0 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-semibold text-success">
            Libre
          </span>
        </div>

        {/* Estado */}
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/40" />

              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>

            <span className="truncate text-xs font-medium text-foreground">
              Disponible
            </span>
          </div>

          <span className="shrink-0 text-[10px] text-muted-foreground">
            En espera
          </span>
        </div>

        {/* Acciones */}
        {canManage && (
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onShowQr(table)}
              className="flex min-w-0 min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/50 px-2 text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent/10 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              title={`Ver QR de mesa #${table.tableNumber}`}
              aria-label={`Ver QR de mesa #${table.tableNumber}`}
            >
              <QrCode className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-semibold">QR</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(table)}
              className="flex min-w-0 min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/50 px-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              title={`Editar mesa #${table.tableNumber}`}
              aria-label={`Editar mesa #${table.tableNumber}`}
            >
              <Pencil className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-semibold">Editar</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(table)}
              className="flex min-w-0 min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-background/50 px-2 text-muted-foreground transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive"
              title={`Eliminar mesa #${table.tableNumber}`}
              aria-label={`Eliminar mesa #${table.tableNumber}`}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-semibold">Eliminar</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
