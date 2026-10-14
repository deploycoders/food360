'use client';

import React, { useRef, useEffect } from 'react';
import { CategoryInfo, MenuCategory } from '@/types';

interface CategoryNavProps {
  categories: CategoryInfo[];
  activeCategory: MenuCategory;
  onSelect: (category: MenuCategory) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
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
    <nav className="sticky top-[52px] z-30 bg-white border-b border-[var(--color-border)] shadow-xs">
      <div
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto no-scrollbar px-4 py-3 snap-x snap-mandatory"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeBtnRef : null}
              onClick={() => onSelect(cat.id)}
              className={`flex-shrink-0 text-xs font-bold uppercase tracking-[0.12em] transition-all relative pb-1 cursor-pointer snap-start ${
                isActive
                  ? 'text-[var(--color-text-title)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-body)]'
              }`}
            >
              <span>{cat.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-brand)] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
