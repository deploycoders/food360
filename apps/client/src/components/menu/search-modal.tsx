'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export default function SearchModal({ isOpen, onClose, items, onSelectItem }: SearchModalProps) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-20">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs animate-fade-in" onClick={onClose} />

      {/* Search Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-slide-up">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-3 bg-[var(--color-bg-subtle)]">
          <svg className="w-5 h-5 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, ingrediente o plato..."
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium outline-none text-[var(--color-text-title)] placeholder:text-neutral-400"
          />
          <button
            onClick={onClose}
            className="text-xs font-bold text-neutral-500 hover:text-black px-2 py-1 rounded cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Results list */}
        <div className="p-2 overflow-y-auto flex-1 divide-y divide-[var(--color-border-subtle)]">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--color-text-muted)]">
              No se encontraron platos que coincidan con &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3 flex items-center justify-between hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors"
              >
                <div className="pr-2">
                  <p className="font-brand-serif font-bold text-sm text-[var(--color-text-title)]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <span className="font-bold text-sm text-[var(--color-text-title)] flex-shrink-0">
                  {formatCurrency(item.price)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
