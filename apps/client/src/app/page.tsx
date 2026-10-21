"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { restaurant } from "@/data/restaurant";
import { useSession } from "@/context/SessionContext";
import WifiModal from "@/components/shared/wifi-modal";
import DirectionsModal from "@/components/shared/directions-modal";

function HubContent() {
  const searchParams = useSearchParams();
  const { originId, originType, setOrigin } = useSession();
  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline
        .from('[data-animate="hub-hero"]', {
          opacity: 0,
          y: -18,
          duration: 0.6,
        })
        .from(
          '[data-animate="hub-card"]',
          { opacity: 0, y: 22, duration: 0.48, stagger: 0.09 },
          "-=0.22",
        )
        .from(
          '[data-animate="hub-social"]',
          { opacity: 0, y: 12, duration: 0.4 },
          "-=0.1",
        );
    }, pageRef);

    return () => context.revert();
  }, []);

  // Captura el parámetro de mesa o canal ?id=
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      setOrigin(idParam);
    }
  }, [searchParams, setOrigin]);

  const originLabel =
    originType === "mesa"
      ? `Mesa ${originId.replace(/^mesa-?/i, "")}`
      : originType === "delivery"
        ? "Servicio Delivery"
        : originId !== "walk-in"
          ? originId
          : null;

  return (
    <div
      ref={pageRef}
      className="flex-1 flex flex-col w-full bg-(--color-bg-base) text-(--color-text-body)"
    >
      <div
        data-animate="hub-hero"
        className="relative w-full overflow-hidden bg-(--color-text-primary)"
      >
        <div className="relative h-60 sm:h-72 w-full">
          <Image
            src={restaurant.heroImage}
            alt={restaurant.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover opacity-50 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C3121] via-[#1C3121]/55 to-black/35" />

          {/* Badge de Origen QR detectado (Mesa activa) */}
          {originLabel && (
            <div className="absolute top-4 inset-x-0 flex justify-center z-10 animate-fade-in">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 text-[var(--color-text-primary)] text-[11px] font-medium tracking-wide backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-terracotta)] animate-pulse" />
                <span>Sesión activa: {originLabel}</span>
              </span>
            </div>
          )}

          {/* Logotipo Central & Tipografía Editorial */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-4">
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.06em] text-white drop-shadow-xs select-none">
              {restaurant.logoText}
            </h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 mt-2 font-medium">
              {restaurant.tagline}
            </p>
          </div>

          {/* Estado de Horario */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center">
            <span className="inline-flex items-center gap-2 text-[11px] font-medium text-white bg-[var(--color-accent-terracotta)] px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>
                {restaurant.openStatus} • {restaurant.openUntil}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Enlaces del Hub (Fondo Blanco Puro sobre Crema, Bordes 12px) */}
      <div className="flex-1 px-5 md:px-8 lg:px-12 py-6 md:py-10 space-y-3.5 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
        {/* TARJETA PRINCIPAL: MENÚ DIGITAL (Forest Green con acento) */}
        <Link
          href="/menu"
          data-animate="hub-card"
          className="editorial-hub-card-primary block p-4 sm:p-5 no-underline cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-white/60 flex items-center justify-center text-[var(--color-text-primary)] flex-shrink-0 transition-colors">
                {/* Icono Cubiertos Line-Art (Stroke 1.5px) */}
                <svg
                  className="w-5 h-5 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M14 2v6a3 3 0 0 0 3 3M3 2v7a4 4 0 0 0 4 4v9M7 2v20" />
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-[var(--color-text-primary)] leading-tight tracking-tight">
                  Ver Carta & Ordenar
                </h2>
                <p className="text-[13px] text-[var(--color-text-primary)]/65 mt-0.5 font-normal leading-snug">
                  Explora nuestros platos y envía tu orden a cocina
                </p>
              </div>
            </div>

            {/* Flecha de acción */}
            <div className="w-8 h-8 rounded-full bg-[var(--color-text-primary)] flex items-center justify-center text-white text-xs font-medium flex-shrink-0 group-hover:translate-x-1 transition-transform">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>

        {/* TARJETA WI-FI (Fondo Blanco Puro) */}
        <button
          onClick={() => setIsWifiOpen(true)}
          data-animate="hub-card"
          className="editorial-hub-card w-full text-left p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] flex items-center justify-center flex-shrink-0">
                {/* Icono Wi-Fi Line-Art (Stroke 1.5px) */}
                <svg
                  className="w-5 h-5 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[15px] text-[var(--color-text-primary)]">
                  Red Wi-Fi de Cortesía
                </h3>
                <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
                  Conéctate a la red del restaurante
                </p>
              </div>
            </div>

            <span className="text-[11px] font-semibold tracking-wide text-white bg-[var(--color-accent-terracotta)] px-3 py-1.5 rounded-full">
              Ver Clave
            </span>
          </div>
        </button>

        {/* TARJETA WHATSAPP (Fondo Blanco Puro) */}
        <a
          href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(restaurant.whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          data-animate="hub-card"
          className="editorial-hub-card block p-4 no-underline cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] flex items-center justify-center flex-shrink-0">
                {/* Icono Chat Line-Art (Stroke 1.5px) */}
                <svg
                  className="w-5 h-5 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[15px] text-[var(--color-text-primary)]">
                  Atención por WhatsApp
                </h3>
                <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
                  Consultas, reservas y asistencia
                </p>
              </div>
            </div>

            <span className="text-xs text-[var(--color-text-subtle)] group-hover:translate-x-0.5 transition-transform">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17L17 7M17 7H7M17 7V17"
                />
              </svg>
            </span>
          </div>
        </a>

        {/* TARJETA DIRECCIONES / MAPA (Fondo Blanco Puro) */}
        <button
          onClick={() => setIsDirectionsOpen(true)}
          data-animate="hub-card"
          className="editorial-hub-card w-full text-left p-4 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] flex items-center justify-center flex-shrink-0">
                {/* Icono Pin Mapa Line-Art (Stroke 1.5px) */}
                <svg
                  className="w-5 h-5 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[15px] text-[var(--color-text-primary)]">
                  Ubicación & Cómo Llegar
                </h3>
                <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
                  {restaurant.address}
                </p>
              </div>
            </div>

            <span className="text-xs text-[var(--color-text-subtle)] group-hover:translate-x-0.5 transition-transform">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 17L17 7M17 7H7M17 7V17"
                />
              </svg>
            </span>
          </div>
        </button>

        {/* REDES SOCIALES EDITORIALES (Line-art minimalista) */}
        <div data-animate="hub-social" className="pt-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-subtle)] text-center mb-3">
            Síguenos en Redes Sociales
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {/* Instagram */}
            <a
              href="https://instagram.com/quacuisine"
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-hub-card p-3 rounded-lg flex items-center justify-center gap-2.5 no-underline cursor-pointer group text-[var(--color-text-primary)] hover:border-[var(--color-forest)]"
            >
              <svg
                className="w-4 h-4 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span className="text-xs font-medium">Instagram</span>
            </a>

            {/* TikTok */}
            <a
              href="https://tiktok.com/@quacuisine"
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-hub-card p-3 rounded-lg flex items-center justify-center gap-2.5 no-underline cursor-pointer group text-[var(--color-text-primary)] hover:border-[var(--color-forest)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.27 6.27 0 0 0 1.86-4.47V8.78a8.16 8.16 0 0 0 4.92 1.62V6.95a4.85 4.85 0 0 1-1-.26z" />
              </svg>
              <span className="text-xs font-medium">TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Footer Editorial */}
      <footer className="mt-auto py-6 px-4 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border)] bg-[var(--color-bg-base)]">
        <p className="font-editorial-serif font-medium text-sm text-[var(--color-text-primary)]">
          {restaurant.name}
        </p>
        <p className="text-[11px] text-[var(--color-text-subtle)] mt-0.5">
          © {new Date().getFullYear()} · Haute Cuisine & Digital Menu Platform
        </p>
      </footer>

      {/* Modals */}
      <WifiModal
        isOpen={isWifiOpen}
        onClose={() => setIsWifiOpen(false)}
        ssid={restaurant.wifi.ssid}
        password={restaurant.wifi.password}
      />

      <DirectionsModal
        isOpen={isDirectionsOpen}
        onClose={() => setIsDirectionsOpen(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#132417] flex items-center justify-center p-8 text-center text-white">
          <div className="animate-spin w-7 h-7 border-2 border-[#D4A359] border-t-transparent rounded-full mb-3" />
        </div>
      }
    >
      <HubContent />
    </Suspense>
  );
}
