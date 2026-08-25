"use client";

import React from "react";
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  notes?: string;
}

export interface Order {
  id: string;
  number: string;
  table: string;
  timeElapsed: number;
  allergyNote?: string;
  items: OrderItem[];
  status: "pending" | "in_prep" | "ready";
}

interface OrderCardProps {
  order: Order;
  onAdvanceStatus?: (id: string) => void;
  onRegressStatus?: (id: string) => void;
}

export function OrderCard({
  order,
  onAdvanceStatus,
  onRegressStatus,
}: OrderCardProps) {
  const isUrgent = order.timeElapsed >= 20;
  const isWarning = order.timeElapsed >= 10 && order.timeElapsed < 20;

  return (
    <div
      className={`rounded-xl border flex flex-col bg-card shadow-lg overflow-hidden transition-colors ${
        isUrgent
          ? "border-destructive/70 ring-1 ring-destructive/30"
          : isWarning
            ? "border-warning/50"
            : "border-border"
      }`}
    >
      {/* Cabecera del Ticket */}
      <div
        className={`px-3.5 py-2.5 flex items-center justify-between border-b ${
          isUrgent
            ? "bg-destructive/15 border-destructive/30 text-destructive"
            : "bg-muted/60 border-border text-foreground"
        }`}
      >
        <div>
          <span className="font-mono font-extrabold text-base text-accent block leading-tight">
            {order.number}
          </span>
          <span className="text-xs font-semibold text-foreground">
            {order.table}
          </span>
        </div>

        {/* Contador de Tiempo */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-bold ${
            isUrgent
              ? "bg-destructive/20 text-destructive border border-destructive/40 animate-pulse"
              : isWarning
                ? "bg-warning/10 text-warning border border-warning/30"
                : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{order.timeElapsed} min</span>
        </div>
      </div>

      {/* Alerta de Alergias */}
      {order.allergyNote && (
        <div className="px-3 py-2 bg-destructive/20 border-b border-destructive/30 flex items-start gap-2 text-destructive text-xs font-bold">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <span>{order.allergyNote}</span>
        </div>
      )}

      {/* Lista de Platillos */}
      <div className="p-3.5 space-y-2.5 flex-1 bg-muted/30">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-lg bg-card border border-border text-foreground"
          >
            <div className="text-xs font-bold leading-snug">
              <span className="text-accent font-extrabold text-sm mr-2">
                {item.qty}x
              </span>
              {item.name}
            </div>
            {item.notes && (
              <p className="text-[11px] text-warning mt-1 font-medium bg-warning/10 px-2 py-0.5 rounded w-fit border border-warning/20">
                ↳ {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Botones de Acción */}
      <div className="p-2 bg-muted/40 border-t border-border flex items-center justify-between gap-2">
        {onRegressStatus && order.status !== "pending" ? (
          <button
            type="button"
            onClick={() => onRegressStatus(order.id)}
            className="p-2.5 rounded-lg bg-muted cursor-pointer hover:bg-muted/80 text-foreground border border-border transition-colors"
            title="Devolver estado"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        ) : (
          <div />
        )}

        {onAdvanceStatus && (
          <button
            type="button"
            onClick={() => onAdvanceStatus(order.id)}
            className={`flex-1 h-10 px-3 cursor-pointer rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
              order.status === "ready"
                ? "bg-success hover:opacity-95 text-success-foreground shadow-success/20"
                : "bg-accent hover:opacity-95 text-accent-foreground shadow-accent/20"
            }`}
          >
            {order.status === "ready" ? (
              <>
                <Check className="w-4 h-4" />
                <span>Entregar / Despachar</span>
              </>
            ) : (
              <>
                <span>
                  {order.status === "pending"
                    ? "Iniciar Cocina"
                    : "Marcar Listo"}
                </span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
