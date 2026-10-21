'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSession } from '@/context/SessionContext';

interface MenuTopHeaderProps {
  onOpenSearch: () => void;
  onOpenCustomerModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  brandName?: string;
  brandSubtitle?: string;
}

export default function MenuTopHeader({
  onOpenSearch,
  onOpenCustomerModal,
  searchQuery,
  onSearchChange,
  brandName = '360 food',
  brandSubtitle = 'FOOD · ORDER · ENJOY',
}: MenuTopHeaderProps) {
  const { totalItems } = useCart();
  const { originId, originType } = useSession();

  const originLabel = originType === 'mesa'
    ? `Mesa ${originId.replace(/^mesa-?/i, '')}`
    : originType === 'delivery'
    ? 'Delivery'
    : null;

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg-base)] text-[var(--color-text-primary)] px-4 md:px-8 lg:px-10 pt-3.5 pb-3 border-b border-[var(--color-border)]">
      {/* 1. Barra Superior Editorial */}
      <div className="flex items-center justify-between mb-3">
        {/* Retorno al Hub / Menú Lateral */}
        <Link
          href="/"
          aria-label="Volver al Hub Principal"
          className="w-9 h-9 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] transition-colors cursor-pointer no-underline"
        >
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </Link>

        {/* Logotipo Central Serif */}
        <div className="flex flex-col items-center text-center">
          <span className="font-sans text-xl font-bold tracking-[-0.06em] text-[var(--color-text-primary)]">
            {brandName}
          </span>
          <span className="text-[8px] uppercase tracking-[0.18em] text-[var(--color-text-muted)] font-medium -mt-0.5">
            {brandSubtitle}
          </span>
        </div>

        {/* Acciones Derecha: Perfil & Carrito */}
        <div className="flex items-center gap-1.5">
          {/* Perfil Comensal */}
          <button
            onClick={onOpenCustomerModal}
            aria-label="Datos del Comensal"
            className="w-9 h-9 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>

          {/* Carrito con Insignia Terracota */}
          <Link
            href="/cart"
            aria-label="Ver Carrito"
            className="relative w-9 h-9 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] transition-colors cursor-pointer no-underline"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] text-[9px] font-bold flex items-center justify-center border border-white shadow-xs animate-bounce-in">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* 2. Barra de Búsqueda Integrada */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative flex items-center bg-white border border-[var(--color-border)] rounded-full px-3.5 py-2 transition-colors focus-within:border-[var(--color-text-subtle)]">
          <svg className="w-4 h-4 text-[var(--color-text-subtle)] mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por plato, ingrediente..."
            className="w-full bg-transparent text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-subtle)] outline-none font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-[var(--color-text-subtle)] hover:text-[var(--color-text-primary)] ml-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Botón Filtros / Búsqueda Avanzada */}
        <button
          onClick={onOpenSearch}
          aria-label="Filtros"
          className="w-9 h-9 rounded-full bg-[var(--color-accent-terracotta)] flex items-center justify-center text-[var(--color-text-primary)] transition-colors cursor-pointer flex-shrink-0"
        >
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>

      {/* Origen de la mesa si está presente */}
      {originLabel && (
        <div className="mt-2 flex items-center justify-center">
          <span className="text-[10px] font-medium tracking-wider uppercase text-[var(--color-text-primary)] bg-[var(--color-accent-terracotta)] px-2.5 py-1 rounded-full">
            {originLabel}
          </span>
        </div>
      )}
    </header>
  );
}
