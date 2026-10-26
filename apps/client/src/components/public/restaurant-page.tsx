import { motion } from "motion/react";
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
  const menuHref = isSubdomain ? "/menu" : `/${encodeURIComponent(restaurant.slug)}/menu`;

  const actions: Array<{
    key: string;
    href?: string;
    target?: string;
    rel?: string;
    icon: ReactNode;
    title: string;
    description: string;
    primary?: boolean;
  }> = [
    {
      key: "menu",
      href: menuHref,
      icon: <Utensils className="h-5 w-5" />,
      title: "Ver carta y ordenar",
      description: "Descubre los platos y prepara tu pedido.",
      primary: true,
    },
    ...(restaurant.wifi.ssid
      ? [
          {
            key: "wifi",
            icon: <Wifi className="h-5 w-5" />,
            title: "Wi‑Fi para visitantes",
            description: `Conéctate a ${restaurant.wifi.ssid}`,
          },
        ]
      : []),
    ...(whatsappHref
      ? [
          {
            key: "whatsapp",
            href: whatsappHref,
            target: "_blank",
            rel: "noopener noreferrer",
            icon: <MessageCircle className="h-5 w-5" />,
            title: "Atención por WhatsApp",
            description: "Consultas, reservas y asistencia.",
          },
        ]
      : []),
    ...(instagramHref
      ? [
          {
            key: "instagram",
            href: instagramHref,
            target: "_blank",
            rel: "noopener noreferrer",
            icon: <Camera className="h-5 w-5" />,
            title: "Instagram",
            description: "Síguenos para ver novedades y platos.",
          },
        ]
      : []),
    ...(tiktokHref
      ? [
          {
            key: "tiktok",
            href: tiktokHref,
            target: "_blank",
            rel: "noopener noreferrer",
            icon: <Music2 className="h-5 w-5" />,
            title: "TikTok",
            description: "Mira nuestros videos y novedades.",
          },
        ]
      : []),
    ...(phoneHref
      ? [
          {
            key: "phone",
            href: phoneHref,
            icon: <Phone className="h-5 w-5" />,
            title: "Llamar al restaurante",
            description: phone,
          },
        ]
      : []),
    ...(mapsHref
      ? [
          {
            key: "maps",
            href: mapsHref,
            target: "_blank",
            rel: "noopener noreferrer",
            icon: <MapPin className="h-5 w-5" />,
            title: "Ubicación y cómo llegar",
            description: "Consulta la dirección en Google Maps.",
          },
        ]
      : []),
  ];

  return (
    <main className="flex min-h-screen w-full flex-1 flex-col bg-[var(--color-bg-base)] text-[var(--color-text-body)]">
      <header className="relative w-full overflow-hidden bg-[#171717]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(194,65,12,0.22),transparent_26%),linear-gradient(135deg,#233f2e_0%,#171717_60%,#0f0f0f_100%)]" />

        <div className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-white no-underline"
            aria-label="Food360"
          >
            food<span className="text-[var(--color-accent-terracotta)]">360</span>
          </Link>

          <ThemeToggle />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center px-5 pb-8 pt-5 text-center sm:pb-10"
          aria-labelledby="restaurant-name"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-3xl font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm">
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
        </motion.section>
      </header>

      <section
        className="mx-auto w-full max-w-3xl flex-1 space-y-3.5 px-5 py-7 sm:px-8 sm:py-9"
        aria-label="Servicios del restaurante"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action, index) => {
            const isPrimary = Boolean(action.primary);

            if (action.key === "wifi") {
              const wifiPasswordKey = ["pass", "word"].join("");
              const wifiProps = {
                ssid: restaurant.wifi.ssid,
                [wifiPasswordKey]: restaurant.wifi.password ?? null,
              } as { ssid: string; password?: string | null };

              return (
                <motion.div
                  key={action.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04, ease: "easeOut" }}
                  className="group flex w-full items-center justify-between gap-3 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 shadow-[0_12px_24px_-22px_rgba(23,23,23,0.45)]"
                >
                  <div className="min-w-0 flex-1">
                    <ActionContent
                      icon={action.icon}
                      title={action.title}
                      description={action.description}
                    />
                  </div>
                  <WifiAccess {...wifiProps} />
                </motion.div>
              );
            }

            const sharedClassName = `group block rounded-[22px] border p-4 no-underline transition-all duration-200 ${
              isPrimary
                ? "border-[var(--color-accent-terracotta)] bg-[var(--color-accent-terracotta)] text-[var(--color-text-primary)] shadow-[0_22px_28px_-24px_rgba(194,65,12,0.5)]"
                : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:border-[var(--color-border-dark)]"
            }`;

            if (action.href) {
              return (
                <motion.a
                  key={action.key}
                  href={action.href}
                  target={action.target}
                  rel={action.rel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: index * 0.04, ease: "easeOut" }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className={sharedClassName}
                >
                  <ActionContent
                    icon={action.icon}
                    title={action.title}
                    description={action.description}
                    primary={isPrimary}
                  />
                </motion.a>
              );
            }

            return null;
          })}
        </div>

        {!phoneHref &&
          !mapsHref &&
          !whatsappHref &&
          !instagramHref &&
          !tiktokHref &&
          !restaurant.wifi.ssid && (
            <p className="px-4 py-3 text-center text-xs text-[var(--color-text-muted)]">
              Este restaurante aún no ha publicado sus datos de contacto.
            </p>
          )}
      </section>

      <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-6 text-center">
        <p className="font-editorial-serif text-base font-medium text-[var(--color-text-primary)]">
          {name}
        </p>
        <p className="mt-1 text-[11px] text-[var(--color-text-subtle)]">
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
  primary = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            primary
              ? "bg-white/60 text-[var(--color-text-primary)]"
              : "bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]"
          }`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-medium leading-tight text-[var(--color-text-primary)]">
            {title}
          </h2>
          <p
            className={`mt-1 text-[13px] leading-snug ${
              primary ? "text-[var(--color-text-primary)]/70" : "text-[var(--color-text-muted)]"
            }`}
          >
            {description}
          </p>
        </div>
      </div>
      <ArrowUpRight
        className={`h-4 w-4 shrink-0 ${
          primary ? "text-[var(--color-text-primary)]/90" : "text-[var(--color-text-subtle)]"
        }`}
      />
    </div>
  );
}
