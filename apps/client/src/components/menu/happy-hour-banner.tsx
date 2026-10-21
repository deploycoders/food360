'use client';


interface HappyHourBannerProps {
  onViewHappyHour: () => void;
}

export default function HappyHourBanner({ onViewHappyHour }: HappyHourBannerProps) {
  return (
    <div className="mx-4 my-2 p-6 rounded-2xl bg-[var(--color-bg-banner)] border border-[#ebd8b0] text-center shadow-xs">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#9c6a1e] mb-1">
        • HAPPY HOUR •
      </p>
      <h3 className="font-brand-serif text-2xl sm:text-3xl font-bold text-[var(--color-text-title)] mb-1">
        Happy Hour Menu
      </h3>
      <p className="text-xs text-[#785b2e] font-medium mb-4">
        Mon–Fri · 2 PM–5 PM · Excluding Holidays
      </p>

      <button
        onClick={onViewHappyHour}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-text-title)] hover:opacity-75 transition-opacity cursor-pointer border-b border-black/30 pb-0.5"
      >
        <span>View Happy Hour Menu</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}
