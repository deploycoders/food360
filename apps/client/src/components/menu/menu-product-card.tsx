"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";

import { Plus, ShoppingBag } from "lucide-react";

import type { CategoryInfo, MenuItem } from "@/types";

import { formatCurrency } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface MenuProductCardProps {
  item: MenuItem;
  categories: CategoryInfo[];
  onSelectItem: (item: MenuItem) => void;
}

export default function MenuProductCard({
  item,
  categories,
  onSelectItem,
}: MenuProductCardProps) {
  const { addItem, getItemQuantity } = useCart();

  const shouldReduceMotion = useReducedMotion();

  const quantity = getItemQuantity(item.id);
  const isAvailable = item.available;

  const categoryLabel = categories.find(
    (category) => String(category.id) === String(item.category),
  )?.label;

  const handleAddItem = () => {
    if (!isAvailable) return;
    addItem(item);
  };

  const handleSelectItem = () => {
    if (!isAvailable) return;
    onSelectItem(item);
  };

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={shouldReduceMotion || !isAvailable ? undefined : { y: -3 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.22,
        ease: "easeOut",
      }}
      className={`flex h-full cursor-pointer min-w-0 flex-col overflow-hidden rounded-2xl border bg-(--color-bg-surface) p-2.5 sm:p-3 ${
        isAvailable
          ? "border-(--color-border) shadow-[0_10px_30px_-24px_rgba(23,23,23,0.45)] transition-[border-color,box-shadow] hover:border-(--color-border-dark)"
          : "border-(--color-border)"
      }`}
    >
      {/* Fotografía */}
      <button
        type="button"
        onClick={handleSelectItem}
        disabled={!isAvailable}
        aria-label={`Ver detalles de ${item.name}`}
        className="block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
      >
        <div className="relative aspect-5/4 w-full overflow-hidden rounded-xl bg-(--color-bg-subtle)">
          <Image
            src={item.image || "/food-placeholder.svg"}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 78vw, 270px"
            className={`object-cover ${
              shouldReduceMotion
                ? ""
                : "transition-transform duration-500 ease-out group-hover:scale-[1.045]"
            } ${isAvailable ? "" : "grayscale-[0.3]"}`}
          />

          {/* Degradado */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/35 to-transparent" />

          {/* Categoría real */}
          {categoryLabel && (
            <div className="absolute left-2.5 top-2.5">
              <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white backdrop-blur-md">
                {categoryLabel}
              </span>
            </div>
          )}

          {/* Cantidad en carrito */}
          {quantity > 0 && (
            <motion.div
              key={quantity}
              initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute right-2 top-2 flex h-7 items-center gap-1.5 rounded-full border border-white/20 bg-(--color-text-primary)/90 px-2.5 text-[10px] font-semibold text-(--color-bg-base) shadow-sm backdrop-blur-md"
            >
              <ShoppingBag size={12} />
              {quantity}
            </motion.div>
          )}

          {/* Agotado */}
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
              <span className="rounded-full border border-white/20 bg-(--color-bg-base)/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-text-primary)">
                Agotado
              </span>
            </div>
          )}

          {/* Indicador de detalles */}
          {isAvailable && (
            <div className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full border border-white/30 bg-white/90 text-(--color-text-primary) opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100">
              <Plus size={17} />
            </div>
          )}
        </div>

        {/* Información */}
        <div className="px-0.5 pt-3 text-left">
          <h3 className="line-clamp-2 min-h-[2.7rem] font-editorial-serif text-base font-medium leading-snug text-(--color-text-primary) transition-colors group-hover:text-(--color-accent-terracotta) sm:text-lg">
            {item.name}
          </h3>

          <p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-relaxed text-(--color-text-muted)">
            {item.description?.trim() ||
              "Una creación preparada para disfrutar."}
          </p>
        </div>
      </button>

      {/* Precio y acción */}
      <div className="mt-auto px-0.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-editorial-serif text-xl font-semibold tracking-tight text-(--color-text-primary) sm:text-2xl">
            {formatCurrency(item.price)}
          </span>

          <motion.button
            type="button"
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            onClick={handleAddItem}
            disabled={!isAvailable}
            aria-label={
              isAvailable
                ? `Agregar ${item.name} al pedido`
                : `${item.name} no disponible`
            }
            className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) min-[560px]:h-9 min-[560px]:w-auto min-[560px]:gap-2 min-[560px]:rounded-full min-[560px]:px-3 ${
              isAvailable
                ? "bg-(--color-accent-terracotta) text-white hover:brightness-105"
                : "cursor-not-allowed bg-(--color-bg-subtle) text-(--color-text-muted)"
            }`}
          >
            {isAvailable ? (
              <>
                <Plus size={17} strokeWidth={2.2} />

                <span className="hidden text-[11px] font-semibold min-[560px]:inline">
                  {quantity > 0 ? "Agregar otro" : "Agregar"}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-semibold min-[560px]:text-xs">
                Agotado
              </span>
            )}
          </motion.button>
        </div>

        {quantity > 0 && (
          <p className="mt-2 text-[10px] font-medium text-(--color-forest)">
            {quantity} {quantity === 1 ? "unidad" : "unidades"} en tu pedido
          </p>
        )}
      </div>
    </motion.article>
  );
}
