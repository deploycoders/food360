'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';

interface MenuTopHeaderProps {
  onOpenSearch: () => void;
  onOpenCustomerModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  brandName?: string;
  brandSubtitle?: string;
}

export default function MenuTopHeader({
  onOpenSearch,
  onOpenCustomerModal,
  searchQuery,
  onSearchChange,
  brandName = '360 food',
  brandSubtitle = 'FOOD · ORDER · ENJOY',
}: MenuTopHeaderProps) {
  const { totalItems } = useCart();
  const { originId, originType } = useSession();

  const originLabel =
    originType === 'mesa'
      ? `Mesa ${originId.replace(/^mesa-?/i, '')}`
      : originType === 'delivery'
        ? 'Delivery'
        : null;

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]/95 px-4 pb-3 pt-3.5 backdrop-blur-md md:px-8 lg:px-10"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Volver al Hub Principal"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] no-underline transition-colors hover:border-[var(--color-border-dark)]"
        >
          <svg
            className="h-4 w-4 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </Link>

        <div className="flex min-w-0 flex-col items-center text-center">
          <span className="text-lg font-bold tracking-[-0.06em] text-[var(--color-text-primary)]">
            {brandName}
          </span>
          <span className="-mt-0.5 text-[8px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            {brandSubtitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onOpenCustomerModal}
            aria-label="Datos del Comensal"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-dark)]"
          >
            <svg
              className="h-4 w-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </motion.button>

          <Link
            href="/cart"
            aria-label="Ver carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] no-underline transition-colors hover:border-[var(--color-border-dark)]"
          >
            <svg
              className="h-4 w-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-terracotta)] border border-white text-[9px] font-bold text-[var(--color-text-primary)]">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex flex-1 items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2.5 transition-colors focus-within:border-[var(--color-accent-terracotta)]">
          <svg
            className="mr-2 h-4 w-4 shrink-0 text-[var(--color-text-subtle)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por plato o ingrediente"
            className="w-full bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)] outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="ml-1 text-xs text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-text-primary)]"
            >
              ✕
            </button>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOpenSearch}
          aria-label="Abrir búsqueda avanzada"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] shadow-[0_10px_20px_rgba(194,65,12,0.18)]"
        >
          <svg
            className="h-4 w-4 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </motion.button>
      </div>

      {originLabel && (
        <div className="mt-2.5 flex items-center justify-center">
          <span className="rounded-full bg-[var(--color-accent-terracotta)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-primary)]">
            {originLabel}
          </span>
        </div>
      )}
    </motion.header>
  );
}
