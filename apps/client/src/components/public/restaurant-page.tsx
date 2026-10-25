import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Camera,
  MapPin,
  MessageCircle,
  Music2,
  Phone,
  Utensils,
  Wifi,
} from "lucide-react";

import { ThemeToggle } from "@/components/public/theme-toggle";
import { WifiAccess } from "@/components/public/wifi-access";

import type { PublicRestaurant } from "@food360/types";

export function RestaurantPage({
  restaurant,
  isSubdomain = false,
}: {
  restaurant: PublicRestaurant;
  isSubdomain?: boolean;
}) {
  const name = restaurant.name.trim() || "Restaurante";

  const phone = restaurant.phone?.trim() ?? "";
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  const safeHttpsUrl = (value: string | null | undefined, hosts: string[]) => {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        hosts.includes(url.hostname.toLowerCase()) &&
        !url.username &&
        !url.password
        ? url.toString()
        : null;
    } catch {
      return null;
    }
  };
  const whatsappHref = safeHttpsUrl(restaurant.whatsappUrl, ["wa.me"]);
  const instagramHref = safeHttpsUrl(restaurant.instagramUrl, [
    "instagram.com",
    "www.instagram.com",
  ]);
  const tiktokHref = safeHttpsUrl(restaurant.tiktokUrl, [
    "tiktok.com",
    "www.tiktok.com",
    "vm.tiktok.com",
  ]);
  const mapsHref =
    safeHttpsUrl(restaurant.googleBusinessUrl, [
      "google.com",
      "www.google.com",
      "maps.google.com",
      "maps.app.goo.gl",
      "goo.gl",
    ]) ??
    (restaurant.address?.trim()
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address.trim())}`
      : null);
  const menuHref = isSubdomain
    ? "/menu"
    : `/${encodeURIComponent(restaurant.slug)}/menu`;

  return (
    <main className="flex min-h-screen w-full flex-1 flex-col bg-(--color-bg-base) text-(--color-text-body)">
      {/* Encabezado */}
      <header className="relative w-full overflow-hidden bg-[#171717]">
        <div className="absolute inset-0 bg-linear-to-br from-[#263b2c] via-[#171717] to-[#171717]" />

        <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white no-underline"
            aria-label="Food360"
          >
            food<span className="text-(--color-accent-terracotta)">360</span>
          </Link>

          <ThemeToggle />
        </div>

        {/* Identidad del restaurante */}
        <section
          className="relative flex flex-col items-center px-5 pb-8 pt-5 text-center sm:pb-10"
          aria-labelledby="restaurant-name"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl font-semibold text-white shadow-xl backdrop-blur-sm">
            {name.charAt(0).toLocaleUpperCase("es")}
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
            Experiencia gastronómica
          </p>

          <h1
            id="restaurant-name"
            className="mt-2 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {name}
          </h1>

          {restaurant.address && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/75">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{restaurant.address}</span>
            </p>
          )}
        </section>
      </header>

      {/* Acciones: todas en vertical */}
      <section
        className="mx-auto w-full max-w-md flex-1 space-y-3.5 px-5 py-7 sm:px-8 sm:py-9 md:max-w-2xl lg:max-w-3xl"
        aria-label="Servicios del restaurante"
      >
        {/* Carta */}
        <Link
          href={menuHref}
          className="editorial-hub-card-primary group block p-4 no-underline sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/60 text-(--color-text-primary)">
                <Utensils className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h2 className="text-[16px] font-bold leading-tight tracking-tight text-(--color-text-primary)">
                  Ver carta y ordenar
                </h2>

                <p className="mt-1 text-[13px] leading-snug text-(--color-text-primary)/65">
                  Descubre nuestros platos y prepara tu pedido.
                </p>
              </div>
            </div>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--color-text-primary) text-white transition-transform group-hover:translate-x-1">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Wi-Fi */}
        {restaurant.wifi.ssid && (
          <div className="editorial-hub-card group flex w-full items-center gap-3.5 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-bg-subtle) text-(--color-text-primary)">
              <Wifi className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-[15px] font-medium leading-tight text-(--color-text-primary)">
                Wi-Fi para visitantes
              </h2>
              <p className="mt-1 text-[13px] text-(--color-text-muted)">
                Conéctate a {restaurant.wifi.ssid}
              </p>
            </div>
            <WifiAccess
              ssid={restaurant.wifi.ssid}
              password={restaurant.wifi.password}
            />
          </div>
        )}

        {/* WhatsApp */}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-hub-card group block p-4 no-underline"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-bg-subtle) text-(--color-text-primary)">
                  <MessageCircle className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-[15px] font-medium leading-tight text-(--color-text-primary)">
                    Atención por WhatsApp
                  </h2>

                  <p className="mt-1 text-[13px] leading-snug text-(--color-text-muted)">
                    Consultas, reservas y asistencia.
                  </p>
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-(--color-text-subtle) transition-transform group-hover:translate-x-0.5" />
            </div>
          </a>
        )}

        {/* Llamar por teléfono */}
        {instagramHref && (
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-hub-card group block p-4 no-underline"
          >
            <ActionContent
              icon={<Camera className="h-5 w-5" />}
              title="Instagram"
              description="Síguenos para ver novedades y platos."
            />
          </a>
        )}

        {tiktokHref && (
          <a
            href={tiktokHref}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-hub-card group block p-4 no-underline"
          >
            <ActionContent
              icon={<Music2 className="h-5 w-5" />}
              title="TikTok"
              description="Mira nuestros videos y novedades."
            />
          </a>
        )}

        {phoneHref && (
          <a
            href={phoneHref}
            className="editorial-hub-card group block p-4 no-underline"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-bg-subtle) text-(--color-text-primary)">
                  <Phone className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-[15px] font-medium leading-tight text-(--color-text-primary)">
                    Llamar al restaurante
                  </h2>

                  <p className="mt-1 text-[13px] text-(--color-text-muted)">
                    {phone}
                  </p>
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-(--color-text-subtle)" />
            </div>
          </a>
        )}

        {/* Ubicación */}
        {mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-hub-card group block p-4 no-underline"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-bg-subtle) text-(--color-text-primary)">
                  <MapPin className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <h2 className="text-[15px] font-medium leading-tight text-(--color-text-primary)">
                    Ubicación y cómo llegar
                  </h2>

                  <p className="mt-1 text-[13px] leading-snug text-(--color-text-muted)">
                    Consulta la dirección en Google Maps.
                  </p>
                </div>
              </div>

              <ArrowUpRight className="h-4 w-4 shrink-0 text-(--color-text-subtle) transition-transform group-hover:translate-x-0.5" />
            </div>
          </a>
        )}

        {/* Estado sin datos de contacto */}
        {!phoneHref &&
          !mapsHref &&
          !whatsappHref &&
          !instagramHref &&
          !tiktokHref &&
          !restaurant.wifi.ssid && (
            <p className="px-4 py-3 text-center text-xs text-(--color-text-muted)">
              Este restaurante aún no ha publicado sus datos de contacto.
            </p>
          )}
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-(--color-border) bg-(--color-bg-base) px-4 py-6 text-center">
        <p className="font-editorial-serif text-base font-medium text-(--color-text-primary)">
          {name}
        </p>

        <p className="mt-1 text-[11px] text-(--color-text-subtle)">
          Presentado con Food360 · {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  );
}

function ActionContent({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-bg-subtle) text-(--color-text-primary)">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium leading-tight text-(--color-text-primary)">
            {title}
          </h2>
          <p className="mt-1 text-[13px] leading-snug text-(--color-text-muted)">
            {description}
          </p>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-(--color-text-subtle) transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}
