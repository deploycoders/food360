'use client';

import { type MouseEvent } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface MenuItemRowProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
}

export default function MenuItemRow({ item, onSelectItem }: MenuItemRowProps) {
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);

  const handleQuickAdd = (e: MouseEvent) => {
    e.stopPropagation();
    addItem(item);
  };

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="group py-5 px-4 bg-white border-b border-[var(--color-border-subtle)] hover:bg-neutral-50/70 transition-colors cursor-pointer flex gap-4 items-start"
    >
      {/* Left Info Column */}
      <div className="flex-1 min-w-0 pr-1">
        <h4 className="font-brand-serif text-base sm:text-lg font-bold uppercase tracking-tight text-[var(--color-text-title)] leading-tight group-hover:text-emerald-950 transition-colors">
          {item.name}
        </h4>

        <p className="text-sm font-bold text-[var(--color-text-title)] mt-1 mb-1.5">
          {formatCurrency(item.price)}
        </p>

        {item.tags && item.tags.length > 0 && (
          <p className="text-[11px] font-semibold text-[#8a5d1b] mb-1">
            {item.tags.join(' · ')}
          </p>
        )}

        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-3">
          {item.description}
        </p>
      </div>

      {/* Right Image Column with Quick Add Button */}
      <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-neutral-100 border border-[var(--color-border)] shadow-2xs">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="140px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick Add Button / Arrow Icon Button in Corner */}
        <button
          onClick={handleQuickAdd}
          aria-label={`Agregar ${item.name}`}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[var(--color-btn-add)] hover:bg-[var(--color-btn-add-hover)] text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer"
        >
          {quantity > 0 ? (
            <span className="text-xs font-bold">{quantity}</span>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
