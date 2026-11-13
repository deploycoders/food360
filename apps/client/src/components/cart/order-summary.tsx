"use client";

import { formatCurrency, formatOriginLabel } from "@/lib/formatters";
import type { OrderOrigin } from "@/types";

interface OrderSummaryProps {
  totalPrice: number;
  totalItems: number;
  origin: OrderOrigin;
  tableNumber: number | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function OrderSummary({
  totalPrice,
  totalItems,
  origin,
  tableNumber,
  onSubmit,
  isSubmitting,
}: OrderSummaryProps) {
  const originLabel =
    formatOriginLabel(origin, tableNumber) ?? "Origen pendiente";

  return (
    <div className="glass-card animate-fade-in-up rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <h3 className="mb-4 text-base font-bold text-(--color-text-main)">
        Resumen de la Cuenta
      </h3>

      {/* Order origin */}
      <div className="mb-5 flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 py-2.5">
        <span className="text-xs font-semibold text-(--color-accent)">
          {originLabel}
        </span>
      </div>

      {/* Order totals */}
      <div className="mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-(--color-text-muted)">
            Items ({totalItems})
          </span>

          <span className="font-medium tabular-nums text-(--color-text-main)">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-(--color-text-muted)">Subtotal</span>

          <span className="font-medium tabular-nums text-(--color-text-main)">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <div className="flex justify-between border-t border-(--color-border) pt-3">
          <span className="font-bold text-(--color-text-main)">Total</span>

          <span className="text-lg font-bold tabular-nums text-(--color-text-main)">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </div>

      {/* Submit order */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || totalItems === 0}
        className="w-full cursor-pointer rounded-2xl bg-(--color-accent) py-3.5 text-sm font-bold text-white transition-[opacity,transform] hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Enviando..." : "Enviar Pedido"}
      </button>
    </div>
  );
}
