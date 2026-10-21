'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface PopularDishesProps {
  dishes: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export default function PopularDishes({ dishes, onSelectItem }: PopularDishesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 240;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!dishes.length) return null;

  return (
    <section className="px-4 py-6 bg-[var(--color-bg-page)]">
      {/* Header with Serif title & Nav Arrows */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-brand-serif text-2xl font-bold text-[var(--color-text-title)]">
          Popular Dishes
        </h2>

        <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
          <button
            onClick={() => scroll('left')}
            aria-label="Anterior"
            className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="w-6 h-[1px] bg-neutral-300 mx-1" />
          <button
            onClick={() => scroll('right')}
            aria-label="Siguiente"
            className="w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory"
      >
        {dishes.map((dish) => (
          <div
            key={dish.id}
            onClick={() => onSelectItem(dish)}
            className="flex-shrink-0 w-48 sm:w-56 group cursor-pointer snap-start"
          >
            {/* Food Image Card */}
            <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden bg-neutral-100 shadow-sm border border-[var(--color-border)]">
              <Image
                src={dish.image}
                alt={dish.name}
                fill
                sizes="220px"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Tag / Price Badge (Clean Sans-Serif) */}
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-md bg-black/65 text-white backdrop-blur-md">
                  POPULAR
                </span>
              </div>

              {/* Title & Price Overlaid at bottom */}
              <div className="absolute bottom-3 inset-x-3 text-white">
                <p className="font-brand-serif text-base font-bold leading-tight drop-shadow truncate">
                  {dish.name}
                </p>
                <p className="text-xs font-bold text-amber-200 mt-0.5 font-mono">
                  {formatCurrency(dish.price)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
