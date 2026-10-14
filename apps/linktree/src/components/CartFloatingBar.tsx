'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { formatCurrency } from '@/lib/formatters';

export default function CartFloatingBar() {
  const { totalItems, totalPrice } = useCart();
  const { originId, originType } = useSession();

  if (totalItems === 0) return null;

  const originLabel = originType === 'mesa'
    ? `Mesa ${originId.replace(/^mesa-?/i, '')}`
    : originType === 'delivery'
    ? 'Delivery'
    : null;

  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center z-40 px-4 pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto w-full max-w-md bg-[var(--color-text-primary)] text-white rounded-[22px] px-4 py-3.5 flex items-center justify-between shadow-[0_12px_32px_rgba(32,37,31,0.28)] transition-transform active:scale-[0.99] cursor-pointer no-underline"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] font-bold text-xs flex items-center justify-center shadow-xs">
            {totalItems}
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-tight font-sans">
              Ver Comanda
            </p>
            {originLabel && (
              <p className="text-[11px] text-[var(--color-accent-terracotta)] font-normal">
                {originLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white font-sans bg-white/10 px-2.5 py-0.5 rounded-md">
            {formatCurrency(totalPrice)}
          </span>
          <span className="text-white/80 text-xs font-medium">Ordenar →</span>
        </div>
      </Link>
    </div>
  );
}
