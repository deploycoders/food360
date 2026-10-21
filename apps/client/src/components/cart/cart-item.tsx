'use client';

import { CartItem as CartItemType } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItemCard({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const subtotal = item.menuItem.price * item.quantity;

  return (
    <div className="flex gap-4 glass-panel rounded-2xl p-4
      transition-all duration-300 hover:bg-[var(--color-surface-hover)] animate-fade-in-up items-center">
      {/* Emoji */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]
        flex items-center justify-center text-2xl">
        {item.menuItem.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[var(--color-text-main)] font-semibold text-sm leading-tight truncate">
            {item.menuItem.name}
          </h3>
          <button
            onClick={() => removeItem(item.menuItem.id)}
            className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30
              flex items-center justify-center text-[var(--color-danger)] text-xs
              hover:bg-[var(--color-danger)] hover:text-white transition-all cursor-pointer"
            aria-label="Eliminar"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
              className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)]
                flex items-center justify-center text-[var(--color-text-muted)] text-sm font-bold
                hover:bg-[var(--color-surface)] hover:text-[var(--color-text-main)] transition-all active:scale-90 cursor-pointer"
            >
              −
            </button>
            <span className="w-6 text-center text-[var(--color-text-main)] font-semibold text-sm">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
              className="w-7 h-7 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)]
                flex items-center justify-center text-[var(--color-text-muted)] text-sm font-bold
                hover:bg-[var(--color-surface)] hover:text-[var(--color-text-main)] transition-all active:scale-90 cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <span className="text-[var(--color-primary)] font-bold text-sm">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}
