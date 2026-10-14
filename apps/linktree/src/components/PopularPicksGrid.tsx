'use client';

import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface PopularPicksGridProps {
  dishes: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onViewAll?: () => void;
}

const mockRatings: Record<string, { rating: string; count: string; badge: string }> = {
  'sb-001': { rating: '4.8', count: '1.2K', badge: 'BESTSELLER' },
  'sb-002': { rating: '4.9', count: '856', badge: "CHEF'S PICK" },
  'ft-001': { rating: '4.7', count: '743', badge: 'POPULAR' },
  'md-001': { rating: '4.9', count: '1.5K', badge: 'FIRMA' },
};

export default function PopularPicksGrid({ dishes, onSelectItem, onViewAll }: PopularPicksGridProps) {
  const { addItem, getItemQuantity } = useCart();

  if (!dishes.length) return null;

  return (
    <section className="px-4 md:px-8 lg:px-10 py-5 bg-[var(--color-bg-base)]">
      {/* Encabezado H2 Editorial: 20px - 24px Serif */}
      <div className="flex items-baseline justify-between mb-3.5">
        <div>
          <h3 className="font-editorial-serif text-xl sm:text-2xl font-medium text-[var(--color-text-primary)]">
            Platos Destacados
          </h3>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
            Las creaciones favoritas de nuestros comensales
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-[var(--color-accent-terracotta)] hover:underline flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <span>Ver Todo</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* Carrusel de destacados */}
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        slidesPerView="auto"
        spaceBetween={14}
        grabCursor
        a11y={{
          prevSlideMessage: 'Plato anterior',
          nextSlideMessage: 'Siguiente plato',
          paginationBulletMessage: 'Ir al plato {{index}}',
        }}
        className="popular-dishes-swiper !pb-9"
      >
        {dishes.map((dish) => {
          const meta = mockRatings[dish.id] || { rating: '4.8', count: '500', badge: 'POPULAR' };
          const quantity = getItemQuantity(dish.id);

          return (
            <SwiperSlide
              key={dish.id}
              onClick={() => onSelectItem(dish)}
              className="!h-auto !w-44 sm:!w-48 md:!w-52 lg:!w-56"
            >
              <article className="editorial-product-card h-full overflow-hidden p-2.5 flex flex-col justify-between cursor-pointer group">
              {/* Imagen 4:3 con bordes de 8px */}
              <div className="relative aspect-4/3 w-full rounded-lg overflow-hidden bg-[#F3EFE6]">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  sizes="190px"
                  className="object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[9px] font-medium uppercase tracking-[0.05em] px-2 py-0.5 rounded-sm bg-[#1C3121]/90 text-[#D4A359] border border-white/10 backdrop-blur-xs">
                    {meta.badge}
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="pt-2 px-0.5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-editorial-serif text-[15px] font-medium text-[var(--color-text-primary)] leading-snug line-clamp-1 group-hover:text-[var(--color-accent-terracotta)] transition-colors">
                    {dish.name}
                  </h4>
                  <p className="text-[12px] text-[var(--color-text-muted)] leading-tight line-clamp-2 mt-1 mb-2">
                    {dish.description}
                  </p>
                </div>

                <div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-subtle)] mb-2 font-medium">
                    <span className="text-[#D4A359]">★</span>
                    <span className="text-[var(--color-text-primary)] font-semibold">{meta.rating}</span>
                    <span>({meta.count})</span>
                  </div>

                  {/* Precio y Botón de Acción */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-[var(--color-border-subtle)]">
                    <span className="font-sans font-bold text-[14px] text-[var(--color-text-primary)]">
                      {formatCurrency(dish.price)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(dish);
                      }}
                      className={`h-6 px-2 rounded-md flex items-center justify-center text-[11px] font-medium transition-colors cursor-pointer ${
                        quantity > 0
                          ? 'bg-[var(--color-forest)] text-white'
                          : 'bg-[var(--color-accent-terracotta)] hover:bg-[var(--color-accent-terracotta-hover)] text-white'
                      }`}
                    >
                      {quantity > 0 ? quantity : '+'}
                    </button>
                  </div>
                </div>
              </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}
