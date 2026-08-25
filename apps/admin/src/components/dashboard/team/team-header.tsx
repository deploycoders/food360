"use client";

import React from "react";
import { UserPlus } from "lucide-react";

interface TeamHeaderProps {
  onOpenInviteModal: () => void;
}

export function TeamHeader({ onOpenInviteModal }: TeamHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Equipo y Permisos de Acceso
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Administra los roles, permisos de cocina KDS, toma de comandas y caja.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenInviteModal}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 self-start sm:self-auto"
      >
        <UserPlus className="w-4 h-4" />
        <span>Invitar Personal</span>
      </button>
    </div>
  );
}
