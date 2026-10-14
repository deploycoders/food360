'use client';

import React from 'react';

interface LinkButtonProps {
  emoji: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'social';
  href?: string;
  onClick?: () => void;
  delay?: number;
}

export default function LinkButton({ emoji, label, variant = 'secondary', href, onClick, delay = 0 }: LinkButtonProps) {
  const baseClasses = `
    group relative w-full flex items-center gap-4 px-6 py-4 rounded-2xl
    font-semibold text-base transition-all duration-300 ease-out
    backdrop-blur-md cursor-pointer
    hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]
    animate-fade-in-up
  `;

  const variantClasses = {
    primary: `
      btn-primary border border-[var(--color-border)]
      text-white
    `,
    secondary: `
      glass-panel text-[var(--color-text-main)]
      hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)]
    `,
    social: `
      bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]
      hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-border-hover)]
      hover:text-[var(--color-text-main)]
    `,
  };

  const style = { animationDelay: `${delay}ms` };

  const content = (
    <>
      <span className="text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
        {emoji}
      </span>
      <span className="flex-1 text-left">{label}</span>
      <svg
        className="w-5 h-5 opacity-40 transition-all duration-300 group-hover:opacity-80 group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/[0.02] pointer-events-none" />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantClasses[variant]} no-underline`}
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={style}
    >
      {content}
    </button>
  );
}
