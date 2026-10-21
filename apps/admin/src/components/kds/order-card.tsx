"use client";

import React from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  LoaderCircle,
} from "lucide-react";

import type { KDSOrder } from "@/types/kds";

interface OrderCardProps {
  order: KDSOrder;
  isUpdating?: boolean;
  onAdvanceStatus?: (id: string) => void | Promise<void>;
  onRegressStatus?: (id: string) => void | Promise<void>;
}

export function OrderCard({
  order,
  isUpdating = false,
  onAdvanceStatus,
  onRegressStatus,
}: OrderCardProps) {
  const isUrgent = order.timeElapsed >= 20;
  const isWarning = order.timeElapsed >= 10 && order.timeElapsed < 20;

  const canRegress = ["confirmed", "in_kitchen", "ready"].includes(
    order.status,
  );

  const actionLabels: Partial<Record<KDSOrder["status"], string>> = {
    pending: "Aceptar comanda",
    confirmed: "Iniciar cocina",
    in_kitchen: "Marcar listo",
    ready: "Entregar / Despachar",
  };

  const actionLabel = actionLabels[order.status];

  const canAdvance = Boolean(actionLabel);

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border bg-card shadow-lg transition-colors ${
        isUrgent
          ? "border-destructive/70 ring-1 ring-destructive/30"
          : isWarning
            ? "border-warning/50"
            : "border-border"
      }`}
    >
      {/* Cabecera */}
      <header
        className={`flex items-center justify-between border-b px-3.5 py-2.5 ${
          isUrgent
            ? "border-destructive/30 bg-destructive/15 text-destructive"
            : "border-border bg-muted/60 text-foreground"
        }`}
      >
        <div className="min-w-0">
          <span className="block font-mono text-base font-extrabold leading-tight text-accent">
            {order.number}
          </span>
          <span className="block text-xs font-semibold text-foreground">
            {order.table}
          </span>
        </div>

        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-bold ${
            isUrgent
              ? "animate-pulse border-destructive/40 bg-destructive/20 text-destructive"
              : isWarning
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-border bg-muted text-muted-foreground"
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span>{order.timeElapsed} min</span>
        </div>
      </header>

      {/* Alergias */}
      {order.allergyNote && (
        <div className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{order.allergyNote}</span>
        </div>
      )}

      {/* Productos */}
      <div className="flex-1 space-y-2.5 bg-muted/30 p-3.5">
        {order.items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Esta comanda no contiene platillos visibles.
          </p>
        ) : (
          order.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-2.5 text-foreground"
            >
              <div className="text-xs font-bold leading-snug">
                <span className="mr-2 text-sm font-extrabold text-accent">
                  {item.qty}x
                </span>
                {item.name}
              </div>

              {item.notes && (
                <p className="mt-1 w-fit rounded border border-warning/20 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning">
                  ↳ {item.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Acciones */}
      <footer className="flex items-center justify-between gap-2 border-t border-border bg-muted/40 p-2">
        {onRegressStatus && canRegress ? (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => void onRegressStatus(order.id)}
            className="rounded-lg border border-border bg-muted p-2.5 text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
            title="Devolver estado"
            aria-label="Devolver estado"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <div />
        )}

        {onAdvanceStatus && canAdvance && (
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => void onAdvanceStatus(order.id)}
            className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
              order.status === "ready"
                ? "bg-success text-success-foreground shadow-success/20 hover:opacity-95"
                : "bg-accent text-accent-foreground shadow-accent/20 hover:opacity-95"
            }`}
          >
            {isUpdating ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : order.status === "ready" ? (
              <Check className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}

            <span>{isUpdating ? "Guardando..." : actionLabel}</span>
          </button>
        )}
      </footer>
    </article>
  );
}
