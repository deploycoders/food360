'use client';

import { useSession } from '@/context/SessionContext';
import { formatOriginLabel } from '@/lib/formatters';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenWifi: () => void;
  brandName?: string;
}

export default function Header({ onOpenSearch, onOpenWifi, brandName = '360 food' }: HeaderProps) {
  const { origin, tableNumber } = useSession();

  const originLabel = formatOriginLabel(origin, tableNumber);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-header-bg)] text-[var(--color-header-text)] px-4 py-3 shadow-md flex items-center justify-between">
      {/* Brand Serif Logo */}
      <div className="flex items-center gap-2">
        <span className="font-brand-serif text-3xl font-black tracking-wider text-white select-none">
          {brandName}
        </span>
        {originLabel && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 border border-white/25 text-emerald-300">
            {originLabel}
          </span>
        )}
      </div>

      {/* Top Action Icons */}
      <div className="flex items-center gap-2">
        {/* Search button */}
        <button
          onClick={onOpenSearch}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="Buscar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>

        {/* WiFi button */}
        <button
          onClick={onOpenWifi}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
          aria-label="WiFi"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <circle cx="12" cy="20" r="1" />
          </svg>
        </button>
      </div>
    </header>
  );
}
