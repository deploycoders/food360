"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useSession } from "@/context/SessionContext";
import { useTenant } from "@/context/TenantContext";

import OrderOriginSelector from "@/components/cart/order-origin-selector";
import CustomerForm from "@/components/customer/customer-form";

import { submitOrder } from "@/services/order.service";
import { formatCurrency, formatOriginLabel } from "@/lib/formatters";

import {
  formatLocalDateTimeForDisplay,
  getScheduledTimeValidationError,
  type RestaurantSchedule,
} from "@/lib/restaurant-schedule";

import type { OrderPayload } from "@/types";

interface PublicScheduleResponse {
  success?: boolean;
  error?: string;
  data?: {
    timezone?: unknown;
    schedules?: unknown;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeSchedules(value: unknown): RestaurantSchedule[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item): RestaurantSchedule[] => {
    if (!isRecord(item)) return [];

    const dayOfWeek = item.day_of_week;
    const isOpen = item.is_open;
    const openTime = item.open_time;
    const closeTime = item.close_time;
    const closesNextDay = item.closes_next_day;

    if (
      typeof dayOfWeek !== "number" ||
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 0 ||
      dayOfWeek > 6 ||
      typeof isOpen !== "boolean" ||
      typeof closesNextDay !== "boolean" ||
      (openTime !== null && typeof openTime !== "string") ||
      (closeTime !== null && typeof closeTime !== "string")
    ) {
      return [];
    }

    return [
      {
        day_of_week: dayOfWeek,
        is_open: isOpen,
        open_time: openTime,
        close_time: closeTime,
        closes_next_day: closesNextDay,
      },
    ];
  });
}

export default function CartPage() {
  const {
    items,
    totalPrice,
    totalItems,
    updateQuantity,
    removeItem,
    clearCart,
    isReady: cartReady,
  } = useCart();

  const {
    origin,
    tablePublicCode,
    tableNumber,
    scheduledForLocal,
    customerData,
    isCustomerRegistered,
    setCustomerData,
    setOrderOrigin,
    setScheduledForLocal,
    isReady: sessionReady,
  } = useSession();

  const {
    restaurantPublicId,
    isReady: tenantReady,
    status: tenantStatus,
    slug,
  } = useTenant();

  const shouldReduceMotion = useReducedMotion();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submittedOrder, setSubmittedOrder] = useState<OrderPayload | null>(
    null,
  );

  const [submittedScheduledForLocal, setSubmittedScheduledForLocal] = useState<
    string | null
  >(null);

  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const [menuHref, setMenuHref] = useState("/menu");

  // Horarios públicos del restaurante.
  const [restaurantTimezone, setRestaurantTimezone] = useState<string | null>(
    null,
  );

  const [restaurantSchedules, setRestaurantSchedules] = useState<
    RestaurantSchedule[]
  >([]);

  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const isReady = tenantReady && cartReady && sessionReady;

  const hasCustomerData = Boolean(isCustomerRegistered && customerData);

  const isQrDineIn = origin === "DINE_IN" && Boolean(tablePublicCode);

  const isScheduledDineIn = origin === "DINE_IN" && !tablePublicCode;

  const originLabel =
    formatOriginLabel(origin, tableNumber) ?? "Origen pendiente";

  // --------------------------------------------------
  // Detectar el tipo de URL de Food360.
  // Subdominio: restaurant.food360.com/cart -> /menu
  // Ruta tradicional: food360.com/restaurant/cart -> /restaurant/menu
  // --------------------------------------------------

  useEffect(() => {
    if (!slug || slug === "demo") {
      setMenuHref("/menu");
      return;
    }

    const slugPrefix = `/${encodeURIComponent(slug)}`;
    const currentPath = window.location.pathname;

    const isSlugBasedRoute =
      currentPath === slugPrefix || currentPath.startsWith(`${slugPrefix}/`);

    setMenuHref(isSlugBasedRoute ? `${slugPrefix}/menu` : "/menu");
  }, [slug]);

  // --------------------------------------------------
  // Consultar los horarios públicos del restaurante.
  // GET /api/v1/public/restaurants/:slug/schedule
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadRestaurantSchedule() {
      if (!tenantReady) return;

      setIsScheduleLoading(true);
      setScheduleError(null);
      setRestaurantTimezone(null);
      setRestaurantSchedules([]);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim().replace(
        /\/+$/,
        "",
      );

      if (!apiBaseUrl) {
        setScheduleError(
          "No está configurada la URL de la API del restaurante.",
        );
        setIsScheduleLoading(false);
        return;
      }

      if (!slug || slug === "demo") {
        setScheduleError(
          "No se pudo identificar el restaurante para consultar sus horarios.",
        );
        setIsScheduleLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiBaseUrl}/public/restaurants/${encodeURIComponent(slug)}/schedule`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          },
        );

        let responseBody: unknown;

        try {
          responseBody = await response.json();
        } catch {
          responseBody = null;
        }

        if (!response.ok) {
          const message =
            isRecord(responseBody) && typeof responseBody.error === "string"
              ? responseBody.error
              : "No se pudieron consultar los horarios del restaurante.";

          throw new Error(message);
        }

        if (!isRecord(responseBody)) {
          throw new Error(
            "El servidor devolvió una respuesta de horarios no válida.",
          );
        }

        const envelope = responseBody as PublicScheduleResponse;
        const data = envelope.data;

        if (envelope.success !== true || !data) {
          throw new Error(
            envelope.error ??
              "No se pudieron obtener los horarios del restaurante.",
          );
        }

        if (typeof data.timezone !== "string" || !data.timezone.trim()) {
          throw new Error(
            "El restaurante no tiene una zona horaria configurada.",
          );
        }

        const normalizedSchedules = normalizeSchedules(data.schedules);

        if (normalizedSchedules.length === 0) {
          throw new Error(
            "El restaurante todavía no tiene horarios de atención configurados.",
          );
        }

        // Comprobar que el navegador reconoce la zona horaria recibida.
        try {
          new Intl.DateTimeFormat("en-US", {
            timeZone: data.timezone,
          }).format(new Date());
        } catch {
          throw new Error(
            "La zona horaria configurada para el restaurante no es válida.",
          );
        }

        if (cancelled) return;

        setRestaurantTimezone(data.timezone);
        setRestaurantSchedules(normalizedSchedules);
      } catch (error) {
        if (cancelled) return;

        console.error("Error al consultar horarios del restaurante:", error);

        setScheduleError(
          error instanceof Error
            ? error.message
            : "No se pudieron consultar los horarios del restaurante.",
        );
      } finally {
        if (!cancelled) {
          setIsScheduleLoading(false);
        }
      }
    }

    void loadRestaurantSchedule();

    return () => {
      cancelled = true;
    };
  }, [tenantReady, slug]);

  // --------------------------------------------------
  // Validación del pedido programado.
  // --------------------------------------------------

  const scheduledValidationMessage = isScheduledDineIn
    ? isScheduleLoading
      ? "Consultando los horarios del restaurante..."
      : scheduleError
        ? scheduleError
        : getScheduledTimeValidationError(
            scheduledForLocal ?? "",
            restaurantTimezone,
            restaurantSchedules,
          )
    : null;

  const isScheduledOrderValid =
    !isScheduledDineIn ||
    (!isScheduleLoading &&
      !scheduleError &&
      scheduledValidationMessage === null);

  const pageAnimation = shouldReduceMotion ? false : { opacity: 0, y: 10 };

  const pageTransition = {
    duration: shouldReduceMotion ? 0 : 0.3,
    ease: "easeOut" as const,
  };

  const tapAnimation = shouldReduceMotion ? undefined : { scale: 0.97 };

  // --------------------------------------------------
  // Enviar pedido
  // --------------------------------------------------

  const handleSendOrder = async () => {
    if (isSubmitting) return;

    if (!isReady) {
      alert(
        "Estamos validando el restaurante. Espera un momento e inténtalo de nuevo.",
      );
      return;
    }

    if (!restaurantPublicId) {
      alert("No se pudo identificar el restaurante. Vuelve a abrir la carta.");
      return;
    }

    if (origin === "UNKNOWN") {
      alert("Selecciona una modalidad para continuar.");
      return;
    }

    if (items.length === 0) return;

    if (isScheduledDineIn && !isScheduledOrderValid) {
      alert(
        scheduleError ??
          scheduledValidationMessage ??
          "Selecciona una fecha y hora válida para tu llegada.",
      );
      return;
    }

    if (!hasCustomerData || !customerData) {
      setShowCustomerModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      const scheduledValue = isScheduledDineIn ? scheduledForLocal : null;

      const result = await submitOrder(
        restaurantPublicId,
        items,
        customerData,
        origin,
        tablePublicCode,
        scheduledValue,
      );

      setSubmittedScheduledForLocal(scheduledValue);
      setSubmittedOrder(result);

      clearCart();
    } catch (error) {
      console.error("Error al enviar pedido:", error);

      alert(
        error instanceof Error
          ? error.message
          : "No pudimos registrar tu pedido. Por favor, inténtalo nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // 1. Pedido registrado
  // --------------------------------------------------

  if (submittedOrder) {
    const submittedLabel =
      formatOriginLabel(submittedOrder.origin, submittedOrder.tableNumber) ??
      "Origen pendiente";

    return (
      <motion.main
        initial={pageAnimation}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="flex min-h-screen w-full justify-center bg-(--color-bg-base) px-4 py-8 text-(--color-text-body) sm:px-6 sm:py-12"
      >
        <div className="my-auto w-full max-w-xl">
          <div className="mb-7 text-center">
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.35,
                ease: "easeOut",
              }}
              className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-forest)"
            >
              <CircleCheck size={32} strokeWidth={1.5} />
            </motion.div>

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-forest)">
              Pedido registrado
            </span>

            <h1 className="mt-2 font-editorial-serif text-3xl font-medium tracking-tight text-(--color-text-primary) sm:text-4xl">
              ¡Todo listo!
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-(--color-text-muted)">
              Tu pedido fue recibido correctamente. Guarda el código de orden
              para cualquier consulta con el restaurante.
            </p>
          </div>

          <motion.section
            initial={pageAnimation}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.35,
              delay: shouldReduceMotion ? 0 : 0.08,
            }}
            className="overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-surface)"
            aria-label="Comprobante del pedido"
          >
            <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-text-subtle)">
                  Comprobante
                </p>

                <h2 className="mt-1 font-editorial-serif text-lg font-medium text-(--color-text-primary)">
                  Resumen de orden
                </h2>
              </div>

              <ReceiptText
                size={21}
                strokeWidth={1.5}
                className="text-(--color-text-muted)"
              />
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-lg border border-(--color-border) bg-(--color-bg-base) p-3.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-(--color-text-muted)">
                  Código de orden
                </p>

                <p className="mt-1 break-all font-mono text-sm font-semibold tracking-wide text-(--color-text-primary)">
                  {submittedOrder.id}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-(--color-text-subtle)">
                    Comensal
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-(--color-text-primary)">
                    {submittedOrder.customer.nombre}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-(--color-text-subtle)">
                    Procedencia
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-(--color-text-primary)">
                    {submittedLabel}
                  </p>
                </div>

                {submittedScheduledForLocal && (
                  <div className="col-span-2 rounded-lg border border-(--color-border) bg-(--color-bg-base) p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-(--color-text-muted)">
                      Llegada estimada
                    </p>

                    <p className="mt-1 text-sm font-semibold text-(--color-text-primary)">
                      {formatLocalDateTimeForDisplay(
                        submittedScheduledForLocal,
                      )}
                    </p>

                    <p className="mt-1 text-[10px] text-(--color-text-muted)">
                      Hora local del restaurante
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-(--color-border) pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
                    Detalle del pedido
                  </p>

                  <span className="text-[10px] text-(--color-text-subtle)">
                    {submittedOrder.itemCount} unidades
                  </span>
                </div>

                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {submittedOrder.items.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 text-(--color-text-body)">
                        <span className="font-semibold text-(--color-text-primary)">
                          {item.quantity}×
                        </span>{" "}
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-(--color-border) pt-4">
                <span className="text-sm font-semibold text-(--color-text-primary)">
                  Total del pedido
                </span>

                <span className="font-editorial-serif text-2xl font-semibold text-(--color-text-primary)">
                  {formatCurrency(submittedOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-(--color-border) bg-(--color-bg-base) px-5 py-3">
              <Check size={14} className="shrink-0 text-(--color-forest)" />

              <p className="text-[11px] text-(--color-text-muted)">
                El restaurante ha recibido tu solicitud.
              </p>
            </div>
          </motion.section>

          <Link
            href={menuHref}
            className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-(--color-accent-terracotta) px-5 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
          >
            Volver a la carta
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.main>
    );
  }

  // --------------------------------------------------
  // 2. No hay restaurante activo
  // --------------------------------------------------

  if (tenantStatus === "missing") {
    return (
      <motion.main
        initial={pageAnimation}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-5 py-10 text-center"
      >
        <div className="w-full max-w-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-muted)">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>

          <h1 className="font-editorial-serif text-2xl font-medium text-(--color-text-primary)">
            Restaurante no identificado
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-(--color-text-muted)">
            Para continuar, abre la carta desde el enlace o el código QR del
            restaurante.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--color-accent-terracotta) px-6 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90"
          >
            Ir al inicio
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.main>
    );
  }

  // --------------------------------------------------
  // 3. Validando restaurante y sesión
  // --------------------------------------------------

  if (!isReady) {
    return (
      <motion.main
        initial={pageAnimation}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-5"
      >
        <div
          className="flex max-w-xs flex-col items-center text-center"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            size={30}
            strokeWidth={1.6}
            className="animate-spin text-(--color-accent-terracotta)"
          />

          <h1 className="mt-5 font-editorial-serif text-xl font-medium text-(--color-text-primary)">
            Preparando tu comanda
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-(--color-text-muted)">
            Estamos verificando la información del restaurante y tu sesión.
          </p>
        </div>
      </motion.main>
    );
  }

  // --------------------------------------------------
  // 4. Carrito vacío
  // --------------------------------------------------

  if (items.length === 0) {
    return (
      <motion.main
        initial={pageAnimation}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="flex min-h-screen items-center justify-center bg-(--color-bg-base) px-5 py-10 text-center"
      >
        <div className="w-full max-w-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-bg-surface) text-(--color-text-muted)">
            <ShoppingBag size={29} strokeWidth={1.5} />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-(--color-text-subtle)">
            Tu selección
          </span>

          <h1 className="mt-2 font-editorial-serif text-2xl font-medium text-(--color-text-primary)">
            Aún no tienes productos
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-(--color-text-muted)">
            Explora nuestra carta y añade los platos que te gustaría disfrutar.
          </p>

          <Link
            href={menuHref}
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-(--color-accent-terracotta) px-6 text-sm font-semibold text-white no-underline transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
          >
            Explorar la carta
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.main>
    );
  }

  // --------------------------------------------------
  // 5. Carrito y revisión del pedido
  // --------------------------------------------------

  return (
    <>
      <motion.main
        initial={pageAnimation}
        animate={{ opacity: 1, y: 0 }}
        transition={pageTransition}
        className="min-h-screen w-full bg-(--color-bg-base) px-4 pb-12 pt-5 text-(--color-text-body) sm:px-6 sm:pt-8 lg:px-8"
      >
        <div className="mx-auto w-full max-w-6xl">
          {/* Encabezado */}
          <header className="mb-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <Link
                href={menuHref}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg pr-2 text-xs font-medium text-(--color-text-muted) no-underline transition-colors hover:text-(--color-text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
              >
                <ArrowLeft size={16} strokeWidth={1.8} />
                Volver a la carta
              </Link>

              <span
                className="inline-flex max-w-[55%] items-center gap-1.5 truncate rounded-full border border-(--color-border) bg-(--color-bg-surface) px-3 py-1.5 text-[10px] font-medium text-(--color-text-muted)"
                title={originLabel}
              >
                <MapPin
                  size={12}
                  className="shrink-0 text-(--color-accent-terracotta)"
                />

                <span className="truncate">{originLabel}</span>
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--color-accent-terracotta)">
                  FOOD · ORDER · ENJOY
                </p>

                <h1 className="font-editorial-serif text-3xl font-medium tracking-tight text-(--color-text-primary) sm:text-4xl">
                  Tu comanda
                </h1>

                <p className="mt-1.5 text-sm text-(--color-text-muted)">
                  Revisa tu selección antes de enviar el pedido.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 text-xs text-(--color-text-muted)">
                <ShoppingBag size={15} strokeWidth={1.7} />

                <span>
                  {totalItems} {totalItems === 1 ? "producto" : "productos"}
                </span>
              </div>
            </div>
          </header>

          {/* Contenido: vertical en móviles y tablets.
              Dos columnas únicamente en pantallas 2XL. */}
          <div className="grid items-start gap-6">
            {/* Selección de productos */}
            <section aria-labelledby="cart-items-heading" className="min-w-0">
              <div className="mb-3">
                <h2
                  id="cart-items-heading"
                  className="font-editorial-serif text-xl font-medium text-(--color-text-primary)"
                >
                  Tu selección
                </h2>

                <p className="mt-0.5 text-xs text-(--color-text-muted)">
                  Ajusta las cantidades o elimina productos.
                </p>
              </div>

              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.article
                      key={item.menuItem.id}
                      layout
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 10 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        shouldReduceMotion
                          ? undefined
                          : { opacity: 0, scale: 0.98 }
                      }
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.2,
                      }}
                      className="flex gap-3 rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-3 sm:gap-4 sm:p-4"
                    >
                      <div className="relative size-19 shrink-0 overflow-hidden rounded-lg border border-(--color-border) bg-(--color-bg-subtle) sm:size-24">
                        <Image
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          fill
                          sizes="(max-width: 640px) 76px, 96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-editorial-serif text-[15px] font-medium leading-tight text-(--color-text-primary) sm:text-base">
                              {item.menuItem.name}
                            </h3>

                            <p className="mt-1 text-[11px] text-(--color-text-muted)">
                              {formatCurrency(item.menuItem.price)} por unidad
                            </p>
                          </div>

                          <motion.button
                            type="button"
                            whileTap={tapAnimation}
                            onClick={() => removeItem(item.menuItem.id)}
                            aria-label={`Eliminar ${item.menuItem.name}`}
                            title="Eliminar producto"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-(--color-text-subtle) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-accent-terracotta) focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--color-accent-terracotta)"
                          >
                            <Trash2 size={15} strokeWidth={1.7} />
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="inline-flex h-9 items-center rounded-lg border border-(--color-border) bg-(--color-bg-base)">
                            <motion.button
                              type="button"
                              whileTap={tapAnimation}
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity - 1,
                                )
                              }
                              disabled={item.quantity <= 1}
                              aria-label={`Reducir cantidad de ${item.menuItem.name}`}
                              className="flex size-9 items-center justify-center rounded-l-lg text-(--color-text-muted) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary) disabled:cursor-not-allowed disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </motion.button>

                            <span
                              aria-live="polite"
                              className="min-w-7 text-center text-xs font-semibold tabular-nums text-(--color-text-primary)"
                            >
                              {item.quantity}
                            </span>

                            <motion.button
                              type="button"
                              whileTap={tapAnimation}
                              onClick={() =>
                                updateQuantity(
                                  item.menuItem.id,
                                  item.quantity + 1,
                                )
                              }
                              aria-label={`Aumentar cantidad de ${item.menuItem.name}`}
                              className="flex size-9 items-center justify-center rounded-r-lg text-(--color-text-muted) transition-colors hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary)"
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>

                          <span className="shrink-0 text-sm font-semibold tabular-nums text-(--color-text-primary)">
                            {formatCurrency(
                              item.menuItem.price * item.quantity,
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>

              <Link
                href={menuHref}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-xs font-medium text-(--color-accent-terracotta) no-underline transition-opacity hover:opacity-75"
              >
                <Plus size={14} />
                Añadir más productos
              </Link>
            </section>

            {/* Panel de información y confirmación */}
            <aside className="flex min-w-0 flex-col gap-4 2xl:sticky 2xl:top-6">
              {/* Modalidad */}
              <OrderOriginSelector
                origin={origin}
                tableNumber={tableNumber}
                tablePublicCode={tablePublicCode}
                scheduledForLocal={scheduledForLocal}
                restaurantTimezone={restaurantTimezone}
                schedules={restaurantSchedules}
                isScheduleLoading={isScheduleLoading}
                scheduleError={scheduleError}
                scheduleValidationMessage={scheduledValidationMessage}
                onChange={setOrderOrigin}
                onScheduledForLocalChange={setScheduledForLocal}
              />

              {/* Datos del comensal */}
              <section className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-(--color-text-subtle)">
                      Información
                    </p>

                    <h2 className="mt-1 font-editorial-serif text-lg font-medium text-(--color-text-primary)">
                      Datos del comensal
                    </h2>
                  </div>

                  <div className="flex size-9 items-center justify-center rounded-lg bg-(--color-bg-subtle) text-(--color-text-muted)">
                    <UserRound size={17} strokeWidth={1.7} />
                  </div>
                </div>

                {hasCustomerData && customerData ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-(--color-text-primary)">
                      {customerData.nombre}
                    </p>

                    <div className="space-y-2 border-t border-(--color-border) pt-3">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-(--color-text-muted)">
                          Cédula
                        </span>

                        <span className="font-medium text-(--color-text-primary)">
                          {customerData.cedula}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-(--color-text-muted)">
                          Teléfono
                        </span>

                        <span className="font-medium text-(--color-text-primary)">
                          {customerData.telefono}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-(--color-border) bg-(--color-bg-base) p-3">
                    <p className="text-xs font-medium text-(--color-text-primary)">
                      Completa tus datos de contacto
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-(--color-text-muted)">
                      Los necesitamos para identificar y procesar tu pedido.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-(--color-border) bg-(--color-bg-base) px-3 text-xs font-medium text-(--color-text-primary) transition-colors hover:border-(--color-border-dark) hover:bg-(--color-bg-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta)"
                >
                  <UserRound size={14} />

                  {hasCustomerData
                    ? "Editar información"
                    : "Completar información"}
                </button>
              </section>

              {/* Resumen económico */}
              <section className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-editorial-serif text-lg font-medium text-(--color-text-primary)">
                    Resumen del pedido
                  </h2>

                  <ReceiptText
                    size={18}
                    strokeWidth={1.6}
                    className="text-(--color-text-muted)"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-(--color-text-muted)">Productos</span>

                    <span className="font-medium tabular-nums text-(--color-text-primary)">
                      {totalItems}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-(--color-text-muted)">Subtotal</span>

                    <span className="font-medium tabular-nums text-(--color-text-primary)">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  <div className="border-t border-(--color-border) pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-(--color-text-primary)">
                          Total estimado
                        </p>

                        <p className="mt-1 text-[10px] text-(--color-text-muted)">
                          Sujeto a confirmación del restaurante
                        </p>
                      </div>

                      <span className="shrink-0 font-editorial-serif text-2xl font-semibold tabular-nums text-(--color-text-primary)">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirmar */}
                <motion.button
                  type="button"
                  whileTap={tapAnimation}
                  onClick={handleSendOrder}
                  disabled={
                    isSubmitting ||
                    !isReady ||
                    origin === "UNKNOWN" ||
                    (isScheduledDineIn && !isScheduledOrderValid)
                  }
                  aria-busy={isSubmitting}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-(--color-accent-terracotta) px-4 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Registrando pedido...
                    </>
                  ) : origin === "UNKNOWN" ? (
                    <>
                      Selecciona una modalidad
                      <MapPin size={16} />
                    </>
                  ) : isScheduledDineIn && !isScheduledOrderValid ? (
                    <>
                      Selecciona fecha y hora
                      <Clock3 size={16} />
                    </>
                  ) : !hasCustomerData ? (
                    <>
                      Completar datos
                      <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      Confirmar pedido
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                <div className="mt-3 flex items-start justify-center gap-1.5">
                  <Clock3
                    size={12}
                    className="mt-0.5 shrink-0 text-(--color-text-subtle)"
                  />

                  <p className="text-center text-[10px] leading-relaxed text-(--color-text-subtle)">
                    El restaurante recibirá tu solicitud para revisar y
                    confirmar el pedido.
                  </p>
                </div>
              </section>
            </aside>
          </div>

          <footer className="mt-10 border-t border-(--color-border) pt-5 text-center">
            <p className="font-editorial-serif text-sm font-medium text-(--color-text-primary)">
              {slug && slug !== "demo"
                ? "Tu experiencia gastronómica"
                : "Food360"}
            </p>

            <p className="mt-1 text-[10px] text-(--color-text-subtle)">
              Revisa tu selección antes de confirmar.
            </p>
          </footer>
        </div>
      </motion.main>

      {/* Formulario del comensal */}
      <CustomerForm
        isOpen={showCustomerModal}
        onSubmit={(data) => {
          setCustomerData(data);
          setShowCustomerModal(false);
        }}
      />
    </>
  );
}
