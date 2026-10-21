'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const quantity = getItemQuantity(item.id);

  const handleAdd = () => {
    setIsAdding(true);
    addItem(item);
    setTimeout(() => setIsAdding(false), 600);
  };

  return (
    <div
      className="group relative glass-panel rounded-2xl p-4 sm:p-5
        transition-all duration-300
        hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)] hover:shadow-xl hover:shadow-black/30
        animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Quantity badge */}
      {quantity > 0 && (
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full 
          btn-primary flex items-center justify-center text-white text-xs font-bold
          shadow-lg animate-bounce-in z-10">
          {quantity}
        </div>
      )}

      <div className="flex gap-4 items-center">
        {/* Emoji */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]
          flex items-center justify-center text-3xl
          group-hover:scale-110 transition-transform duration-300">
          {item.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[var(--color-text-main)] font-semibold text-sm leading-tight mb-1">{item.name}</h3>
          <p className="text-[var(--color-text-muted)] text-xs leading-relaxed line-clamp-2 mb-3">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-primary)] font-bold text-base sm:text-lg">
              {formatCurrency(item.price)}
            </span>
            <button
              onClick={handleAdd}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold
                transition-all duration-300 active:scale-90 cursor-pointer
                ${isAdding
                  ? 'bg-[var(--color-success-light)] border border-[var(--color-success)] text-[var(--color-success)]'
                  : 'bg-[var(--color-primary-light)] border border-[var(--color-primary)]/40 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white'
                }`}
            >
              {isAdding ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Agregado</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
