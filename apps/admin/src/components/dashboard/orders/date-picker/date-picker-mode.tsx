"use client";

import React from "react";
import { CalendarDays, CalendarRange } from "lucide-react";

export type DateSelectionMode = "single" | "range";

interface DatePickerModeProps {
  selectionMode: DateSelectionMode;
  onModeChange: (mode: DateSelectionMode) => void;
}

export function DatePickerMode({
  selectionMode,
  onModeChange,
}: DatePickerModeProps) {
  return (
    <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
      <button
        type="button"
        onClick={() => onModeChange("single")}
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
        onClick={() => onModeChange("range")}
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
  );
}
