"use client";

import { useState } from "react";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

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
    <article
      className="group glass-panel animate-fade-in-up relative rounded-2xl p-4 transition-all duration-300 hover:border-(--color-border-hover) hover:bg-(--color-surface-hover) hover:shadow-xl hover:shadow-black/30 sm:p-5"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Quantity badge */}
      {quantity > 0 && (
        <span
          aria-label={`${quantity} unidades en el carrito`}
          className="btn-primary animate-bounce-in absolute -top-2 -right-2 z-10 flex size-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
        >
          {quantity}
        </span>
      )}

      <div className="flex items-center gap-4">
        {/* Emoji */}
        <div
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-surface) text-3xl transition-transform duration-300 group-hover:scale-110"
        >
          {item.emoji}
        </div>

        {/* Product information */}
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm leading-tight font-semibold text-(--color-text-main)">
            {item.name}
          </h3>

          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-(--color-text-muted)">
            {item.description}
          </p>

          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-(--color-primary) sm:text-lg">
              {formatCurrency(item.price)}
            </span>

            <button
              type="button"
              onClick={handleAdd}
              aria-label={`Agregar ${item.name} al carrito`}
              className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 active:scale-90 ${
                isAdding
                  ? "border-(--color-success) bg-(--color-success-light) text-(--color-success)"
                  : "border-(--color-primary)/40 bg-(--color-primary-light) text-(--color-primary) hover:bg-(--color-primary) hover:text-white"
              }`}
            >
              {isAdding ? (
                <>
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Agregado</span>
                </>
              ) : (
                <>
                  <svg
                    className="size-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Agregar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
