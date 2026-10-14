'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { RestaurantInfo } from '@/types';

interface HeroBannerProps {
  restaurant: RestaurantInfo;
  onOpenWifi: () => void;
  onOpenDirections: () => void;
}

export default function HeroBanner({ restaurant, onOpenWifi, onOpenDirections }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(1);

  return (
    <div className="relative w-full overflow-hidden bg-neutral-900 text-white">
      {/* Background Restaurant Image */}
      <div className="relative h-72 sm:h-80 w-full">
        <Image
          src={restaurant.heroImage}
          alt={restaurant.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 480px"
          className="object-cover opacity-60 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

        {/* Brand Center Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-brand-serif text-6xl sm:text-7xl font-extrabold tracking-wider text-white drop-shadow-lg select-none">
            {restaurant.logoText}
          </h1>
          <p className="text-xs uppercase tracking-widest text-white/80 mt-1 font-medium">
            {restaurant.tagline}
          </p>
        </div>

        {/* Action Pills Row */}
        <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-2 px-3 flex-wrap">
          {/* Status badge */}
          <div className="hero-pill text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{restaurant.openStatus} · {restaurant.openUntil}</span>
          </div>

          {/* Directions button */}
          <button
            onClick={onOpenDirections}
            className="hero-pill text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>📍</span>
            <span>Directions</span>
          </button>

          {/* WiFi button */}
          <button
            onClick={onOpenWifi}
            className="hero-pill text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <span>📶</span>
            <span>WiFi</span>
          </button>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(restaurant.whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-pill text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md no-underline cursor-pointer"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Carousel Dots Indicators (• ▬ • •) */}
      <div className="bg-[var(--color-bg-page)] py-3 flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveSlide(0)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 0 ? 'w-5 bg-[var(--color-brand)]' : 'w-1.5 bg-neutral-300'
          }`}
          aria-label="Slide 1"
        />
        <button
          onClick={() => setActiveSlide(1)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 1 ? 'w-6 bg-[var(--color-brand)]' : 'w-1.5 bg-neutral-300'
          }`}
          aria-label="Slide 2"
        />
        <button
          onClick={() => setActiveSlide(2)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 2 ? 'w-5 bg-[var(--color-brand)]' : 'w-1.5 bg-neutral-300'
          }`}
          aria-label="Slide 3"
        />
        <button
          onClick={() => setActiveSlide(3)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 3 ? 'w-5 bg-[var(--color-brand)]' : 'w-1.5 bg-neutral-300'
          }`}
          aria-label="Slide 4"
        />
      </div>
    </div>
  );
}
