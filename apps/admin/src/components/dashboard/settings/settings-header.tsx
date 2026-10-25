"use client";

import React from "react";
import { Store } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Store className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Configuración del Restaurante
          </h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Perfil del local, horarios de atención y página pública.
        </p>
      </div>

    </div>
  );
}
