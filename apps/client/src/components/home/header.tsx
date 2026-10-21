'use client';

import { useSession } from '@/context/SessionContext';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenWifi: () => void;
  brandName?: string;
}

export default function Header({ onOpenSearch, onOpenWifi, brandName = '360 food' }: HeaderProps) {
  const { originId, originType } = useSession();

  const originLabel = originType === 'mesa'
    ? `Mesa ${originId.replace(/^mesa-?/i, '')}`
    : originType === 'delivery'
    ? 'Delivery'
    : originId !== 'walk-in'
    ? originId
    : null;

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
          aria-label="Buscar platos"
          className="w-9 h-9 rounded-full bg-[var(--color-header-icon-bg)] hover:bg-[var(--color-header-icon-hover)] flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* WiFi button */}
        <button
          onClick={onOpenWifi}
          aria-label="Wi-Fi del local"
          className="w-9 h-9 rounded-full bg-[var(--color-header-icon-bg)] hover:bg-[var(--color-header-icon-hover)] flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
        </button>
      </div>
    </header>
  );
}
