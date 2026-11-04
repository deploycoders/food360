import * as motion from "motion/react-client";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";
import { siInstagram, siTiktok, siWhatsapp } from "simple-icons";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Phone,
  Utensils,
  Wifi,
} from "lucide-react";

import { ThemeToggle } from "@/components/public/theme-toggle";
import { WifiAccess } from "@/components/public/wifi-access";
import { TenantBinder } from "@/context/TenantContext";

import type { PublicRestaurant } from "@food360/types";

type RestaurantLink = {
  key: string;
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
  external?: boolean;
};

type SocialLink = {
  key: string;
  href: string;
  icon: SimpleIcon;
  label: string;
};

export function RestaurantPage({
  restaurant,
  isSubdomain = false,
}: {
  restaurant: PublicRestaurant;
  isSubdomain?: boolean;
}) {
  const name = restaurant.name.trim() || "Restaurante";
  const phone = restaurant.phone?.trim() ?? "";

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("es");

  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;

  // Validación de enlaces externos.
  const safeHttpsUrl = (value: string | null | undefined, hosts: string[]) => {
    if (!value) return null;

    try {
      const url = new URL(value);

      if (
        url.protocol !== "https:" ||
        !hosts.includes(url.hostname.toLowerCase()) ||
        url.username ||
        url.password ||
        url.port
      ) {
        return null;
      }

      return url.toString();
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
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          restaurant.address.trim(),
        )}`
      : null);

  const menuHref = isSubdomain
    ? "/menu"
    : `/${encodeURIComponent(restaurant.slug)}/menu`;

  const homeHref = isSubdomain
    ? "/"
    : `/${encodeURIComponent(restaurant.slug)}`;

  // Enlaces de contacto.
  const contactLinks: RestaurantLink[] = [
    ...(mapsHref
      ? [
          {
            key: "maps",
            href: mapsHref,
            icon: <MapPin className="h-4.75 w-4.75" />,
            title: "Cómo llegar",
            description:
              restaurant.address?.trim() || "Ver ubicación en Google Maps",
            external: true,
          },
        ]
      : []),

    ...(phoneHref
      ? [
          {
            key: "phone",
            href: phoneHref,
            icon: <Phone className="h-4.75 w-4.75" />,
            title: "Llamar al restaurante",
            description: phone,
          },
        ]
      : []),
  ];

  // Logotipos reales de marcas mediante Simple Icons.
  const socialLinks: SocialLink[] = [
    ...(whatsappHref
      ? [
          {
            key: "whatsapp",
            href: whatsappHref,
            icon: siWhatsapp,
            label: "WhatsApp",
          },
        ]
      : []),

    ...(instagramHref
      ? [
          {
            key: "instagram",
            href: instagramHref,
            icon: siInstagram,
            label: "Instagram",
          },
        ]
      : []),

    ...(tiktokHref
      ? [
          {
            key: "tiktok",
            href: tiktokHref,
            icon: siTiktok,
            label: "TikTok",
          },
        ]
      : []),
  ];

  const hasContactInformation =
    Boolean(restaurant.wifi.ssid) ||
    contactLinks.length > 0 ||
    socialLinks.length > 0;

  return (
    <main className="relative flex min-h-dvh w-full flex-1 flex-col overflow-hidden bg-(--color-bg-base) text-(--color-text-body) transition-colors duration-300">
      <TenantBinder restaurant={restaurant} />

      {/* Decoración ambiental */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-(--color-accent-terracotta)/[0.035] blur-3xl"
      />

      <div className="relative mx-auto flex w-full flex-1 flex-col px-5 pb-8 pt-5 sm:px-7 sm:pt-7">
        {/* Barra superior */}
        <header className="flex items-center justify-between">
          <Link
            href={homeHref}
            aria-label="Volver al perfil del restaurante"
            className="inline-flex items-center gap-0.5 rounded-lg text-lg font-bold tracking-tight text-(--color-text-primary) no-underline outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta)"
          >
            Food
            <span className="text-(--color-accent-terracotta)">360</span>
          </Link>

          <ThemeToggle />
        </header>

        {/* Identidad del restaurante */}
        <section
          className="flex flex-col items-center pb-7 pt-12 text-center sm:pt-14"
          aria-labelledby="restaurant-name"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative mb-5 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-bg-surface) shadow-[0_12px_35px_-18px_rgba(23,23,23,0.22)] ring-4 ring-(--color-bg-base) dark:shadow-[0_12px_35px_-18px_rgba(0,0,0,0.65)]"
          >
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={`Logo de ${name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-editorial-serif text-3xl font-semibold tracking-tight text-(--color-text-primary)">
                {initials}
              </span>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="w-full"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-(--color-text-subtle)">
              Bienvenido a
            </p>

            <h1
              id="restaurant-name"
              className="mt-2 wrap-break-word font-editorial-serif text-3xl font-semibold leading-tight tracking-[-0.035em] text-(--color-text-primary) sm:text-4xl"
            >
              {name}
            </h1>

            {restaurant.address?.trim() && (
              <p className="mt-3 inline-flex max-w-full items-center justify-center gap-1.5 text-xs leading-relaxed text-(--color-text-muted)">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-(--color-accent-terracotta)" />
                <span>{restaurant.address}</span>
              </p>
            )}
          </motion.div>
        </section>

        {/* Carta digital: acción principal */}
        <section aria-label="Carta digital">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.16 }}
          >
            <Link
              href={menuHref}
              className="group relative flex min-h-29 items-center justify-between gap-4 overflow-hidden rounded-2xl border border-transparent bg-(--color-forest) p-5 text-white no-underline shadow-[0_18px_38px_-22px_rgba(35,63,46,0.55)] outline-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_42px_-20px_rgba(35,63,46,0.55)] focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg-base) dark:border-(--color-border) dark:bg-(--color-bg-surface) dark:text-(--color-text-primary) dark:shadow-[0_18px_38px_-22px_rgba(0,0,0,0.7)] dark:hover:border-(--color-accent-terracotta)"
            >
              {/* Decoración */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border border-white/8 dark:border-(--color-border)"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-9 h-28 w-28 rounded-full border border-white/8 dark:border-(--color-border)"
              />

              <div className="relative z-10 min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <Utensils className="h-3.5 w-3.5 text-white/75 dark:text-(--color-accent-terracotta)" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 dark:text-(--color-text-muted)">
                    ¿QUE HAY PARA COMER?
                  </span>
                </div>

                <h2 className="font-editorial-serif text-2xl font-semibold leading-tight tracking-tight text-white dark:text-(--color-text-primary)">
                  Nuestra carta
                </h2>

                <p className="mt-1 text-xs text-white/75 dark:text-(--color-text-muted)">
                  Explora los platos y prepara tu pedido.
                </p>
              </div>

              <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/20 dark:border-(--color-border) dark:bg-(--color-bg-subtle) dark:text-(--color-text-primary) dark:group-hover:bg-(--color-bg-base)">
                <ArrowRight className="h-5 w-5" />
              </span>
            </Link>
          </motion.div>
        </section>

        {/* Enlaces secundarios */}
        {hasContactInformation && (
          <section className="mt-9" aria-labelledby="restaurant-links-title">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
            >
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-text-subtle)">
                    MÁS INFORMACIÓN
                  </p>

                  <h2
                    id="restaurant-links-title"
                    className="mt-1 font-editorial-serif text-xl font-semibold text-(--color-text-primary)"
                  >
                    Conecta con nosotros
                  </h2>
                </div>

                <span className="pb-1 text-[10px] font-medium tracking-wide text-(--color-text-subtle)">
                  CONTACTO
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Wi-Fi */}
                {restaurant.wifi.ssid && (
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="flex min-h-18.5 items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-surface) px-4 py-3 transition-colors hover:border-(--color-border-dark)"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-bg-subtle) text-(--color-text-primary)">
                      <Wifi className="h-4.75 w-4.75" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-(--color-text-primary)">
                        Wi-Fi para visitantes
                      </h3>

                      <p className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                        Conéctate a {restaurant.wifi.ssid}
                      </p>
                    </div>

                    <WifiAccess
                      ssid={restaurant.wifi.ssid}
                      password={restaurant.wifi.password ?? null}
                    />
                  </motion.div>
                )}

                {/* Ubicación y teléfono */}
                {contactLinks.map((link, index) => (
                  <motion.a
                    key={link.key}
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.26 + index * 0.05,
                    }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.995 }}
                    className="group flex min-h-18.5 items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-surface) px-4 py-3 text-(--color-text-primary) no-underline outline-none transition-all duration-200 hover:border-(--color-border-dark) hover:shadow-[0_8px_22px_-18px_rgba(23,23,23,0.35)] focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta) dark:hover:shadow-[0_8px_22px_-18px_rgba(0,0,0,0.65)]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-bg-subtle) text-(--color-text-primary) transition-colors group-hover:text-(--color-accent-terracotta)">
                      {link.icon}
                    </span>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-(--color-text-primary)">
                        {link.title}
                      </h3>

                      {link.description && (
                        <p className="mt-0.5 truncate text-xs text-(--color-text-muted)">
                          {link.description}
                        </p>
                      )}
                    </div>

                    <ArrowUpRight className="h-4 w-4 shrink-0 text-(--color-text-subtle) transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Redes sociales: logotipos oficiales */}
        {socialLinks.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="mt-9 text-center"
            aria-label="Redes sociales del restaurante"
          >
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-text-subtle)">
              SÍGUENOS Y CONVERSEMOS
            </p>

            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-primary) outline-none transition-colors hover:border-(--color-accent-terracotta) hover:bg-(--color-bg-subtle) hover:text-(--color-accent-terracotta) focus-visible:ring-2 focus-visible:ring-(--color-accent-terracotta)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={social.icon.path} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.section>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-(--color-border)" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-(--color-text-subtle)">
              COCINA · PIDE · DISFRUTA
            </span>

            <span className="h-px w-8 bg-(--color-border)" />
          </div>

          <p className="font-editorial-serif text-sm font-medium text-(--color-text-primary)">
            {name}
          </p>

          <p className="mt-1.5 text-[10px] text-(--color-text-subtle)">
            Presentado con Food360 · {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </main>
  );
}
