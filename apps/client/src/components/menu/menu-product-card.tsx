'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface MenuProductCardProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
}

const mockMetadata: Record<string, { rating: string; count: string; badge?: string }> = {
  'sb-001': { rating: '4.8', count: '1.2K', badge: 'BESTSELLER' },
  'sb-002': { rating: '4.9', count: '856', badge: "CHEF'S PICK" },
  'sb-003': { rating: '4.7', count: '420' },
  'sb-004': { rating: '4.8', count: '630', badge: 'POPULAR' },
  'hh-001': { rating: '4.9', count: '510' },
  'hh-002': { rating: '4.8', count: '980', badge: 'DESTACADO' },
  'ft-001': { rating: '4.9', count: '1.4K', badge: 'FIRMA' },
  'ft-002': { rating: '4.7', count: '340' },
  'ft-003': { rating: '4.8', count: '790', badge: 'POPULAR' },
  'ca-001': { rating: '4.6', count: '290' },
  'ca-002': { rating: '4.8', count: '580' },
  'ha-001': { rating: '4.9', count: '1.1K', badge: 'FAVORITO' },
  'ha-002': { rating: '4.7', count: '460' },
  'ds-001': { rating: '4.9', count: '1.8K', badge: 'BESTSELLER' },
  'ds-002': { rating: '4.8', count: '820' },
  'ds-003': { rating: '4.9', count: '650', badge: 'TRUFA' },
  'md-001': { rating: '5.0', count: '2.1K', badge: "CHEF'S PICK" },
  'md-002': { rating: '4.9', count: '1.3K', badge: 'FIRMA' },
  'dr-001': { rating: '4.7', count: '410' },
  'dr-002': { rating: '4.8', count: '590', badge: 'POPULAR' },
  'de-001': { rating: '4.9', count: '920', badge: 'DULCE' },
  'de-002': { rating: '4.8', count: '670' },
};

export default function MenuProductCard({ item, onSelectItem }: MenuProductCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const meta = mockMetadata[item.id] || { rating: '4.8', count: '300' };
  const badgeText = meta.badge || (item.tags && item.tags[0]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={() => item.available && onSelectItem(item)}
      className={`group flex cursor-pointer flex-col justify-between overflow-hidden rounded-[22px] border bg-[var(--color-bg-surface)] p-2.5 ${
        item.available
          ? 'border-[var(--color-border)] shadow-[0_12px_30px_-26px_rgba(23,23,23,0.45)] hover:border-[var(--color-border-dark)]'
          : 'border-[var(--color-border)] opacity-75'
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-[var(--color-bg-subtle)]">
        <Image
          src={item.image || '/food-placeholder.svg'}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className={`object-cover transition-transform duration-500 ${
            item.available ? 'group-hover:scale-[1.04]' : 'grayscale-[0.2]'
          }`}
        />

        {badgeText && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.10em] text-[var(--color-text-primary)] backdrop-blur-sm">
              {badgeText}
            </span>
          </div>
        )}

        {quantity > 0 && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent-terracotta)] text-[9px] font-bold text-[var(--color-text-primary)]">
            {quantity}
          </div>
        )}

        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-[rgba(15,23,42,0.18)] backdrop-blur-[1px]">
            <span className="rounded-full bg-[var(--color-bg-base)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-primary)]">
              No disponible
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between pt-2.5">
        <div>
          <h4 className="line-clamp-1 font-editorial-serif text-[15px] font-medium leading-snug text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-accent-terracotta)] sm:text-[16px]">
            {item.name}
          </h4>

          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[var(--color-text-muted)] sm:text-[13px]">
            {item.description}
          </p>
        </div>

        <div className="mt-3">
          <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-[var(--color-text-subtle)]">
            <span className="text-[var(--color-accent-terracotta)]">★</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{meta.rating}</span>
            <span>({meta.count})</span>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border-subtle)] pt-2.5">
            <span className="text-[15px] font-bold text-[var(--color-text-primary)]">
              {formatCurrency(item.price)}
            </span>

            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (item.available) {
                  addItem(item);
                }
              }}
              disabled={!item.available}
              aria-label={item.available ? `Agregar ${item.name}` : `${item.name} no disponible`}
              className={`flex h-8 items-center justify-center rounded-full px-3 text-[11px] font-semibold transition-colors ${
                item.available
                  ? quantity > 0
                    ? 'bg-[var(--color-forest)] text-white hover:opacity-95'
                    : 'bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent-terracotta-hover)]'
                  : 'cursor-not-allowed bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
              }`}
            >
              {item.available ? (
                quantity > 0 ? `${quantity} en orden` : '+ Agregar'
              ) : (
                'Agotado'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
