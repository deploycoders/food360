"use client";

import React from "react";
import { Save, Loader2, Store } from "lucide-react";

interface SettingsHeaderProps {
  isSaving: boolean;
  onSave: () => void;
  hasChanges?: boolean;
}

export function SettingsHeader({
  isSaving,
  onSave,
  hasChanges = true,
}: SettingsHeaderProps) {
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
          Ajustes generales del local, horarios de atención, parámetros fiscales
          y mesas con códigos QR.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={isSaving || !hasChanges}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Guardar Ajustes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
