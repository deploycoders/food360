"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";
import { formatCurrency, formatOriginLabel } from "@/lib/formatters";

export default function CartFloatingBar() {
  const { totalItems, totalPrice, isReady } = useCart();
  const { origin, tableNumber } = useSession();

  const shouldReduceMotion = useReducedMotion();

  if (!isReady || totalItems === 0) return null;

  const originLabel = formatOriginLabel(origin, tableNumber);

  const itemLabel = `${totalItems} ${
    totalItems === 1 ? "producto" : "productos"
  }`;

  const cartLabel = [
    "Revisar pedido",
    itemLabel,
    originLabel,
    `Total ${formatCurrency(totalPrice)}`,
  ]
    .filter(Boolean)
    .join(". ");

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.25,
        ease: "easeOut",
      }}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
    >
      <Link
        href="/cart"
        aria-label={cartLabel}
        className="group pointer-events-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-2xl bg-(--color-text-primary) px-4 py-3.5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition-[border-color,box-shadow,transform] duration-200 hover:shadow-[0_16px_40px_rgba(0,0,0,0.24)] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent-terracotta)"
      >
        {/* Información del pedido */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--color-accent-terracotta) text-white">
            <ShoppingBag size={19} strokeWidth={1.8} aria-hidden="true" />

            {/* Cantidad */}
            <span
              aria-hidden="true"
              className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-(--color-text-primary) bg-(--color-bg-base) px-1 text-[9px] font-bold leading-none text-(--color-text-primary)"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-tight text-(--color-bg-base)">
              Tu pedido
            </p>

            <p className="mt-1 truncate text-[11px] leading-tight text-(--color-bg-base) opacity-65">
              {originLabel ? `${itemLabel} · ${originLabel}` : itemLabel}
            </p>
          </div>
        </div>

        {/* Total y navegación */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <p className="text-[9px] font-medium uppercase tracking-wider text-(--color-bg-base) opacity-65">
              Total
            </p>

            <p className="mt-0.5 text-sm font-bold leading-tight tabular-nums tracking-tight text-(--color-bg-base) sm:text-base">
              {formatCurrency(totalPrice)}
            </p>
          </div>

          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-(--color-accent-terracotta) text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:opacity-90"
          >
            <ArrowRight size={18} strokeWidth={1.9} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
