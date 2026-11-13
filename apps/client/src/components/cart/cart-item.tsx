"use client";

import type { CartItem as CartItemType } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItemCard({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const subtotal = item.menuItem.price * item.quantity;

  return (
    <article className="glass-panel animate-fade-in-up flex items-center gap-4 rounded-2xl p-4 transition-colors duration-300 hover:bg-(--color-surface-hover)">
      {/* Product image / emoji */}
      <div
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface) text-2xl"
      >
        {item.menuItem.emoji}
      </div>

      {/* Product information */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3
            title={item.menuItem.name}
            className="truncate text-sm font-semibold leading-tight text-(--color-text-main)"
          >
            {item.menuItem.name}
          </h3>

          {/* Remove product */}
          <button
            type="button"
            onClick={() => removeItem(item.menuItem.id)}
            aria-label={`Eliminar ${item.menuItem.name} del carrito`}
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-(--color-danger)/30 bg-(--color-danger-light) text-xs text-(--color-danger) transition-colors hover:bg-(--color-danger) hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          {/* Quantity controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                updateQuantity(item.menuItem.id, item.quantity - 1)
              }
              aria-label={`Disminuir cantidad de ${item.menuItem.name}`}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface-hover) text-sm font-bold text-(--color-text-muted) transition-colors hover:bg-(--color-surface) hover:text-(--color-text-main) active:scale-90"
            >
              −
            </button>

            <span
              aria-live="polite"
              aria-atomic="true"
              className="w-6 text-center text-sm font-semibold tabular-nums text-(--color-text-main)"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() =>
                updateQuantity(item.menuItem.id, item.quantity + 1)
              }
              aria-label={`Aumentar cantidad de ${item.menuItem.name}`}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface-hover) text-sm font-bold text-(--color-text-muted) transition-colors hover:bg-(--color-surface) hover:text-(--color-text-main) active:scale-90"
            >
              +
            </button>
          </div>

          {/* Subtotal */}
          <span className="shrink-0 text-sm font-bold tabular-nums text-(--color-primary)">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    </article>
  );
}
