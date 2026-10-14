"use client";

import React from "react";
import { Eye, Utensils, ShoppingBag, Truck, ClipboardList } from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  loading?: boolean;
}

const STATUS_BADGES: Record<
  Exclude<OrderStatus, "all">,
  { label: string; style: string }
> = {
  pending: {
    label: "Pendiente",
    style: "border-warning/20 bg-warning/10 text-warning",
  },
  confirmed: {
    label: "Confirmada",
    style: "border-accent/20 bg-accent/10 text-accent",
  },
  in_kitchen: {
    label: "En preparación",
    style: "border-accent/20 bg-accent/10 text-accent",
  },
  ready: {
    label: "Lista",
    style: "border-success/20 bg-success/10 text-success",
  },
  served: {
    label: "Entregada",
    style: "border-success/20 bg-success/10 text-success",
  },
  completed: {
    label: "Completada",
    style: "border-success/20 bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelada",
    style: "border-destructive/20 bg-destructive/10 text-destructive",
  },
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function OrderTypeIcon({ type }: { type: Order["type"] }) {
  const className = "h-4 w-4 shrink-0 text-muted-foreground";

  switch (type) {
    case "dine_in":
      return <Utensils aria-hidden="true" className={className} />;
    case "takeaway":
      return <ShoppingBag aria-hidden="true" className={className} />;
    case "delivery":
      return <Truck aria-hidden="true" className={className} />;
    default:
      return <ClipboardList aria-hidden="true" className={className} />;
  }
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const badge = STATUS_BADGES[status];

  return (
    <span
      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.style}`}
    >
      {badge.label}
    </span>
  );
}

function OrderItemsSummary({ order }: { order: Order }) {
  const quantity = order.items.reduce((total, item) => total + item.qty, 0);

  return (
    <div className="min-w-0">
      <p className="font-semibold text-foreground">
        {quantity} {quantity === 1 ? "producto" : "productos"}
      </p>
      <p className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
        {order.items.length
          ? order.items.map((item) => `${item.qty}× ${item.name}`).join(", ")
          : "Sin productos"}
      </p>
    </div>
  );
}

export function OrdersTable({
  orders,
  onSelectOrder,
  loading = false,
}: OrdersTableProps) {
  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Cargando órdenes">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
        <div className="mb-3 rounded-2xl bg-muted p-3">
          <ClipboardList
            aria-hidden="true"
            className="h-6 w-6 text-muted-foreground"
          />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          No hay órdenes para mostrar
        </h3>
        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
          Prueba con otro estado, una fecha diferente o una búsqueda más amplia.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Móvil: tarjetas */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-accent/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-accent">
                  {order.code}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">
                  {order.customerName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <StatusBadge status={order.status} />
            </div>

            <div className="my-3 flex items-center gap-2 border-y border-border/70 py-3">
              <OrderTypeIcon type={order.type} />
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                {order.tableOrDestination}
              </span>
              <span className="ml-auto shrink-0 text-sm font-bold text-foreground">
                {formatMoney(order.total)}
              </span>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <OrderItemsSummary order={order} />
              </div>

              <button
                type="button"
                onClick={() => onSelectOrder(order)}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 text-xs font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Ver detalle de la orden ${order.code}`}
              >
                <Eye aria-hidden="true" className="h-4 w-4" />
                Ver detalle
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-4 font-semibold">Orden</th>
                <th className="px-4 py-4 font-semibold">Cliente</th>
                <th className="px-4 py-4 font-semibold">Origen</th>
                <th className="px-4 py-4 font-semibold">Productos</th>
                <th className="px-4 py-4 text-right font-semibold">Total</th>
                <th className="px-4 py-4 font-semibold">Estado</th>
                <th className="px-4 py-4 text-right font-semibold">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/70">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-4">
                    <p className="font-mono text-xs font-bold text-accent">
                      {order.code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">
                      {order.customerName}
                    </p>
                    {order.customerPhone && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.customerPhone}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <OrderTypeIcon type={order.type} />
                      <span className="text-xs text-foreground">
                        {order.tableOrDestination}
                      </span>
                    </div>
                  </td>

                  <td className="max-w-65 px-4 py-4">
                    <OrderItemsSummary order={order} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-right font-semibold tabular-nums text-foreground">
                    {formatMoney(order.total)}
                  </td>

                  <td className="whitespace-nowrap px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      aria-label={`Ver detalle de la orden ${order.code}`}
                      title="Ver detalle"
                    >
                      <Eye aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
