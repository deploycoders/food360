'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface OrderSummaryProps {
  totalPrice: number;
  totalItems: number;
  originId: string;
  originType: 'mesa' | 'delivery' | 'unknown';
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function OrderSummary({ 
  totalPrice, 
  totalItems, 
  originId, 
  originType, 
  onSubmit, 
  isSubmitting 
}: OrderSummaryProps) {
  const originLabel = originType === 'mesa' 
    ? `📍 ${originId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}` 
    : originType === 'delivery' 
    ? '🛵 Delivery Directo' 
    : `📍 Origen: ${originId}`;

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
          <span className="text-[var(--color-text-muted)]">Productos</span>
          <span className="text-[var(--color-text-main)] font-medium">{totalItems} unidades</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[var(--color-text-muted)]">Subtotal</span>
          <span className="text-[var(--color-text-main)] font-medium">{formatCurrency(totalPrice)}</span>
        </div>
        <div className="h-px bg-[var(--color-border)] my-2" />
        <div className="flex justify-between items-center">
          <span className="text-[var(--color-text-main)] font-bold text-base">Total a Pagar</span>
          <span className="text-[var(--color-primary)] font-extrabold text-2xl">{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full py-4 rounded-xl btn-primary font-bold text-base cursor-pointer
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Enviando al KDS...</span>
          </>
        ) : (
          <>
            <span>Enviar Pedido a Cocina</span>
            <span>🍽️</span>
          </>
        )}
      </button>
    </div>
  );
}
