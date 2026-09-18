"use client";

import React from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface MenuHeaderProps {
  onOpenNewDishModal: () => void;
}

export function MenuHeader({ onOpenNewDishModal }: MenuHeaderProps) {
  return (
    <header className="pb-5">
      <div className="flex flex-col md:flex-row md:w-full md:justify-between gap-5">
        {/* ─────────────────────────────────────────────
            Information
        ───────────────────────────────────────────── */}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Gestión de Carta y Menú
          </h1>

          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Administra los platillos, precios, descripciones y disponibilidad de
            tu restaurante.
          </p>
        </div>

        {/* ─────────────────────────────────────────────
            Actions
        ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 min-[700px]:flex-row min-[700px]:items-center">
          {/* Secondary action */}
          <Link
            href="/menu/disponibility"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted px-3.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-muted/80 active:scale-[0.98] min-[700px]:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

            <span>Disponibilidad de productos</span>
          </Link>

          {/* Primary action */}
          <button
            type="button"
            onClick={onOpenNewDishModal}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 text-xs font-semibold text-accent-foreground shadow-md shadow-accent/20 transition-all duration-200 hover:opacity-95 active:scale-[0.98] min-[700px]:w-auto"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />

            <span>Nuevo Platillo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
