"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface MenuItemRowProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
}

export default function MenuItemRow({ item, onSelectItem }: MenuItemRowProps) {
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);

  const handleQuickAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    addItem(item);
  };

  return (
    <article className="group flex cursor-pointer items-start gap-4 border-b border-(--color-border-subtle) bg-white px-4 py-5 transition-colors hover:bg-neutral-50/70">
      {/* Product information */}
      <button
        type="button"
        onClick={() => onSelectItem(item)}
        className="min-w-0 flex-1 cursor-pointer pr-1 text-left"
      >
        <h4 className="font-brand-serif text-base leading-tight font-bold tracking-tight text-(--color-text-title) uppercase transition-colors group-hover:text-emerald-950 sm:text-lg">
          {item.name}
        </h4>

        <p className="mt-1 mb-1.5 text-sm font-bold text-(--color-text-title)">
          {formatCurrency(item.price)}
        </p>

        {item.tags && item.tags.length > 0 && (
          <p className="mb-1 text-[11px] font-semibold text-[#8a5d1b]">
            {item.tags.join(" · ")}
          </p>
        )}

        <p className="line-clamp-3 text-xs leading-relaxed text-(--color-text-muted)">
          {item.description}
        </p>
      </button>

      {/* Product image and quick add */}
      <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl border border-(--color-border) bg-neutral-100 shadow-2xs sm:size-32">
        <button
          type="button"
          onClick={() => onSelectItem(item)}
          aria-label={`Ver detalles de ${item.name}`}
          className="absolute inset-0 size-full cursor-pointer"
        >
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>

        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Agregar ${item.name} al carrito`}
          className="absolute right-2 bottom-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-(--color-btn-add) text-white shadow-lg transition-all hover:bg-(--color-btn-add-hover) active:scale-90"
        >
          {quantity > 0 ? (
            <span className="text-xs font-bold">{quantity}</span>
          ) : (
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}
