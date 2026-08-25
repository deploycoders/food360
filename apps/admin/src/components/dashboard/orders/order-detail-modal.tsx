"use client";

import React from "react";
import { Order } from "@/types/order";
import {
  X,
  Printer,
  CreditCard,
  AlertOctagon,
} from "lucide-react";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: Order["status"]) => void;
}

export function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground font-mono">
              Detalle de Comanda
            </span>
            <h2 className="text-lg font-bold font-mono text-accent">
              {order.code}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Info Principal */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border border-border">
            <div>
              <span className="text-muted-foreground block">Cliente:</span>
              <span className="font-semibold text-foreground">
                {order.customerName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Ubicación:</span>
              <span className="font-semibold text-foreground">
                {order.tableOrDestination}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Fecha y Hora:</span>
              <span className="text-foreground font-mono">
                {order.createdAt}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Método de Pago:</span>
              <span className="text-foreground font-semibold">
                {order.paymentMethod || "Pendiente"}
              </span>
            </div>
          </div>

          {/* Desglose de Productos */}
          <div>
            <h3 className="font-bold text-foreground mb-2 uppercase text-[11px] tracking-wider">
              Productos Solicitados
            </h3>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-muted/20 rounded-lg border border-border flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-accent mr-2">
                      {item.qty}x
                    </span>
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                    {item.notes && (
                      <p className="text-[10px] text-warning mt-0.5">
                        ↳ {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-semibold text-foreground">
                    ${(item.unitPrice * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de Pago */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 font-mono">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Impuestos / IVA:</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border">
              <span>Total:</span>
              <span className="text-accent">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Acciones */}
        <div className="p-4 bg-muted/40 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg font-semibold text-xs flex items-center gap-1.5 border border-border transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Ticket</span>
          </button>

          <div className="flex items-center gap-2">
            {order.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                className="px-3 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
            )}

            {order.status !== "paid" && (
              <button
                type="button"
                onClick={() => onUpdateStatus(order.id, "paid")}
                className="px-3.5 py-2 bg-success hover:opacity-95 text-success-foreground rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-success/20 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Marcar Cobrado</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
