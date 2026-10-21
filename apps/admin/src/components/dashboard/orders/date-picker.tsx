"use client";

import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

import {
  DatePickerMode,
  type DateSelectionMode,
} from "./date-picker/date-picker-mode";
import { DatePickerCalendar } from "./date-picker/date-picker-calendar";

interface DatePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

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

export function OrdersDatePicker({
  startDate,
  endDate,
  onChange,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectionMode, setSelectionMode] =
    useState<DateSelectionMode>("range");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSelectingRangeEnd, setIsSelectingRangeEnd] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const parsedStart = parseDate(startDate);
  const parsedEnd = parseDate(endDate);

  const selectedRange: DateRange | undefined =
    parsedStart || parsedEnd ? { from: parsedStart, to: parsedEnd } : undefined;

  const selectedDate = parsedStart ?? parsedEnd;
  const hasDate = Boolean(startDate || endDate);

  // Sincroniza el borrador cuando cambian las fechas aplicadas.
  useEffect(() => {
    const from = parseDate(startDate);
    const to = parseDate(endDate);

    setDateRange(from || to ? { from, to } : undefined);
    setIsSelectingRangeEnd(false);
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
    setIsSelectingRangeEnd(false);
    onChange({ startDate: "", endDate: "" });
    setOpen(false);
  }

  function handleModeChange(mode: DateSelectionMode) {
    setSelectionMode(mode);
    setIsSelectingRangeEnd(false);

    // En modo rango se comienza una nueva selección, sin modificar
    // las fechas aplicadas ni perder su referencia visual.
    setDateRange(mode === "range" ? undefined : selectedRange);
  }

  function handleSingleSelect(date: Date | undefined) {
    if (!date) return;

    const formatted = formatDate(date);

    setDateRange({ from: date, to: date });
    setIsSelectingRangeEnd(false);

    onChange({
      startDate: formatted,
      endDate: formatted,
    });

    // En modo individual, una selección completa cierra el calendario.
    setOpen(false);
  }

  function handleRangeSelect(range: DateRange | undefined, triggerDate?: Date) {
    // Primer clic: establece únicamente el inicio del nuevo rango.
    // El calendario permanece abierto para seleccionar el final.
    if (!isSelectingRangeEnd) {
      const from = triggerDate ?? range?.from;

      if (!from) return;

      setDateRange({
        from,
        to: undefined,
      });

      setIsSelectingRangeEnd(true);
      return;
    }

    // Todavía falta el día final; seguimos esperando.
    if (!range?.from || !range?.to) {
      setDateRange(range);
      return;
    }

    let from = range.from;
    let to = range.to;

    // Garantiza que la fecha inicial no sea posterior a la final.
    if (from.getTime() > to.getTime()) {
      [from, to] = [to, from];
    }

    setDateRange({ from, to });
    setIsSelectingRangeEnd(false);

    onChange({
      startDate: formatDate(from),
      endDate: formatDate(to),
    });

    // Solo se cierra cuando se completa el rango.
    setOpen(false);
  }

  function handleToggleCalendar() {
    if (!open) {
      setIsSelectingRangeEnd(false);

      if (selectionMode === "range") {
        // Evita que el rango previamente aplicado interfiera
        // con el primer clic de la nueva selección.
        setDateRange(undefined);
      } else {
        setDateRange(selectedRange);
      }
    }

    setOpen((current) => !current);
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <div className="relative">
        <button
          type="button"
          onClick={handleToggleCalendar}
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
          <DatePickerMode
            selectionMode={selectionMode}
            onModeChange={handleModeChange}
          />

          <p className="mb-2 text-xs text-muted-foreground">
            {selectionMode === "single"
              ? "Selecciona el día que quieres consultar."
              : isSelectingRangeEnd
                ? "Ahora selecciona el día final."
                : "Selecciona el día inicial y después el día final."}
          </p>

          <DatePickerCalendar
            selectionMode={selectionMode}
            selectedDate={selectedDate}
            dateRange={dateRange}
            appliedRange={selectedRange}
            showAppliedRange={!isSelectingRangeEnd}
            onSingleSelect={handleSingleSelect}
            onRangeSelect={handleRangeSelect}
          />

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
