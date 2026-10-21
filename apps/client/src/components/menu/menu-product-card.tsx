'use client';

import Image from 'next/image';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/context/CartContext';

interface MenuProductCardProps {
  item: MenuItem;
  onSelectItem: (item: MenuItem) => void;
}

const mockMetadata: Record<string, { rating: string; count: string; badge?: string }> = {
  'sb-001': { rating: '4.8', count: '1.2K', badge: 'BESTSELLER' },
  'sb-002': { rating: '4.9', count: '856', badge: "CHEF'S PICK" },
  'sb-003': { rating: '4.7', count: '420' },
  'sb-004': { rating: '4.8', count: '630', badge: 'POPULAR' },
  'hh-001': { rating: '4.9', count: '510' },
  'hh-002': { rating: '4.8', count: '980', badge: 'DESTACADO' },
  'ft-001': { rating: '4.9', count: '1.4K', badge: 'FIRMA' },
  'ft-002': { rating: '4.7', count: '340' },
  'ft-003': { rating: '4.8', count: '790', badge: 'POPULAR' },
  'ca-001': { rating: '4.6', count: '290' },
  'ca-002': { rating: '4.8', count: '580' },
  'ha-001': { rating: '4.9', count: '1.1K', badge: 'FAVORITO' },
  'ha-002': { rating: '4.7', count: '460' },
  'ds-001': { rating: '4.9', count: '1.8K', badge: 'BESTSELLER' },
  'ds-002': { rating: '4.8', count: '820' },
  'ds-003': { rating: '4.9', count: '650', badge: 'TRUFA' },
  'md-001': { rating: '5.0', count: '2.1K', badge: "CHEF'S PICK" },
  'md-002': { rating: '4.9', count: '1.3K', badge: 'FIRMA' },
  'dr-001': { rating: '4.7', count: '410' },
  'dr-002': { rating: '4.8', count: '590', badge: 'POPULAR' },
  'de-001': { rating: '4.9', count: '920', badge: 'DULCE' },
  'de-002': { rating: '4.8', count: '670' },
};

export default function MenuProductCard({ item, onSelectItem }: MenuProductCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const quantity = getItemQuantity(item.id);
  const meta = mockMetadata[item.id] || { rating: '4.8', count: '300' };
  const badgeText = meta.badge || (item.tags && item.tags[0]);

  return (
    <div
      onClick={() => onSelectItem(item)}
      className="editorial-product-card overflow-hidden flex flex-col justify-between cursor-pointer group p-2.5"
    >
      {/* 1. Imagen 1:1 o 4:3 con bordes suaves de 8px */}
      <div className="relative aspect-4/3 w-full rounded-[14px] overflow-hidden bg-[var(--color-bg-subtle)]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, 220px"
          className="object-cover group-hover:scale-103 transition-transform duration-500"
        />

        {/* Badge 10% Terracota / Dorado con tracking */}
        {badgeText && (
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.05em] px-2 py-1 rounded-full bg-white/90 text-[var(--color-text-primary)] backdrop-blur-xs">
              {badgeText}
            </span>
          </div>
        )}

        {/* Badge de cantidad si está en el carrito */}
        {quantity > 0 && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] text-[10px] font-bold flex items-center justify-center shadow-xs">
            {quantity}
          </div>
        )}
      </div>

      {/* 2. Cuerpo Editorial */}
      <div className="pt-2.5 px-0.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Nombre del plato: 16px - 17px Serif */}
          <h4 className="font-editorial-serif text-[15px] sm:text-[16px] font-medium text-[var(--color-text-primary)] leading-snug line-clamp-1 group-hover:text-[var(--color-accent-terracotta)] transition-colors">
            {item.name}
          </h4>

          {/* Ingredientes / Descripción: 13px Neutral Suave */}
          <p className="text-[12px] sm:text-[13px] text-[var(--color-text-muted)] leading-relaxed line-clamp-2 mt-1 mb-2 font-normal">
            {item.description}
          </p>
        </div>

        <div>
          {/* Rating sutil */}
          <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-subtle)] mb-2 font-medium">
            <span className="text-[var(--color-accent-terracotta)]">★</span>
            <span className="text-[var(--color-text-primary)] font-semibold">{meta.rating}</span>
            <span>({meta.count})</span>
          </div>

          {/* Precio y Botón de Acción Terracota */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="font-sans font-bold text-[14px] sm:text-[15px] text-[var(--color-text-primary)]">
              {formatCurrency(item.price)}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(item);
              }}
              aria-label={`Agregar ${item.name}`}
              className={`h-7 px-2.5 rounded-md flex items-center justify-center text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                quantity > 0
                  ? 'bg-[var(--color-forest)] text-white'
                  : 'bg-[var(--color-accent-terracotta)] hover:bg-[var(--color-accent-terracotta-hover)] text-[var(--color-text-primary)]'
              }`}
            >
              {quantity > 0 ? (
                <span className="font-semibold">{quantity} en orden</span>
              ) : (
                <span>+ Agregar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
