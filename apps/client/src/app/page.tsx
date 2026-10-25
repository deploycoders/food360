"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  Suspense,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { gsap } from "gsap";

import { restaurant } from "@/data/restaurant";
import { useSession } from "@/context/SessionContext";
import WifiModal from "@/components/shared/wifi-modal";
import DirectionsModal from "@/components/shared/directions-modal";

type IconName =
  | "utensils"
  | "wifi"
  | "message"
  | "pin"
  | "arrow"
  | "external"
  | "instagram"
  | "tiktok";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (name) {
    case "utensils":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M14 2v6a3 3 0 0 0 3 3M3 2v7a4 4 0 0 0 4 4v9M7 2v20" />
        </svg>
      );

    case "wifi":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
        </svg>
      );

    case "message":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );

    case "pin":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );

    case "arrow":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      );

    case "external":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 17 17 7M7 7h10v10" />
        </svg>
      );

    case "instagram":
      return (
        <svg
          {...common}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
        </svg>
      );

    case "tiktok":
      return (
        <svg {...common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.27 6.27 0 0 0 1.86-4.47V8.78a8.16 8.16 0 0 0 4.92 1.62V6.95a4.85 4.85 0 0 1-1-.26z" />
        </svg>
      );
  }
}

function IconBadge({
  children,
  large = false,
}: {
  children: ReactNode;
  large?: boolean;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        large
          ? "h-11 w-11 bg-white/60 text-(--color-text-primary)"
          : "h-10 w-10 bg-(--color-bg-subtle) text-(--color-text-primary)"
      }`}
    >
      {children}
    </span>
  );
}

function CardDescription({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0">
      <h2 className="text-[15px] font-medium leading-tight text-(--color-text-primary)">
        {title}
      </h2>
      <p className="mt-0.5 text-[13px] leading-snug text-(--color-text-muted)">
        {description}
      </p>
    </div>
  );
}

function HubContent() {
  const searchParams = useSearchParams();
  const { originId, originType, setOrigin } = useSession();

  const [isWifiOpen, setIsWifiOpen] = useState(false);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);

  // GSAP: las tarjetas nunca deben quedarse con opacity: 0.
  useLayoutEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    // Array.from evita el error de iteración de NodeList en TypeScript.
    const hero = Array.from(
      root.querySelectorAll<HTMLElement>('[data-animate="hub-hero"]'),
    );
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>('[data-animate="hub-card"]'),
    );
    const social = Array.from(
      root.querySelectorAll<HTMLElement>('[data-animate="hub-social"]'),
    );

    const allElements = hero.concat(cards, social);

    // Estado seguro antes de crear cualquier animación.
    gsap.set(allElements, { autoAlpha: 1, y: 0 });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      gsap.set(hero, { autoAlpha: 0, y: -18 });
      gsap.set(cards, { autoAlpha: 0, y: 22 });
      gsap.set(social, { autoAlpha: 0, y: 12 });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(allElements, { autoAlpha: 1, y: 0 });
        },
      });

      if (hero.length) {
        timeline.to(hero, { autoAlpha: 1, y: 0, duration: 0.6 });
      }

      if (cards.length) {
        timeline.to(
          cards,
          { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.09 },
          "-=0.22",
        );
      }

      if (social.length) {
        timeline.to(social, { autoAlpha: 1, y: 0, duration: 0.4 }, "-=0.1");
      }
    }, root);

    return () => {
      context.revert();

      // Si React monta y desmonta el componente durante el desarrollo,
      // restauramos los elementos a un estado visible.
      gsap.set(allElements, { autoAlpha: 1, y: 0 });
    };
  }, []);

  // Captura el identificador de mesa/canal desde la URL.
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setOrigin(id);
  }, [searchParams, setOrigin]);

  const originLabel =
    originType === "mesa"
      ? `Mesa ${originId.replace(/^mesa-?/i, "")}`
      : originType === "delivery"
        ? "Servicio Delivery"
        : originId !== "walk-in"
          ? originId
          : null;

  const whatsappUrl = `https://wa.me/${restaurant.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(restaurant.whatsappMessage)}`;

  return (
    <main
      ref={pageRef}
      className="flex w-full flex-1 flex-col bg-(--color-bg-base) text-(--color-text-body)"
    >
      {/* Hero */}
      <header
        data-animate="hub-hero"
        className="relative w-full overflow-hidden bg-(--color-text-primary)"
      >
        <div className="relative h-60 w-full sm:h-72">
          <Image
            src={restaurant.heroImage}
            alt={restaurant.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover opacity-50 brightness-90"
          />

          <div className="absolute inset-0 bg-linear-to-t from-[#1C3121] via-[#1C3121]/55 to-black/35" />

          {originLabel && (
            <div className="absolute inset-x-0 top-4 z-10 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-(--color-text-primary) backdrop-blur-md">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--color-accent-terracotta)" />
                Sesión activa: {originLabel}
              </span>
            </div>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <h1 className="select-none font-sans text-4xl font-bold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              {restaurant.logoText}
            </h1>
            <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-white/70">
              {restaurant.tagline}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-(--color-accent-terracotta) px-3.5 py-1.5 text-[11px] font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-white" />
              {restaurant.openStatus} • {restaurant.openUntil}
            </span>
          </div>
        </div>
      </header>

      {/* Enlaces */}
      <section className="mx-auto w-full max-w-md flex-1 space-y-3.5 px-5 py-6 sm:px-8 sm:py-10 md:max-w-2xl lg:max-w-4xl lg:px-12">
        <Link
          href="/menu"
          data-animate="hub-card"
          className="editorial-hub-card-primary group block p-4 no-underline sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <IconBadge large>
                <Icon name="utensils" />
              </IconBadge>
              <div>
                <h2 className="text-[17px] font-bold leading-tight tracking-tight text-(--color-text-primary)">
                  Ver Carta &amp; Ordenar
                </h2>
                <p className="mt-0.5 text-[13px] text-(--color-text-primary)/65">
                  Explora nuestros platos y envía tu orden a cocina
                </p>
              </div>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-text-primary) text-white transition-transform group-hover:translate-x-1">
              <Icon name="arrow" className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {restaurant.wifi.ssid && <button
          type="button"
          onClick={() => setIsWifiOpen(true)}
          data-animate="hub-card"
          className="editorial-hub-card group w-full p-4 text-left"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <IconBadge>
                <Icon name="wifi" />
              </IconBadge>
              <CardDescription
                title="Red Wi-Fi de Cortesía"
                description="Conéctate a la red del restaurante"
              />
            </div>
            <span className="shrink-0 rounded-full bg-(--color-accent-terracotta) px-3 py-1.5 text-[11px] font-semibold text-white">
              Ver Clave
            </span>
          </div>
        </button>}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-animate="hub-card"
          className="editorial-hub-card group block p-4 no-underline"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <IconBadge>
                <Icon name="message" />
              </IconBadge>
              <CardDescription
                title="Atención por WhatsApp"
                description="Consultas, reservas y asistencia"
              />
            </div>
            <Icon
              name="external"
              className="h-4 w-4 shrink-0 text-(--color-text-subtle) transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </a>

        <button
          type="button"
          onClick={() => setIsDirectionsOpen(true)}
          data-animate="hub-card"
          className="editorial-hub-card group w-full p-4 text-left"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <IconBadge>
                <Icon name="pin" />
              </IconBadge>
              <CardDescription
                title="Ubicación & Cómo Llegar"
                description={restaurant.address}
              />
            </div>
            <Icon
              name="external"
              className="h-4 w-4 shrink-0 text-(--color-text-subtle) transition-transform group-hover:translate-x-0.5"
            />
          </div>
        </button>

        {/* Redes sociales */}
        <div data-animate="hub-social" className="pt-3">
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-(--color-text-subtle)">
            Síguenos en Redes Sociales
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href="https://instagram.com/quacuisine"
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-hub-card flex items-center justify-center gap-2.5 rounded-lg p-3 text-(--color-text-primary) no-underline hover:border-(--color-forest)"
            >
              <Icon name="instagram" className="h-4 w-4" />
              <span className="text-xs font-medium">Instagram</span>
            </a>

            <a
              href="https://tiktok.com/@quacuisine"
              target="_blank"
              rel="noopener noreferrer"
              className="editorial-hub-card flex items-center justify-center gap-2.5 rounded-lg p-3 text-(--color-text-primary) no-underline hover:border-(--color-forest)"
            >
              <Icon name="tiktok" className="h-4 w-4" />
              <span className="text-xs font-medium">TikTok</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-(--color-border) bg-(--color-bg-base) px-4 py-6 text-center text-xs text-(--color-text-muted)">
        <p className="font-editorial-serif text-sm font-medium text-(--color-text-primary)">
          {restaurant.name}
        </p>
        <p className="mt-0.5 text-[11px] text-(--color-text-subtle)">
          © {new Date().getFullYear()} · Haute Cuisine &amp; Digital Menu
          Platform
        </p>
      </footer>

      {/* Modales */}
      <WifiModal
        isOpen={isWifiOpen && Boolean(restaurant.wifi.ssid)}
        onClose={() => setIsWifiOpen(false)}
        ssid={restaurant.wifi.ssid}
        password={restaurant.wifi.password}
      />

      <DirectionsModal
        isOpen={isDirectionsOpen}
        onClose={() => setIsDirectionsOpen(false)}
      />
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#132417] p-8">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D4A359] border-t-transparent" />
        </div>
      }
    >
      <HubContent />
    </Suspense>
  );
}
