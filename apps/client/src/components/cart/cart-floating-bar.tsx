'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';
import { formatCurrency } from '@/lib/formatters';

export default function CartFloatingBar() {
  const { totalItems, totalPrice } = useCart();
  const { originId, originType } = useSession();

  if (totalItems === 0) return null;

  const originLabel =
    originType === 'mesa'
      ? `Mesa ${originId.replace(/^mesa-?/i, '')}`
      : originType === 'delivery'
        ? 'Delivery'
        : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4"
    >
      <Link
        href="/cart"
        className="pointer-events-auto flex w-full max-w-md items-center justify-between rounded-[24px] bg-[var(--color-text-primary)] px-4 py-3.5 text-white shadow-[0_18px_40px_rgba(23,23,23,0.2)] no-underline ring-1 ring-black/5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-terracotta)] text-[11px] font-bold text-[var(--color-text-primary)]">
            {totalItems}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/90">
              Ver comanda
            </p>
            {originLabel && (
              <p className="text-[11px] text-[var(--color-accent-terracotta)]">
                {originLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="rounded-md bg-white/10 px-2 py-1 text-sm font-bold text-white">
            {formatCurrency(totalPrice)}
          </span>
          <span className="text-xs font-medium text-white/80">Ordenar →</span>
        </div>
      </Link>
    </motion.div>
  );
}
