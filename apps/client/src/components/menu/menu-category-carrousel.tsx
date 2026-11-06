"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { motion, useReducedMotion } from "motion/react";

import { ChevronLeft, ChevronRight, MoveHorizontal } from "lucide-react";

import type { CategoryInfo, MenuItem } from "@/types";

import MenuProductCard from "@/components/menu/menu-product-card";

interface MenuCategoryCarouselProps {
  categoryId: string;
  categoryLabel: string;
  categories: CategoryInfo[];
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export default function MenuCategoryCarousel({
  categoryId,
  categoryLabel,
  categories,
  items,
  onSelectItem,
}: MenuCategoryCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const shouldReduceMotion = useReducedMotion();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = trackRef.current;

    if (!element) return;

    const maxScrollLeft = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 2);
  }, []);

  useEffect(() => {
    const element = trackRef.current;

    if (!element) return;

    updateScrollState();

    element.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateScrollState)
        : null;

    observer?.observe(element);

    Array.from(element.children).forEach((child) => {
      observer?.observe(child);
    });

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      observer?.disconnect();
    };
  }, [items.length, updateScrollState]);

  const handleScroll = (direction: -1 | 1) => {
    const element = trackRef.current;

    if (!element) return;

    const firstCard = element.querySelector<HTMLElement>(
      "[data-carousel-card]",
    );

    const cardWidth = firstCard?.getBoundingClientRect().width ?? 260;

    const styles = window.getComputedStyle(element);
    const gap = Number.parseFloat(styles.columnGap) || 12;

    element.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section className="min-w-0">
      {/* Cabecera */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-editorial-serif text-xl font-medium leading-tight text-(--color-text-primary) sm:text-2xl">
            {categoryLabel}
          </h2>

          <p className="mt-1 text-[11px] text-(--color-text-muted)">
            {items.length}{" "}
            {items.length === 1
              ? "producto disponible"
              : "productos disponibles"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {canScrollLeft && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleScroll(-1)}
              aria-label={`Productos anteriores de ${categoryLabel}`}
              className="flex size-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) transition-colors hover:border-(--color-border-dark) hover:bg-(--color-bg-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
            >
              <ChevronLeft size={17} />
            </motion.button>
          )}

          {canScrollRight && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleScroll(1)}
              aria-label={`Siguientes productos de ${categoryLabel}`}
              className="flex size-9 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) transition-colors hover:border-(--color-border-dark) hover:bg-(--color-bg-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
            >
              <ChevronRight size={17} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Carrusel horizontal */}
      <div
        ref={trackRef}
        id={`products-${categoryId}`}
        role="region"
        aria-label={`Productos de ${categoryLabel}`}
        tabIndex={0}
        className="-mx-1 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-1 pt-2 pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-carousel-card
            className="w-[min(82vw,290px)] shrink-0 snap-start min-[640px]:w-67.5 min-[1024px]:w-65"
          >
            <MenuProductCard
              item={item}
              categories={categories}
              onSelectItem={onSelectItem}
            />
          </div>
        ))}
      </div>

      {/* Indicador */}
      {canScrollRight && (
        <div className="mt-0.5 flex items-center justify-end gap-1.5 text-(--color-text-subtle)">
          <MoveHorizontal size={12} />

          <span className="text-[10px]">Desliza para explorar</span>
        </div>
      )}
    </section>
  );
}
