"use client";

import { Grid2X2, List } from "lucide-react";

interface ViewModeToggleProps {
  value: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
}

export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex items-center rounded-xl border border-border bg-muted/40 p-1"
      role="group"
      aria-label="Modo de visualización"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-label="Vista de tarjetas"
        aria-pressed={value === "grid"}
        title="Vista de tarjetas"
        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-200 ${
          value === "grid"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Grid2X2 className="h-3.5 w-3.5" />

        <span className="hidden md:inline">Tarjetas</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("list")}
        aria-label="Vista de lista"
        aria-pressed={value === "list"}
        title="Vista de lista"
        className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-all duration-200 ${
          value === "list"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <List className="h-3.5 w-3.5" />

        <span className="hidden md:inline">Lista</span>
      </button>
    </div>
  );
}
