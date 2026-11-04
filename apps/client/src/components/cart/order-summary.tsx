'use client';

import { formatCurrency, formatOriginLabel } from '@/lib/formatters';
import type { OrderOrigin } from '@/types';

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
  isSubmitting 
}: OrderSummaryProps) {
  const originLabel = formatOriginLabel(origin, tableNumber) ?? 'Origen pendiente';

  return (
    <div className="glass-card rounded-3xl p-6 shadow-xl animate-fade-in-up">
      <h3 className="text-[var(--color-text-main)] font-bold text-base mb-4">Resumen de la Cuenta</h3>

      {/* Origin info badge */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] 
        border border-[var(--color-border)] mb-5">
        <span className="text-xs font-semibold text-[var(--color-accent)]">{originLabel}</span>
      </div>

      {/* Totals */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">Items ({totalItems})</span>
          <span className="font-medium text-[var(--color-text-main)]">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">Subtotal</span>
          <span className="font-medium text-[var(--color-text-main)]">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="border-t border-[var(--color-border)] pt-3 flex justify-between">
          <span className="font-bold text-[var(--color-text-main)]">Total</span>
          <span className="font-bold text-lg text-[var(--color-text-main)]">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isSubmitting || totalItems === 0}
        className="w-full py-3.5 rounded-2xl bg-[var(--color-accent)] text-white font-bold text-sm
          hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Pedido'}
      </button>
    </div>
  );
}
