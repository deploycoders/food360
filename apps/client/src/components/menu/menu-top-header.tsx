"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  UserRound,
  ShoppingBag,
  X,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";
import { formatOriginLabel } from "@/lib/formatters";

interface MenuTopHeaderProps {
  onOpenCustomerModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  brandName?: string;
  brandSubtitle?: string;
}

export default function MenuTopHeader({
  onOpenCustomerModal,
  searchQuery,
  onSearchChange,
  brandName = "360 food",
  brandSubtitle = "FOOD · ORDER · ENJOY",
}: MenuTopHeaderProps) {
  const { totalItems } = useCart();
  const { origin, tableNumber } = useSession();

  const shouldReduceMotion = useReducedMotion();
  const originLabel = formatOriginLabel(origin, tableNumber);

  const tapAnimation = shouldReduceMotion ? undefined : { scale: 0.96 };

  return (
    <motion.header
      initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.3,
        ease: "easeOut",
      }}
      className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-bg-base)/95 px-2 pb-3 pt-3.5 backdrop-blur-xl md:px-8 lg:px-10"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* 1. Identidad y navegación */}
        <div className="mb-3 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center">
          <Link
            href="/"
            aria-label="Volver al restaurante"
            title="Volver al restaurante"
            className="flex size-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) transition-colors hover:border-(--color-border-dark) hover:bg-(--color-bg-base) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
          >
            <ArrowLeft size={19} strokeWidth={1.8} aria-hidden="true" />
          </Link>

          {/* Centro geométrico real del encabezado */}
          <div className="flex min-w-0 flex-col items-center px-2 text-center">
            <h1 className="max-w-full truncate font-editorial-serif text-lg font-semibold leading-tight tracking-tight text-(--color-text-primary) sm:text-xl">
              {brandName}
            </h1>

            <span className="mt-0.5 max-w-full truncate text-[8px] font-medium uppercase tracking-[0.2em] text-(--color-text-muted)">
              {brandSubtitle}
            </span>
          </div>

          <Link
            href="/cart"
            aria-label={
              totalItems > 0
                ? `Ver carrito, ${totalItems} productos`
                : "Ver carrito"
            }
            title="Ver carrito"
            className="relative flex size-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) no-underline transition-colors hover:border-(--color-border-dark) hover:bg-(--color-bg-base) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
          >
            <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" />

            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 z-10 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-(--color-bg-base) bg-(--color-accent-terracotta) px-1 text-[9px] font-bold leading-none text-(--color-text-primary)"
              >
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* 2. Búsqueda */}
        <div
          role="search"
          className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-(--color-border) bg-(--color-bg-surface) px-3.5 transition-colors focus-within:border-(--color-accent-terracotta)"
        >
          <Search
            size={17}
            strokeWidth={1.7}
            aria-hidden="true"
            className="mr-2.5 shrink-0 text-(--color-text-subtle)"
          />

          <input
            type="text"
            role="searchbox"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar platos o ingredientes..."
            aria-label="Buscar en la carta"
            autoComplete="off"
            className="w-full min-w-0 bg-transparent text-[13px] text-(--color-text-primary) outline-none placeholder:text-(--color-text-subtle)"
          />

          {searchQuery.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
              className="ml-2 flex size-7 shrink-0 items-center justify-center rounded-full text-(--color-text-subtle) transition-colors hover:bg-(--color-bg-base) hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--color-accent-terracotta)"
            >
              <X size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* 3. Información contextual y comensal */}
        <div
          className={`mt-2 flex min-h-9 items-center ${
            originLabel ? "justify-between gap-3" : "justify-end"
          }`}
        >
          {originLabel && (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-(--color-border) bg-(--color-bg-surface) px-3 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-(--color-text-muted)">
              <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-(--color-accent-terracotta)"
              />
              <span className="truncate">{originLabel}</span>
            </span>
          )}

          <motion.button
            type="button"
            whileTap={tapAnimation}
            onClick={onOpenCustomerModal}
            aria-label="Consultar o editar datos del comensal"
            aria-haspopup="dialog"
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-[11px] font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-bg-surface) hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
          >
            <UserRound size={15} strokeWidth={1.8} aria-hidden="true" />
            <span>Datos del comensal</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
