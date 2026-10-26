'use client';

import { motion } from 'motion/react';
import { useRef, useEffect, type ReactNode } from 'react';
import { MenuCategory } from '@/types';

export interface CategoryPillItem {
  id: MenuCategory;
  label: string;
  iconSvg: ReactNode;
}

interface CategoryBubblesProps {
  activeCategory: MenuCategory;
  onSelect: (category: MenuCategory) => void;
}

const categoryPills: CategoryPillItem[] = [
  {
    id: 'summer-bites',
    label: 'Sushi & Rolls',
    iconSvg: (
      <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="12" x="3" y="6" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'happy-hour',
    label: 'Sashimi',
    iconSvg: (
      <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14c3-6 11-8 16-4-1 6-7 10-16 4z" />
      </svg>
    ),
  },
  {
    id: 'hot-appetizers',
    label: 'Entradas',
    iconSvg: (
      <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: 'main-dishes',
    label: 'Platos Fuertes',
    iconSvg: (
      <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 0 1-18 0h18z" />
        <path d="M7 21h10" />
      </svg>
    ),
  },
  {
    id: 'drinks',
    label: 'Bebidas',
    iconSvg: (
      <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h12l-2 18H8L6 3z" />
        <circle cx="12" cy="11" r="2" />
      </svg>
    ),
  },
  {
    id: 'desserts',
    label: 'Postres',
    iconSvg: (
      <svg className="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4c-3 0-5 2-5 4 0 2 1 3 2 4v6h6v-6c1-1 2-2 2-4 0-2-2-4-5-4z" />
      </svg>
    ),
  },
];

export default function CategoryBubbles({ activeCategory, onSelect }: CategoryBubblesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeBtnRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const btn = activeBtnRef.current;
      const scrollLeft = btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-[74px] z-30 bg-[var(--color-bg-base)]/95 py-3 backdrop-blur-md">
      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory items-center gap-2 overflow-x-auto px-4"
      >
        {categoryPills.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              ref={isActive ? activeBtnRef : null}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              onClick={() => onSelect(cat.id)}
              className={`category-pill flex-shrink-0 snap-start border px-3.5 py-1.5 text-[12px] font-medium tracking-wide transition-all ${
                isActive
                  ? 'border-[var(--color-accent-terracotta)] bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] shadow-[0_10px_20px_rgba(194,65,12,0.15)]'
                  : 'border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-border-dark)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className={isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-subtle)]'}>
                  {cat.iconSvg}
                </span>
                <span>{cat.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
