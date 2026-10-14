'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/formatters';

export default function CartFloatingButton() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-40 px-4 pointer-events-none">
      <Link
        href="/cart"
        className="pointer-events-auto flex items-center justify-between gap-4 w-full max-w-sm
          px-5 py-4 rounded-2xl btn-primary
          shadow-2xl shadow-black/50
          animate-bounce-in no-underline cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-white/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white text-[var(--color-primary-hover)] 
              text-[10px] font-extrabold flex items-center justify-center shadow-md">
              {totalItems}
            </span>
          </div>
          <span className="font-bold text-sm text-white">Ver mi Pedido</span>
        </div>

        <span className="font-extrabold text-sm text-white bg-black/20 px-3 py-1 rounded-lg">
          {formatCurrency(totalPrice)}
        </span>
      </Link>
    </div>
  );
}
