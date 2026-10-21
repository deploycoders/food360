'use client';

import { restaurant } from '@/data/restaurant';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DirectionsModal({ isOpen, onClose }: DirectionsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[#0e1711]/75 backdrop-blur-xs animate-fade-in" />

      <div
        className="relative w-full max-w-sm bg-white rounded-xl p-6 shadow-xl text-[var(--color-text-body)] border border-[var(--color-border)] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-md bg-[#F3EFE6] flex items-center justify-center text-[var(--color-text-muted)] hover:text-black transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-lg bg-[#F3EFE6] text-[var(--color-forest)] flex items-center justify-center mx-auto mb-2 border border-[#E8E4D8]">
            <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3 className="font-editorial-serif text-lg font-medium text-[var(--color-text-primary)]">
            Ubicación & Dirección
          </h3>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
            {restaurant.name}
          </p>
        </div>

        <div className="bg-[#F9F8F3] p-3.5 rounded-lg mb-5 text-xs text-[var(--color-text-body)] border border-[var(--color-border)]">
          <p className="font-medium text-[var(--color-text-primary)]">{restaurant.address}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
            {restaurant.openStatus} · {restaurant.openUntil}
          </p>
        </div>

        <div className="space-y-2">
          <a
            href={restaurant.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-lg bg-[var(--color-forest)] hover:bg-[#132417] text-white font-medium text-xs flex items-center justify-center gap-1.5 no-underline cursor-pointer transition-colors shadow-xs"
          >
            <span>Abrir en Google Maps</span>
            <span className="text-xs">↗</span>
          </a>

          <a
            href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-lg border border-[var(--color-border)] bg-white hover:bg-[#F9F8F3] text-[var(--color-text-primary)] font-medium text-xs flex items-center justify-center gap-1.5 no-underline cursor-pointer transition-colors"
          >
            <span>Consultar por WhatsApp</span>
            <span>💬</span>
          </a>
        </div>
      </div>
    </div>
  );
}
