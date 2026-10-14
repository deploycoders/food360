'use client';

import React, { useRef, useEffect } from 'react';
import { CategoryInfo, MenuCategory } from '@/types';

interface CategoryTabsProps {
  categories: CategoryInfo[];
  activeCategory: MenuCategory | 'all';
  onSelect: (category: MenuCategory | 'all') => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const activeEl = activeRef.current;
      const scrollLeft = activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  const allTab = { id: 'all' as const, label: 'Todo el Menú', emoji: '🍽️' };
  const tabs = [allTab, ...categories];

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-2 px-2 snap-x snap-mandatory"
    >
      {tabs.map((tab) => {
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSelect(tab.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl
              text-xs sm:text-sm font-medium transition-all duration-300 snap-start cursor-pointer
              ${isActive
                ? 'btn-primary font-semibold'
                : 'glass-panel text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-main)]'
              }`}
          >
            <span className="text-base">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
