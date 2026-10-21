'use client';

import { useState } from 'react';

interface WifiModalProps {
  isOpen: boolean;
  onClose: () => void;
  ssid: string;
  password: string;
}

export default function WifiModal({ isOpen, onClose, ssid, password }: WifiModalProps) {
  const [copiedField, setCopiedField] = useState<'ssid' | 'password' | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, field: 'ssid' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

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
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
            </svg>
          </div>
          <h3 className="font-editorial-serif text-lg font-medium text-[var(--color-text-primary)]">
            Red Wi-Fi de Cortesía
          </h3>
          <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
            Conéctate a nuestra red de alta velocidad
          </p>
        </div>

        {/* SSID */}
        <div className="mb-3">
          <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-subtle)] mb-1 block">
            Nombre de la Red (SSID)
          </label>
          <div className="flex items-center gap-2 bg-[#F9F8F3] border border-[var(--color-border)] rounded-lg px-3 py-2">
            <span className="flex-1 font-mono text-xs font-semibold text-[var(--color-text-primary)]">
              {ssid}
            </span>
            <button
              onClick={() => copyToClipboard(ssid, 'ssid')}
              className="px-2.5 py-1 rounded-md bg-white border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-primary)] hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedField === 'ssid' ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--color-text-subtle)] mb-1 block">
            Contraseña
          </label>
          <div className="flex items-center gap-2 bg-[#F9F8F3] border border-[var(--color-border)] rounded-lg px-3 py-2">
            <span className="flex-1 font-mono text-xs font-semibold text-[var(--color-text-primary)]">
              {password}
            </span>
            <button
              onClick={() => copyToClipboard(password, 'password')}
              className="px-2.5 py-1 rounded-md bg-white border border-[var(--color-border)] text-[11px] font-medium text-[var(--color-text-primary)] hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedField === 'password' ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[var(--color-forest)] hover:bg-[#132417] text-white font-medium text-xs tracking-wide cursor-pointer transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
