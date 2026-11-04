"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  CalendarClock,
  Check,
  Clock3,
  MapPin,
  ShoppingBag,
  Truck,
  Utensils,
} from "lucide-react";

import type { OrderOrigin } from "@/types";

import {
  getLocalDateTimeInTimezone,
  type RestaurantSchedule,
} from "@/lib/restaurant-schedule";

interface OrderOriginSelectorProps {
  origin: OrderOrigin;
  tableNumber: number | null;
  tablePublicCode: string | null;

  scheduledForLocal: string | null;

  restaurantTimezone: string | null;
  schedules: RestaurantSchedule[];

  isScheduleLoading: boolean;
  scheduleError: string | null;
  scheduleValidationMessage: string | null;

  onChange: (origin: Exclude<OrderOrigin, "UNKNOWN">) => void;
  onScheduledForLocalChange: (value: string | null) => void;
}

const orderOptions = [
  {
    value: "DINE_IN",
    label: "Consumir en el local",
    description:
      "Programa tu llegada al restaurante. No implica reservar una mesa.",
    icon: Utensils,
  },
  {
    value: "TAKEAWAY",
    label: "Para retirar",
    description: "Recoge tu pedido directamente en el restaurante.",
    icon: ShoppingBag,
  },
  {
    value: "DELIVERY",
    label: "A domicilio",
    description: "Recibe tu pedido mediante el servicio de entrega.",
    icon: Truck,
  },
] as const;

export default function OrderOriginSelector({
  origin,
  tableNumber,
  tablePublicCode,
  scheduledForLocal,
  restaurantTimezone,
  schedules,
  isScheduleLoading,
  scheduleError,
  scheduleValidationMessage,
  onChange,
  onScheduledForLocalChange,
}: OrderOriginSelectorProps) {
  const shouldReduceMotion = useReducedMotion();

  const isQrDineIn = origin === "DINE_IN" && Boolean(tablePublicCode);
  const isScheduledDineIn = origin === "DINE_IN" && !tablePublicCode;

  const minDateTime = restaurantTimezone
    ? getLocalDateTimeInTimezone(restaurantTimezone)
    : null;

  return (
    <section
      aria-labelledby="order-origin-heading"
      className="rounded-xl border border-(--color-border) bg-(--color-bg-surface) p-4 sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-(--color-text-subtle)">
            Modalidad
          </p>

          <h2
            id="order-origin-heading"
            className="mt-1 font-editorial-serif text-lg font-medium text-(--color-text-primary)"
          >
            ¿Cómo deseas recibir tu pedido?
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-(--color-text-muted)">
            Selecciona la opción que mejor se adapte a ti.
          </p>
        </div>

        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-subtle) text-(--color-text-muted)">
          <MapPin size={17} strokeWidth={1.7} />
        </div>
      </div>

      {isQrDineIn ? (
        <div className="flex items-center gap-3 rounded-lg border border-(--color-accent-terracotta)/40 bg-(--color-accent-terracotta)/10 p-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-(--color-accent-terracotta) text-white">
            <Utensils size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--color-text-primary)">
              Consumo en el establecimiento
            </p>

            <p className="mt-1 text-xs text-(--color-text-muted)">
              {tableNumber !== null
                ? `Pedido asociado a la mesa ${tableNumber}.`
                : "Pedido asociado a tu mesa mediante QR."}
            </p>
          </div>

          <Check
            size={17}
            className="shrink-0 text-(--color-accent-terracotta)"
          />
        </div>
      ) : (
        <>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {orderOptions.map((option) => {
              const isSelected = origin === option.value;
              const Icon = option.icon;

              return (
                <motion.button
                  key={option.value}
                  type="button"
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  onClick={() => onChange(option.value)}
                  aria-pressed={isSelected}
                  className={`relative flex min-h-25 items-start gap-3 rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent-terracotta) ${
                    isSelected
                      ? "border-(--color-accent-terracotta) bg-(--color-accent-terracotta)/10"
                      : "border-(--color-border) bg-(--color-bg-base) hover:border-(--color-border-dark)"
                  }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isSelected
                        ? "bg-(--color-accent-terracotta) text-white"
                        : "bg-(--color-bg-subtle) text-(--color-text-muted)"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-(--color-text-primary)">
                      {option.label}
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-(--color-text-muted)">
                      {option.description}
                    </p>
                  </div>

                  {isSelected && (
                    <Check
                      size={15}
                      className="absolute right-2.5 top-2.5 text-(--color-accent-terracotta)"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {isScheduledDineIn && (
            <div className="mt-4 rounded-lg border border-(--color-border) bg-(--color-bg-base) p-3.5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--color-bg-subtle) text-(--color-accent-terracotta)">
                  <CalendarClock size={18} strokeWidth={1.7} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--color-text-primary)">
                    ¿A qué hora llegarás?
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-(--color-text-muted)">
                    Indica cuándo planeas llegar para que el restaurante pueda
                    preparar tu pedido.
                  </p>
                </div>
              </div>

              <label
                htmlFor="scheduled-for-local"
                className="mb-2 mt-4 block text-xs font-medium text-(--color-text-primary)"
              >
                Fecha y hora de llegada
              </label>

              <input
                id="scheduled-for-local"
                type="datetime-local"
                value={scheduledForLocal ?? ""}
                min={minDateTime ?? undefined}
                disabled={
                  isScheduleLoading ||
                  Boolean(scheduleError) ||
                  !restaurantTimezone
                }
                onChange={(event) =>
                  onScheduledForLocalChange(event.target.value || null)
                }
                aria-invalid={Boolean(scheduleValidationMessage)}
                aria-describedby="scheduled-for-help scheduled-for-error"
                className="h-11 w-full rounded-lg border border-(--color-border) bg-(--color-bg-surface) px-3 text-sm text-(--color-text-primary) outline-none transition-colors focus:border-(--color-accent-terracotta) focus:ring-2 focus:ring-(--color-accent-terracotta)/15 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div
                id="scheduled-for-help"
                className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-(--color-text-muted)"
              >
                <Clock3 size={12} className="mt-0.5 shrink-0" />

                <p>
                  {isScheduleLoading
                    ? "Consultando los horarios del restaurante..."
                    : restaurantTimezone
                      ? `La hora se interpreta según el horario local del restaurante (${restaurantTimezone}).`
                      : "No se pudo determinar la zona horaria del restaurante."}
                </p>
              </div>

              {scheduleError && (
                <p
                  id="scheduled-for-error"
                  role="alert"
                  className="mt-2 text-xs leading-relaxed text-(--color-accent-terracotta)"
                >
                  {scheduleError}
                </p>
              )}

              {!scheduleError && scheduleValidationMessage && (
                <p
                  id="scheduled-for-error"
                  role="alert"
                  className="mt-2 text-xs leading-relaxed text-(--color-accent-terracotta)"
                >
                  {scheduleValidationMessage}
                </p>
              )}

              {!scheduleError &&
                !scheduleValidationMessage &&
                scheduledForLocal && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-(--color-forest)">
                    <Check size={13} />
                    Horario válido según la jornada del restaurante.
                  </p>
                )}
            </div>
          )}
        </>
      )}

      {!isQrDineIn && origin === "UNKNOWN" && (
        <p className="mt-3 text-[11px] text-(--color-text-muted)">
          Selecciona una modalidad para continuar con tu pedido.
        </p>
      )}

      {schedules.length === 0 &&
        !isScheduleLoading &&
        !scheduleError &&
        isScheduledDineIn && (
          <p className="mt-2 text-[11px] text-(--color-text-muted)">
            No hay horarios disponibles para consultar.
          </p>
        )}
    </section>
  );
}
