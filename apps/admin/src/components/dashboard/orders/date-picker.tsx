"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  DayPicker,
  type DateRange,
  type CustomComponents,
} from "react-day-picker";
import { es } from "date-fns/locale";
import { format, parseISO, isValid } from "date-fns";
import "react-day-picker/style.css";

interface DatePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

type DateSelectionMode = "single" | "range";

function formatDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;

  const date = parseISO(value);

  return isValid(date) ? date : undefined;
}

function formatDisplayDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: es });
}

const calendarComponents: Partial<CustomComponents> = {
  Chevron: ({ orientation, className, size }) => {
    const iconSize = size ?? 16;

    if (orientation === "left") {
      return <ChevronLeft className={className} size={iconSize} />;
    }

    return <ChevronRight className={className} size={iconSize} />;
  },
};

const calendarClassNames = {
  root: "w-full space-y-3",
  months: "flex flex-col w-full",
  // 1. Hacemos que el mes sea el contenedor de referencia (relative)
  month: "w-full space-y-3 relative",

  // 2. Definimos una altura fija (h-9) y centramos verticalmente el texto del mes
  month_caption: "flex h-9 items-center justify-center",
  caption_label: "text-sm font-semibold capitalize text-foreground",

  // 3. La barra de navegación ocupa la misma altura (h-9), se alinea arriba (top-0)
  // y usa items-center para que los botones queden centrados en esa misma línea.
  nav: "absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between px-2 pointer-events-none",

  button_previous:
    "pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted",
  button_next:
    "pointer-events-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted",

  month_grid: "w-full border-collapse",
  weekdays: "mb-1 grid w-full grid-cols-7",
  weekday:
    "flex h-8 w-full items-center justify-center text-xs font-medium text-muted-foreground",
  week: "my-0.5 grid w-full grid-cols-7",
  day: "relative mx-auto flex h-9 w-9 items-center justify-center p-0 text-center text-sm",
  day_button:
    "flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  range_start:
    "[&>button]:rounded-l-lg [&>button]:bg-accent [&>button]:font-semibold [&>button]:text-accent-foreground",
  range_end:
    "[&>button]:rounded-r-lg [&>button]:bg-accent [&>button]:font-semibold [&>button]:text-accent-foreground",
  range_middle:
    "[&>button]:rounded-none [&>button]:bg-accent/15 [&>button]:text-foreground",
  selected:
    "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
  today: "[&>button]:border [&>button]:border-accent",
  outside: "text-muted-foreground/30",
  disabled: "text-muted-foreground/20",
};

export function OrdersDatePicker({
  startDate,
  endDate,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] =
    useState<DateSelectionMode>("range");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const containerRef = useRef<HTMLDivElement>(null);

  const parsedStart = parseDate(startDate);
  const parsedEnd = parseDate(endDate);

  const selectedRange: DateRange | undefined =
    parsedStart || parsedEnd ? { from: parsedStart, to: parsedEnd } : undefined;

  const hasDate = Boolean(startDate || endDate);

  useEffect(() => {
    setDateRange(selectedRange);
  }, [startDate, endDate]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const displayValue = (() => {
    if (parsedStart && parsedEnd) {
      if (startDate === endDate) {
        return formatDisplayDate(parsedStart);
      }

      return `${formatDisplayDate(parsedStart)} – ${formatDisplayDate(
        parsedEnd,
      )}`;
    }

    if (parsedStart) {
      return `Desde ${formatDisplayDate(parsedStart)}`;
    }

    if (parsedEnd) {
      return `Hasta ${formatDisplayDate(parsedEnd)}`;
    }

    return "Todas las fechas";
  })();

  function clearDates() {
    setDateRange(undefined);
    onChange({ startDate: "", endDate: "" });
    setOpen(false);
  }

  function handleModeChange(mode: DateSelectionMode) {
    setSelectionMode(mode);

    // El rango aplicado no se modifica al cambiar de modo.
    // La selección temporal se reinicia al abrir el calendario.
    setDateRange(undefined);
  }

  function handleSingleSelect(date: Date | undefined) {
    if (!date) return;

    const formatted = formatDate(date);

    setDateRange({ from: date, to: date });
    onChange({
      startDate: formatted,
      endDate: formatted,
    });

    setOpen(false);
  }

  function handleRangeSelect(range: DateRange | undefined) {
    setDateRange(range);

    // El calendario permanece abierto hasta elegir el día final.
    if (!range?.from || !range?.to) return;

    let from = range.from;
    let to = range.to;

    // Normalizar el orden por si las fechas llegan invertidas.
    if (from.getTime() > to.getTime()) {
      [from, to] = [to, from];
    }

    onChange({
      startDate: formatDate(from),
      endDate: formatDate(to),
    });

    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      {" "}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!open) {
              setDateRange(selectedRange);
            }

            setOpen((current) => !current);
          }}
          aria-expanded={open}
          aria-haspopup="dialog"
          className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3 pr-10 text-sm text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:w-65"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />

          <span className="flex-1 truncate text-left">{displayValue}</span>
        </button>

        {hasDate && (
          <button
            type="button"
            aria-label="Limpiar fechas"
            title="Limpiar fechas"
            onClick={clearDates}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div
          role="dialog"
          aria-label="Seleccionar fechas de pedidos"
          className="absolute right-0 z-50 mt-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card p-3 text-foreground shadow-xl sm:w-[320px]"
        >
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => handleModeChange("single")}
              aria-pressed={selectionMode === "single"}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors ${
                selectionMode === "single"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              Un día
            </button>

            <button
              type="button"
              onClick={() => handleModeChange("range")}
              aria-pressed={selectionMode === "range"}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors ${
                selectionMode === "range"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarRange className="h-4 w-4" />
              Rango
            </button>
          </div>

          <p className="mb-2 text-xs text-muted-foreground">
            {selectionMode === "single"
              ? "Selecciona el día que quieres consultar."
              : "Selecciona el día inicial y después el día final."}
          </p>

          {selectionMode === "single" ? (
            <DayPicker
              mode="single"
              locale={es}
              captionLayout="label"
              selected={parsedStart}
              onSelect={handleSingleSelect}
              showOutsideDays
              fixedWeeks
              className="w-full"
              classNames={calendarClassNames}
              components={calendarComponents}
            />
          ) : (
            <DayPicker
              mode="range"
              locale={es}
              captionLayout="label"
              selected={dateRange}
              onSelect={handleRangeSelect}
              showOutsideDays
              fixedWeeks
              className="w-full"
              classNames={calendarClassNames}
              components={calendarComponents}
            />
          )}

          <div className="mt-2 border-t border-border pt-2">
            <button
              type="button"
              onClick={clearDates}
              className="w-full rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
            >
              Mostrar todas las fechas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
