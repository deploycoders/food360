"use client";

import React from "react";
import {
  X,
  Printer,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  ClipboardCheck,
  Ban,
  LoaderCircle,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (
    orderId: string,
    newStatus: OrderStatus,
  ) => void | Promise<void>;
  updating?: boolean;
}

const NEXT_ACTIONS: Partial<
  Record<
    Exclude<OrderStatus, "all">,
    {
      status: Exclude<OrderStatus, "all">;
      label: string;
      icon: React.ReactNode;
    }
  >
> = {
  pending: {
    status: "confirmed",
    label: "Confirmar orden",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  confirmed: {
    status: "in_kitchen",
    label: "Iniciar preparación",
    icon: <ChefHat className="h-4 w-4" />,
  },
  in_kitchen: {
    status: "ready",
    label: "Marcar como lista",
    icon: <PackageCheck className="h-4 w-4" />,
  },
  ready: {
    status: "served",
    label: "Marcar como entregada",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  served: {
    status: "completed",
    label: "Completar orden",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

const STATUS_LABELS: Record<Exclude<OrderStatus, "all">, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_kitchen: "En preparación",
  ready: "Lista",
  served: "Entregada",
  completed: "Completada",
  cancelled: "Cancelada",
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
  updating = false,
}: OrderDetailModalProps) {
  if (!order) return null;

  const nextAction = NEXT_ACTIONS[order.status];
  const canCancel =
    order.status !== "cancelled" && order.status !== "completed";

  const handleUpdate = async (status: Exclude<OrderStatus, "all">) => {
    await onUpdateStatus(order.id, status);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !updating) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-border bg-muted/30 p-4 sm:p-5">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Detalle de orden</p>
            <h2
              id="order-detail-title"
              className="mt-1 truncate font-mono text-lg font-bold text-accent"
            >
              {order.code}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            aria-label="Cerrar detalle"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 overflow-y-auto p-4 sm:p-5">
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-border bg-muted/20 p-3 sm:p-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="mt-1 wrap-break-word text-sm font-semibold text-foreground">
                {order.customerName}
              </p>
              {order.customerPhone && (
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  {order.customerPhone}
                </p>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {STATUS_LABELS[order.status]}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">
                Ubicación / origen
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {order.tableOrDestination}
              </p>
            </div>

            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Fecha de creación</p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Productos solicitados
            </h3>

            {order.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Esta orden no tiene productos registrados.
              </p>
            ) : (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        <span className="mr-2 font-mono font-bold text-accent">
                          {item.qty}×
                        </span>
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatMoney(item.unitPrice)} por unidad
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {formatMoney(item.unitPrice * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-muted-foreground">
                Total de la orden
              </span>
              <span className="text-xl font-bold tabular-nums text-accent">
                {formatMoney(order.total)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Importe total registrado por el servidor. Los impuestos y pagos no
              se desglosan mientras la API no proporcione esos datos.
            </p>
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <button
            type="button"
            onClick={() => window.print()}
            disabled={updating}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            {canCancel && (
              <button
                type="button"
                onClick={() => void handleUpdate("cancelled")}
                disabled={updating}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 text-sm font-semibold text-destructive transition hover:bg-destructive/15 disabled:opacity-50"
              >
                <Ban className="h-4 w-4" />
                Cancelar orden
              </button>
            )}

            {nextAction && (
              <button
                type="button"
                onClick={() => void handleUpdate(nextAction.status)}
                disabled={updating}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  nextAction.icon
                )}
                {updating ? "Guardando..." : nextAction.label}
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}
