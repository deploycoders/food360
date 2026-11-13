"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import type { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useCart } from "@/context/CartContext";

interface PopularPicksGridProps {
  dishes: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
  onViewAll?: () => void;
}

const mockRatings: Record<
  string,
  { rating: string; count: string; badge: string }
> = {
  "sb-001": { rating: "4.8", count: "1.2K", badge: "BESTSELLER" },
  "sb-002": { rating: "4.9", count: "856", badge: "CHEF'S PICK" },
  "ft-001": { rating: "4.7", count: "743", badge: "POPULAR" },
  "md-001": { rating: "4.9", count: "1.5K", badge: "FIRMA" },
};

export default function PopularPicksGrid({
  dishes,
  onSelectItem,
  onViewAll,
}: PopularPicksGridProps) {
  const { addItem, getItemQuantity } = useCart();

  if (!dishes.length) return null;

  return (
    <section className="bg-(--color-bg-base) px-4 py-5 md:px-8 lg:px-10">
      {/* Section header */}
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-editorial-serif text-xl font-medium text-(--color-text-primary) sm:text-2xl">
            Platos Destacados
          </h3>

          <p className="mt-0.5 text-xs text-(--color-text-muted)">
            Las creaciones favoritas de nuestros comensales
          </p>
        </div>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-(--color-accent-terracotta) transition-opacity hover:opacity-70"
          >
            <span>Ver Todo</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      {/* Featured dishes carousel */}
      <Swiper
        modules={[Navigation, Pagination, A11y]}
        navigation
        pagination={{ clickable: true }}
        slidesPerView="auto"
        spaceBetween={14}
        grabCursor
        a11y={{
          prevSlideMessage: "Plato anterior",
          nextSlideMessage: "Siguiente plato",
          paginationBulletMessage: "Ir al plato {{index}}",
        }}
        className="popular-dishes-swiper pb-9!"
      >
        {dishes.map((dish) => {
          const meta = mockRatings[dish.id] ?? {
            rating: "4.8",
            count: "500",
            badge: "POPULAR",
          };

          const quantity = getItemQuantity(dish.id);

          return (
            <SwiperSlide
              key={dish.id}
              className="h-auto! w-44! sm:w-48! md:w-52! lg:w-56!"
            >
              <article className="editorial-product-card group flex h-full flex-col justify-between overflow-hidden p-2.5">
                {/* Product preview */}
                <button
                  type="button"
                  onClick={() => onSelectItem(dish)}
                  aria-label={`Ver detalles de ${dish.name}`}
                  className="block w-full cursor-pointer text-left"
                >
                  {/* Product image */}
                  <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-[#F3EFE6]">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 640px) 176px, 224px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    {/* Product badge */}
                    <div className="absolute top-2 left-2">
                      <span className="rounded-sm border border-white/10 bg-[#1C3121]/90 px-2 py-0.5 text-[9px] font-medium tracking-[0.05em] text-[#D4A359] uppercase backdrop-blur-xs">
                        {meta.badge}
                      </span>
                    </div>
                  </div>

                  {/* Product information */}
                  <div className="flex flex-col px-0.5 pt-2">
                    <h4 className="font-editorial-serif line-clamp-1 text-[15px] leading-snug font-medium text-(--color-text-primary) transition-colors group-hover:text-(--color-accent-terracotta)">
                      {dish.name}
                    </h4>

                    <p className="mt-1 mb-2 line-clamp-2 text-xs leading-tight text-(--color-text-muted)">
                      {dish.description}
                    </p>
                  </div>
                </button>

                {/* Rating and actions */}
                <div className="mt-auto">
                  {/* Rating */}
                  <div className="mb-2 flex items-center gap-1 text-[11px] font-medium text-(--color-text-subtle)">
                    <span className="text-[#D4A359]" aria-hidden="true">
                      ★
                    </span>

                    <span className="font-semibold text-(--color-text-primary)">
                      {meta.rating}
                    </span>

                    <span>({meta.count})</span>
                  </div>

                  {/* Price and add button */}
                  <div className="flex items-center justify-between border-t border-(--color-border-subtle) pt-1.5">
                    <span className="font-sans text-sm font-bold text-(--color-text-primary)">
                      {formatCurrency(dish.price)}
                    </span>

                    <button
                      type="button"
                      onClick={() => addItem(dish)}
                      aria-label={`Agregar ${dish.name} al carrito`}
                      className={`flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-md px-2 text-[11px] font-medium text-white transition-colors ${
                        quantity > 0
                          ? "bg-(--color-forest)"
                          : "bg-(--color-accent-terracotta) hover:bg-(--color-accent-terracotta-hover)"
                      }`}
                    >
                      {quantity > 0 ? quantity : "+"}
                    </button>
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
