"use client";

import { Download, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";

interface OrdersHeaderProps {
  onExportCSV: () => void;
  onCreateOrder: () => void;
  canCreateOrder?: boolean;
}

export function OrdersHeader({
  onExportCSV,
  onCreateOrder,
  canCreateOrder = true,
}: OrdersHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border/60 pb-6 xl:flex-row xl:items-center xl:justify-between">
      {/* Título y contexto */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Historial y Gestión de Pedidos
          </h1>
        </div>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Consulta las comandas, supervisa su estado y gestiona los pedidos de
          tu restaurante desde un solo lugar.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/kds"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Pantalla KDS</span>
        </Link>

        <button
          type="button"
          onClick={onExportCSV}
          className="inline-flex items-center justify-center cursor-pointer gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </button>

        {canCreateOrder && (
          <button
            type="button"
            onClick={onCreateOrder}
            className="inline-flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 rounded-lg bg-accent text-accent-foreground font-semibold text-xs hover:opacity-90 transition-all duration-200 shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva orden</span>
          </button>
        )}
      </div>
    </header>
  );
}
