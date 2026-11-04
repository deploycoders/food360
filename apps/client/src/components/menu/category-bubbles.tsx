"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import type { CategoryInfo, MenuCategory } from "@/types";

interface CategoryBubblesProps {
  categories: CategoryInfo[];
  activeCategory: MenuCategory | null;
  onSelect: (category: MenuCategory | null) => void;
}

export default function CategoryBubbles({
  categories,
  activeCategory,
  onSelect,
}: CategoryBubblesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const container = scrollRef.current;
    const activeButton = activeButtonRef.current;

    if (!container || !activeButton) return;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    const desiredPosition =
      container.scrollLeft +
      buttonRect.left -
      containerRect.left -
      (container.clientWidth - buttonRect.width) / 2;

    const maxScroll = container.scrollWidth - container.clientWidth;

    container.scrollTo({
      left: Math.max(0, Math.min(desiredPosition, maxScroll)),
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [activeCategory, shouldReduceMotion]);

  if (categories.length <= 1) return null;

  return (
    <nav
      data-animate="menu-categories"
      aria-label="Categorías de la carta"
      className="sticky top-42.75 z-30 border-b border-(--color-border) bg-(--color-bg-base)/95 py-2.5 backdrop-blur-xl"
    >
      <div
        ref={scrollRef}
        className="mx-auto flex w-full max-w-7xl snap-x snap-proximity items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-8 lg:px-10"
      >
        {/* Mostrar toda la carta */}
        <motion.button
          ref={activeCategory === null ? activeButtonRef : null}
          type="button"
          whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          onClick={() => onSelect(null)}
          aria-pressed={activeCategory === null}
          className={`flex h-9 shrink-0 snap-start items-center justify-center rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) ${
            activeCategory === null
              ? "border-(--color-accent-terracotta) bg-(--color-accent-terracotta) text-white shadow-sm"
              : "border-(--color-border) bg-(--color-bg-surface) text-(--color-text-muted) hover:border-(--color-border-dark) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)"
          }`}
        >
          Todas
        </motion.button>

        {/* Categorías individuales */}
        {categories.map((category) => {
          const isActive = activeCategory === category.id;

          return (
            <motion.button
              key={category.id}
              ref={isActive ? activeButtonRef : null}
              type="button"
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              onClick={() => onSelect(isActive ? null : category.id)}
              aria-pressed={isActive}
              aria-label={
                isActive
                  ? `Quitar filtro de ${category.label}`
                  : `Mostrar solamente ${category.label}`
              }
              title={
                isActive
                  ? "Quitar filtro de categoría"
                  : `Ver ${category.label}`
              }
              className={`inline-flex h-9 shrink-0 snap-start items-center justify-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) ${
                isActive
                  ? "border-(--color-accent-terracotta) bg-(--color-accent-terracotta) text-white shadow-sm"
                  : "border-(--color-border) bg-(--color-bg-surface) text-(--color-text-muted) hover:border-(--color-border-dark) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)"
              }`}
            >
              <span>{category.label}</span>

              {isActive && (
                <X
                  size={13}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="opacity-80"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
