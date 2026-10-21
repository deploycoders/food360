"use client";

import React from "react";
import {
  DayPicker,
  type DateRange,
  type CustomComponents,
} from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { es } from "date-fns/locale";
import type { DateSelectionMode } from "./date-picker-mode";

interface DatePickerCalendarProps {
  selectionMode: DateSelectionMode;
  selectedDate: Date | undefined;
  dateRange: DateRange | undefined;
  appliedRange: DateRange | undefined;
  showAppliedRange: boolean;
  onSingleSelect: (date: Date | undefined) => void;
  onRangeSelect: (range: DateRange | undefined, triggerDate?: Date) => void;
}

const calendarComponents: Partial<CustomComponents> = {
  Chevron: ({ orientation, className, size }) => {
    const iconSize = size ?? 16;

    return orientation === "left" ? (
      <ChevronLeft className={className} size={iconSize} />
    ) : (
      <ChevronRight className={className} size={iconSize} />
    );
  },
};

const calendarClassNames = {
  root: "relative w-full space-y-3",

  // La navegación se posiciona respecto a este contenedor.
  months: "relative flex w-full flex-col",
  month: "w-full space-y-3",

  // Título centrado en una fila de altura fija.
  month_caption: "flex h-9 items-center justify-center",
  caption_label: "text-sm font-semibold capitalize text-foreground",

  // Las flechas comparten la misma altura que el título del mes.
  nav: "pointer-events-none absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-between px-2",

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

export function DatePickerCalendar({
  selectionMode,
  selectedDate,
  dateRange,
  appliedRange,
  showAppliedRange,
  onSingleSelect,
  onRangeSelect,
}: DatePickerCalendarProps) {
  // Mientras no se inicia un nuevo rango, conservamos una referencia
  // visual de las fechas que ya estaban aplicadas.
  const appliedRangeModifiers =
    showAppliedRange && appliedRange?.from && appliedRange?.to
      ? {
          appliedRange: {
            from: appliedRange.from,
            to: appliedRange.to,
          },
        }
      : undefined;

  if (selectionMode === "single") {
    return (
      <DayPicker
        mode="single"
        locale={es}
        captionLayout="label"
        selected={selectedDate}
        onSelect={onSingleSelect}
        showOutsideDays
        fixedWeeks
        className="w-full"
        classNames={calendarClassNames}
        components={calendarComponents}
      />
    );
  }

  return (
    <DayPicker
      mode="range"
      locale={es}
      captionLayout="label"
      selected={dateRange}
      onSelect={onRangeSelect}
      modifiers={appliedRangeModifiers}
      modifiersClassNames={{
        appliedRange: "[&>button]:bg-accent/15 [&>button]:text-foreground",
      }}
      showOutsideDays
      fixedWeeks
      className="w-full"
      classNames={calendarClassNames}
      components={calendarComponents}
    />
  );
}
