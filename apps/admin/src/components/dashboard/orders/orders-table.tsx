"use client";

import React from "react";
import { Order, OrderStatus } from "@/types/order";
import { Eye, Utensils, ShoppingBag, Truck } from "lucide-react";

interface OrdersTableProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

const STATUS_BADGES: Record<OrderStatus, { label: string; style: string }> = {
  all: { label: "Todos", style: "bg-muted text-muted-foreground border-border" },
  pending: {
    label: "Pendiente",
    style: "bg-warning/10 text-warning border-warning/20",
  },
  in_kitchen: {
    label: "En Cocina",
    style: "bg-accent/10 text-accent border-accent/20",
  },
  ready: {
    label: "Listo para Entregar",
    style: "bg-warning/10 text-warning border-warning/20",
  },
  delivered: {
    label: "Entregado",
    style: "bg-success/10 text-success border-success/20",
  },
  paid: {
    label: "Pagado",
    style: "bg-success/10 text-success border-success/20",
  },
  cancelled: {
    label: "Cancelado",
    style: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export function OrdersTable({ orders, onSelectOrder }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No se encontraron órdenes para este filtro.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-mono tracking-wider">
          <tr>
            <th className="px-4 py-3.5 font-semibold">Comanda</th>
            <th className="px-4 py-3.5 font-semibold">Fecha y Hora</th>
            <th className="px-4 py-3.5 font-semibold">Mesa / Tipo</th>
            <th className="px-4 py-3.5 font-semibold">Cliente</th>
            <th className="px-4 py-3.5 font-semibold">Resumen Items</th>
            <th className="px-4 py-3.5 font-semibold text-right">Total</th>
            <th className="px-4 py-3.5 font-semibold text-center">Estado</th>
            <th className="px-4 py-3.5 font-semibold text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60 text-foreground">
          {orders.map((ord) => {
            const badge = STATUS_BADGES[ord.status] || STATUS_BADGES.pending;
            const totalQty = ord.items.reduce((acc, item) => acc + item.qty, 0);

            return (
              <tr
                key={ord.id}
                className="hover:bg-muted/40 transition-colors"
              >
                {/* Comanda */}
                <td className="px-4 py-3.5 font-mono font-bold text-accent whitespace-nowrap">
                  {ord.code}
                </td>

                {/* Fecha y Hora */}
                <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                  {ord.createdAt}
                </td>

                {/* Mesa / Tipo */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    {ord.type === "dine_in" && (
                      <Utensils className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {ord.type === "takeaway" && (
                      <ShoppingBag className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    {ord.type === "delivery" && (
                      <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-foreground">
                      {ord.tableOrDestination}
                    </span>
                  </div>
                </td>

                {/* Cliente */}
                <td className="px-4 py-3.5 font-medium whitespace-nowrap text-foreground">
                  {ord.customerName}
                </td>

                {/* Resumen Items */}
                <td className="px-4 py-3.5 max-w-xs truncate text-foreground">
                  <span className="font-semibold text-foreground mr-1">
                    {totalQty} productos
                  </span>
                  <span className="text-muted-foreground">
                    ({ord.items.map((i) => `${i.qty}x ${i.name}`).join(", ")})
                  </span>
                </td>

                {/* Total */}
                <td className="px-4 py-3.5 font-mono font-bold text-right text-foreground whitespace-nowrap">
                  ${ord.total.toFixed(2)}
                </td>

                {/* Estado */}
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-4 py-3.5 text-center whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onSelectOrder(ord)}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                    title="Ver detalle de orden"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
